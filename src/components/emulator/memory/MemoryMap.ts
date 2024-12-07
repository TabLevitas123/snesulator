import { EventEmitter } from 'events';

export enum MemoryRegion {
  WRAM = 'WRAM',         // Work RAM
  SRAM = 'SRAM',         // Save RAM
  ROM = 'ROM',           // Game ROM
  MMIO = 'MMIO',        // Memory-mapped I/O
  PPU = 'PPU',          // Picture Processing Unit
  APU = 'APU'           // Audio Processing Unit
}

export interface MemoryAccess {
  read: (address: number) => number;
  write: (address: number, value: number) => void;
}

export class MemoryMap {
  private regions: Map<MemoryRegion, MemoryAccess>;
  private events: EventEmitter;
  private bankType: 'LoROM' | 'HiROM';

  constructor() {
    this.regions = new Map();
    this.events = new EventEmitter();
    this.bankType = 'LoROM';
  }

  public mapRegion(region: MemoryRegion, access: MemoryAccess): void {
    this.regions.set(region, access);
  }

  public read(address: number): number {
    const region = this.getRegion(address);
    const handler = this.regions.get(region);
    
    if (!handler) {
      console.warn(`Unmapped memory read at ${address.toString(16)}`);
      return 0;
    }

    const mappedAddress = this.translateAddress(address, region);
    const value = handler.read(mappedAddress);
    this.events.emit('memoryRead', { address, value, region });
    return value;
  }

  public write(address: number, value: number): void {
    const region = this.getRegion(address);
    const handler = this.regions.get(region);
    
    if (!handler) {
      console.warn(`Unmapped memory write at ${address.toString(16)}`);
      return;
    }

    const mappedAddress = this.translateAddress(address, region);
    handler.write(mappedAddress, value);
    this.events.emit('memoryWrite', { address, value, region });
  }

  public setBankType(type: 'LoROM' | 'HiROM'): void {
    this.bankType = type;
    this.events.emit('bankTypeChanged', type);
  }

  private getRegion(address: number): MemoryRegion {
    if (address < 0x2000) {
      return MemoryRegion.WRAM;
    } else if (address < 0x3000) {
      return MemoryRegion.PPU;
    } else if (address < 0x4000) {
      return MemoryRegion.APU;
    } else if (address < 0x6000) {
      return MemoryRegion.MMIO;
    } else if (address < 0x8000) {
      return MemoryRegion.SRAM;
    } else {
      return MemoryRegion.ROM;
    }
  }

  private translateAddress(address: number, region: MemoryRegion): number {
    switch (region) {
      case MemoryRegion.ROM:
        return this.translateROMAddress(address);
      case MemoryRegion.SRAM:
        return address & 0x1FFF;
      case MemoryRegion.WRAM:
        return address & 0x1FFF;
      default:
        return address;
    }
  }

  private translateROMAddress(address: number): number {
    if (this.bankType === 'LoROM') {
      // LoROM: Banks $80-$FF mirror $00-$7F
      return ((address & 0x7F0000) >> 1) | (address & 0x7FFF);
    } else {
      // HiROM: Direct mapping with high bit stripped
      return address & 0x3FFFFF;
    }
  }

  public onMemoryAccess(callback: (event: {
    address: number;
    value: number;
    region: MemoryRegion;
  }) => void): void {
    this.events.on('memoryRead', callback);
    this.events.on('memoryWrite', callback);
  }
}