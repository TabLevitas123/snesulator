import { EventEmitter } from 'events';

export class Memory {
  private ram: Uint8Array;
  private rom: Uint8Array;
  private sram: Uint8Array;
  private events: EventEmitter;

  constructor() {
    // SNES has 128KB of RAM
    this.ram = new Uint8Array(128 * 1024);
    // ROM size will be set when loading
    this.rom = new Uint8Array(0);
    // SRAM size varies by cartridge
    this.sram = new Uint8Array(0);
    this.events = new EventEmitter();
  }

  public read(address: number): number {
    if (address < 0x2000) {
      // Work RAM (WRAM)
      return this.ram[address];
    } else if (address >= 0x8000) {
      // ROM access
      return this.rom[address - 0x8000];
    }
    // Handle other memory regions
    return 0;
  }

  public write(address: number, value: number): void {
    if (address < 0x2000) {
      // Work RAM (WRAM)
      this.ram[address] = value;
      this.events.emit('memoryWrite', { address, value });
    }
    // Handle other memory regions
  }

  public loadROM(data: Uint8Array): void {
    this.rom = data;
    this.events.emit('romLoaded', { size: data.length });
  }

  public reset(): void {
    this.ram.fill(0);
    this.events.emit('memoryReset');
  }

  public onMemoryWrite(callback: (event: { address: number; value: number }) => void): void {
    this.events.on('memoryWrite', callback);
  }

  public onROMLoaded(callback: (event: { size: number }) => void): void {
    this.events.on('romLoaded', callback);
  }
}