import { expose } from 'comlink';
import { CPU } from '../components/emulator/CPU';
import { PPU } from '../components/emulator/PPU';
import { APU } from '../components/emulator/APU';
import { Memory } from '../components/emulator/Memory';
import { ROMLoader } from '../utils/romLoader';
import { InterruptSystem } from '../components/emulator/interrupts/InterruptSystem';
import type { EmulatorState } from '../types/emulator';

class EmulatorWorker {
  private cpu: CPU;
  private ppu: PPU;
  private apu: APU;
  private memory: Memory;
  private interrupts: InterruptSystem;
  private romLoader: ROMLoader;
  private running: boolean = false;
  private frameCount: number = 0;
  private cyclesPerFrame: number = 357366; // ~60fps

  constructor() {
    this.memory = new Memory();
    this.cpu = new CPU(this.memory);
    this.ppu = new PPU(this.memory);
    this.apu = new APU();
    this.interrupts = new InterruptSystem(this.cpu, this.memory);
    this.romLoader = new ROMLoader();
  }

  async loadROM(romData: ArrayBuffer): Promise<void> {
    try {
      const rom = await this.romLoader.loadROM(romData);
      if (!rom.valid) {
        throw new Error('Invalid ROM: Checksum verification failed');
      }

      this.memory.loadROM(rom.data);
      this.reset();
    } catch (error) {
      console.error('Failed to load ROM:', error);
      throw error;
    }
  }

  reset(): void {
    this.cpu.reset();
    this.ppu.reset();
    this.apu.reset();
    this.memory.reset();
    this.interrupts.reset();
    this.frameCount = 0;
  }

  start(): void {
    this.running = true;
    this.runFrame();
  }

  pause(): void {
    this.running = false;
  }

  private async runFrame(): Promise<void> {
    if (!this.running) return;

    let cycles = 0;
    while (cycles < this.cyclesPerFrame) {
      // Execute CPU cycles
      const cpuCycles = this.cpu.step();
      cycles += cpuCycles;

      // Handle interrupts
      const interruptCycles = this.interrupts.update(cpuCycles);
      cycles += interruptCycles;

      // PPU runs at ~4x CPU speed
      for (let i = 0; i < 4; i++) {
        this.ppu.renderScanline(Math.floor(this.frameCount % 224));
      }

      // APU runs at ~64 cycles per CPU cycle
      if (cpuCycles > 0) {
        this.apu.step();
      }
    }

    this.frameCount++;

    // Schedule next frame
    if (this.running) {
      requestAnimationFrame(() => this.runFrame());
    }
  }

  getState(): EmulatorState {
    return {
      isRunning: this.running,
      isPaused: !this.running,
      currentROM: null,
      cpu: this.cpu.getState(),
      ppu: this.ppu.getState(),
      apu: {
        ram: new Uint8Array(64 * 1024),
        spc700: {
          a: 0,
          x: 0,
          y: 0,
          sp: 0,
          pc: 0,
          psw: 0
        },
        dspRegisters: new Uint8Array(128)
      },
      frameCount: this.frameCount
    };
  }

  async saveState(): Promise<Uint8Array> {
    const state = this.getState();
    return new TextEncoder().encode(JSON.stringify(state));
  }

  async loadState(stateData: Uint8Array): Promise<void> {
    try {
      const state = JSON.parse(new TextDecoder().decode(stateData));
      this.cpu.setState(state.cpu);
      // TODO: Implement PPU and APU state restoration
      this.frameCount = state.frameCount;
    } catch (error) {
      console.error('Failed to load state:', error);
      throw error;
    }
  }
}

expose(EmulatorWorker);