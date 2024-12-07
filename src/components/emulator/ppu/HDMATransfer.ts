import { HDMAChannel } from './HDMAController';
import { Memory } from '../Memory';

export class HDMATransfer {
  private memory: Memory;

  constructor(memory: Memory) {
    this.memory = memory;
  }

  public performTransfer(channel: HDMAChannel, scanline: number): number {
    let bytesTransferred = 0;

    if (!channel.enabled || channel.terminated) {
      return bytesTransferred;
    }

    // Get transfer size based on mode
    const transferSize = this.getTransferSize(channel.mode);
    let sourceAddr = channel.sourceAddress;

    // Handle indirect addressing
    if (channel.mode & 0x40) {
      const indirectAddr = this.memory.read(sourceAddr) |
                          (this.memory.read(sourceAddr + 1) << 8);
      sourceAddr = (channel.indirectBank << 16) | indirectAddr;
    }

    // Perform the transfer
    for (let i = 0; i < transferSize; i++) {
      const value = this.memory.read((channel.sourceBank << 16) | (sourceAddr + i));
      this.memory.write(channel.destAddress + i, value);
      bytesTransferred++;
    }

    return bytesTransferred;
  }

  private getTransferSize(mode: number): number {
    const transferMode = mode & 0x07;
    switch (transferMode) {
      case 0: return 1; // 1 byte, write once
      case 1: return 2; // 2 bytes, write once
      case 2: return 2; // 2 bytes, write twice
      case 3: return 4; // 4 bytes, write once
      case 4: return 4; // 4 bytes, write twice
      case 5: return 4; // 4 bytes, write four times
      case 6: return 2; // 2 bytes, write twice, alternate registers
      case 7: return 4; // 4 bytes, write twice, alternate registers
      default: return 1;
    }
  }

  public updateLineCounter(channel: HDMAChannel): void {
    if (channel.lineCounter === 0) {
      // Read new line counter
      const newCounter = this.memory.read(
        (channel.sourceBank << 16) | channel.sourceAddress++
      );

      if (newCounter === 0) {
        channel.terminated = true;
      } else {
        channel.lineCounter = newCounter;
        channel.doTransfer = true;
      }
    } else {
      channel.lineCounter--;
      channel.doTransfer = (channel.mode & 0x40) !== 0;
    }
  }
}