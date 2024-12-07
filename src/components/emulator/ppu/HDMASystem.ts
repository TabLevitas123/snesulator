import { EventEmitter } from 'events';
import { HDMAController } from './HDMAController';
import { HDMATransfer } from './HDMATransfer';
import { Memory } from '../Memory';
import { HDMARegisters } from './HDMARegisters';

export class HDMASystem {
  private controller: HDMAController;
  private transfer: HDMATransfer;
  private memory: Memory;
  private events: EventEmitter;
  private enabled: boolean;
  private scanline: number;

  constructor(memory: Memory) {
    this.memory = memory;
    this.controller = new HDMAController(memory);
    this.transfer = new HDMATransfer(memory);
    this.events = new EventEmitter();
    this.enabled = false;
    this.scanline = 0;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.controller.onComplete(() => {
      this.events.emit('hdmaComplete');
    });
  }

  public writeRegister(address: number, value: number): void {
    if (address === HDMARegisters.HDMAEN) {
      this.enabled = (value !== 0);
      if (this.enabled) {
        this.initializeChannels(value);
      }
      return;
    }

    // Handle channel-specific registers
    const channel = Math.floor((address - 0x4300) / 0x10);
    if (channel >= 0 && channel < 8) {
      const regOffset = (address - 0x4300) % 0x10;
      this.updateChannelRegister(channel, regOffset, value);
    }
  }

  private initializeChannels(enableMask: number): void {
    for (let i = 0; i < 8; i++) {
      if (enableMask & (1 << i)) {
        const config = this.getChannelConfig(i);
        this.controller.initChannel(i, config);
      }
    }
  }

  private getChannelConfig(channel: number): any {
    const baseAddr = 0x4300 + (channel * 0x10);
    return {
      enabled: true,
      mode: this.memory.read(baseAddr),
      sourceAddress: this.memory.read(baseAddr + 2) | (this.memory.read(baseAddr + 3) << 8),
      sourceBank: this.memory.read(baseAddr + 4),
      destAddress: this.memory.read(baseAddr + 1),
      indirectBank: this.memory.read(baseAddr + 5),
      lineCounter: this.memory.read(baseAddr + 6)
    };
  }

  private updateChannelRegister(channel: number, regOffset: number, value: number): void {
    const hdmaChannel = this.controller.getChannel(channel);
    if (!hdmaChannel) return;

    switch (regOffset) {
      case 0: // Control
        hdmaChannel.mode = value;
        break;
      case 1: // Destination
        hdmaChannel.destAddress = value;
        break;
      case 2: // Source Address (Low)
        hdmaChannel.sourceAddress = (hdmaChannel.sourceAddress & 0xFF00) | value;
        break;
      case 3: // Source Address (High)
        hdmaChannel.sourceAddress = (hdmaChannel.sourceAddress & 0x00FF) | (value << 8);
        break;
      case 4: // Source Bank
        hdmaChannel.sourceBank = value;
        break;
      case 5: // Indirect Bank
        hdmaChannel.indirectBank = value;
        break;
      case 6: // Line Counter
        hdmaChannel.lineCounter = value;
        break;
    }
  }

  public startScanline(): void {
    if (!this.enabled) return;

    this.controller.startHBlank();
    this.scanline = (this.scanline + 1) % 262;

    if (this.scanline === 0) {
      this.events.emit('frameComplete');
    }
  }

  public reset(): void {
    this.enabled = false;
    this.scanline = 0;
    this.controller.reset();
  }

  public onFrameComplete(callback: () => void): void {
    this.events.on('frameComplete', callback);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getScanline(): number {
    return this.scanline;
  }
}