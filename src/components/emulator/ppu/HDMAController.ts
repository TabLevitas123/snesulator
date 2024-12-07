import { EventEmitter } from 'events';
import { Memory } from '../Memory';

export interface HDMAChannel {
  enabled: boolean;
  mode: number;
  sourceAddress: number;
  sourceBank: number;
  destAddress: number;
  indirectBank: number;
  lineCounter: number;
  terminated: boolean;
  doTransfer: boolean;
}

export class HDMAController {
  private channels: HDMAChannel[];
  private memory: Memory;
  private events: EventEmitter;

  constructor(memory: Memory) {
    this.memory = memory;
    this.events = new EventEmitter();
    this.channels = Array.from({ length: 8 }, () => ({
      enabled: false,
      mode: 0,
      sourceAddress: 0,
      sourceBank: 0,
      destAddress: 0,
      indirectBank: 0,
      lineCounter: 0,
      terminated: false,
      doTransfer: false
    }));
  }

  public initChannel(channel: number, config: Partial<HDMAChannel>): void {
    if (channel >= 0 && channel < 8) {
      this.channels[channel] = {
        ...this.channels[channel],
        ...config
      };
    }
  }

  public startHBlank(): void {
    for (let i = 0; i < 8; i++) {
      const channel = this.channels[i];
      if (!channel.enabled || channel.terminated) continue;

      if (channel.lineCounter === 0) {
        // Read new line counter
        channel.lineCounter = this.memory.read(
          (channel.sourceBank << 16) | channel.sourceAddress++
        );

        if (channel.lineCounter === 0) {
          channel.terminated = true;
          continue;
        }

        channel.doTransfer = true;
      }

      if (channel.doTransfer) {
        this.performTransfer(i);
      }

      channel.lineCounter--;
      channel.doTransfer = (channel.mode & 0x40) !== 0; // Repeat flag
    }

    this.events.emit('hdmaComplete');
  }

  private performTransfer(channelIndex: number): void {
    const channel = this.channels[channelIndex];
    const transferSize = this.getTransferSize(channel.mode);
    let sourceAddr = (channel.sourceBank << 16) | channel.sourceAddress;

    if (channel.mode & 0x40) { // Indirect mode
      const tableAddr = this.memory.read(sourceAddr) |
                       (this.memory.read(sourceAddr + 1) << 8);
      sourceAddr = (channel.indirectBank << 16) | tableAddr;
    }

    // Perform the transfer
    for (let i = 0; i < transferSize; i++) {
      const value = this.memory.read(sourceAddr + i);
      this.memory.write(channel.destAddress + i, value);
    }

    // Update source address
    channel.sourceAddress += transferSize;
  }

  private getTransferSize(mode: number): number {
    switch (mode & 0x07) {
      case 0: return 1; // 1 byte
      case 1: return 2; // 2 bytes
      case 2: return 2; // 2 bytes
      case 3: return 4; // 4 bytes
      case 4: return 4; // 4 bytes
      case 5: return 4; // 4 bytes
      case 6: return 2; // 2 bytes
      case 7: return 4; // 4 bytes
      default: return 1;
    }
  }

  public reset(): void {
    this.channels.forEach(channel => {
      channel.enabled = false;
      channel.mode = 0;
      channel.sourceAddress = 0;
      channel.sourceBank = 0;
      channel.destAddress = 0;
      channel.indirectBank = 0;
      channel.lineCounter = 0;
      channel.terminated = false;
      channel.doTransfer = false;
    });
  }

  public onComplete(callback: () => void): void {
    this.events.on('hdmaComplete', callback);
  }
}