import { MemoryMap } from './MemoryMap';
import { HDMAController } from './HDMAController';

export enum DMAMode {
  DIRECT = 0,
  INDIRECT = 1,
  HDMA = 2
}

interface DMAChannel {
  enabled: boolean;
  mode: DMAMode;
  sourceBank: number;
  sourceAddress: number;
  destinationAddress: number;
  size: number;
  completed: boolean;
}

export class DMAController {
  private channels: DMAChannel[];
  private memoryMap: MemoryMap;
  private hdmaController: HDMAController;
  private active: boolean;

  constructor(memoryMap: MemoryMap) {
    this.memoryMap = memoryMap;
    this.hdmaController = new HDMAController(memoryMap);
    this.channels = Array.from({ length: 8 }, () => ({
      enabled: false,
      mode: DMAMode.DIRECT,
      sourceBank: 0,
      sourceAddress: 0,
      destinationAddress: 0,
      size: 0,
      completed: true
    }));
    this.active = false;
  }

  public write(channel: number, register: number, value: number): void {
    if (channel >= 0 && channel < 8) {
      if (this.channels[channel].mode === DMAMode.HDMA) {
        this.hdmaController.write(channel, register, value);
        return;
      }

      switch (register) {
        case 0: // Control
          this.channels[channel].enabled = (value & 0x01) !== 0;
          this.channels[channel].mode = (value >> 1) & 0x03;
          break;
        case 1: // Destination
          this.channels[channel].destinationAddress = value;
          break;
        case 2: // Source Low
          this.channels[channel].sourceAddress = 
            (this.channels[channel].sourceAddress & 0xFF00) | value;
          break;
        case 3: // Source High
          this.channels[channel].sourceAddress = 
            (this.channels[channel].sourceAddress & 0x00FF) | (value << 8);
          break;
        case 4: // Source Bank
          this.channels[channel].sourceBank = value;
          break;
        case 5: // Size Low
          this.channels[channel].size = 
            (this.channels[channel].size & 0xFF00) | value;
          break;
        case 6: // Size High
          this.channels[channel].size = 
            (this.channels[channel].size & 0x00FF) | (value << 8);
          break;
      }
    }
  }

  public read(channel: number, register: number): number {
    if (channel >= 0 && channel < 8) {
      if (this.channels[channel].mode === DMAMode.HDMA) {
        return this.hdmaController.read(channel, register);
      }

      switch (register) {
        case 0: // Control
          return (this.channels[channel].enabled ? 0x01 : 0x00) |
                 (this.channels[channel].mode << 1);
        case 1: // Destination
          return this.channels[channel].destinationAddress;
        case 2: // Source Low
          return this.channels[channel].sourceAddress & 0xFF;
        case 3: // Source High
          return (this.channels[channel].sourceAddress >> 8) & 0xFF;
        case 4: // Source Bank
          return this.channels[channel].sourceBank;
        case 5: // Size Low
          return this.channels[channel].size & 0xFF;
        case 6: // Size High
          return (this.channels[channel].size >> 8) & 0xFF;
      }
    }
    return 0;
  }

  public step(): number {
    if (!this.active) return 0;

    let cyclesUsed = 0;
    for (let i = 0; i < 8; i++) {
      const channel = this.channels[i];
      if (channel.enabled && !channel.completed) {
        if (channel.mode === DMAMode.HDMA) {
          // HDMA is handled separately during H-blank
          continue;
        }
        cyclesUsed += this.processChannel(i);
      }
    }

    return cyclesUsed;
  }

  public startHBlank(): void {
    this.hdmaController.startHBlank();
  }

  private processChannel(channel: number): number {
    const dma = this.channels[channel];
    let cycles = 0;

    if (dma.size > 0) {
      const sourceAddress = (dma.sourceBank << 16) | dma.sourceAddress;
      const value = this.memoryMap.read(sourceAddress);
      this.memoryMap.write(dma.destinationAddress, value);

      dma.sourceAddress++;
      dma.size--;
      cycles = 8; // Each DMA transfer takes 8 cycles

      if (dma.size === 0) {
        dma.completed = true;
        dma.enabled = false;
      }
    }

    return cycles;
  }

  public startTransfer(): void {
    this.active = true;
    for (const channel of this.channels) {
      if (channel.enabled) {
        channel.completed = false;
      }
    }
    this.hdmaController.enable();
  }

  public isActive(): boolean {
    return this.active;
  }

  public reset(): void {
    this.active = false;
    this.hdmaController.reset();
    for (const channel of this.channels) {
      channel.enabled = false;
      channel.completed = true;
      channel.mode = DMAMode.DIRECT;
      channel.sourceBank = 0;
      channel.sourceAddress = 0;
      channel.destinationAddress = 0;
      channel.size = 0;
    }
  }
}