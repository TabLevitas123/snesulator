import { EventEmitter } from 'events';
import { DSP } from './apu/DSP';
import { SPC700 } from './apu/SPC700';
import { AudioProcessor } from './apu/AudioProcessor';

export class APU {
  private spc700: SPC700;
  private dsp: DSP;
  private audioProcessor: AudioProcessor;
  private events: EventEmitter;
  private ram: Uint8Array;
  private running: boolean;

  constructor() {
    this.ram = new Uint8Array(64 * 1024); // 64KB APU RAM
    this.events = new EventEmitter();
    this.spc700 = new SPC700(this.ram);
    this.dsp = new DSP();
    this.audioProcessor = new AudioProcessor();
    this.running = false;
  }

  public async initialize(): Promise<void> {
    await this.audioProcessor.initialize();
    this.running = true;
  }

  public reset(): void {
    this.ram.fill(0);
    this.spc700.reset();
    this.dsp.reset();
    this.audioProcessor.reset();
    this.events.emit('apuReset');
  }

  public step(): number {
    if (!this.running) return 0;

    // Execute SPC700 instruction
    const cycles = this.spc700.step();
    
    // Process DSP samples
    if (cycles % 32 === 0) { // DSP is updated every 32 cycles
      const sample = this.dsp.getSample();
      this.audioProcessor.pushSample(sample);
    }

    return cycles;
  }

  public write(address: number, value: number): void {
    if (address < 0xFFC0) {
      // RAM access
      this.ram[address] = value;
    } else {
      // DSP register access
      this.dsp.writeRegister(address & 0x7F, value);
    }
    this.events.emit('apuWrite', { address, value });
  }

  public read(address: number): number {
    if (address < 0xFFC0) {
      // RAM access
      return this.ram[address];
    } else {
      // DSP register access
      return this.dsp.readRegister(address & 0x7F);
    }
  }

  public stop(): void {
    this.running = false;
    this.audioProcessor.stop();
  }
}