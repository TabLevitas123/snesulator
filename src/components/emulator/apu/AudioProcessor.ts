import { AudioOutput } from './AudioOutput';
import { DSPProcessor } from './DSPProcessor';
import { EventEmitter } from 'events';

export class AudioProcessor {
  private output: AudioOutput;
  private dsp: DSPProcessor;
  private events: EventEmitter;
  private sampleRate: number;
  private cyclesPerSample: number;
  private cycleCounter: number;
  private running: boolean;

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
    this.output = new AudioOutput(sampleRate);
    this.dsp = new DSPProcessor(sampleRate);
    this.events = new EventEmitter();
    
    // SNES CPU runs at ~21.47727MHz, APU at ~1.024MHz
    this.cyclesPerSample = Math.floor(1024000 / sampleRate);
    this.cycleCounter = 0;
    this.running = false;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.output.onError((error) => {
      this.events.emit('error', error);
    });

    this.output.onBufferProcessed(() => {
      this.events.emit('bufferProcessed');
    });
  }

  public async initialize(): Promise<void> {
    try {
      await this.output.initialize();
      this.running = true;
      this.events.emit('initialized');
    } catch (error) {
      this.events.emit('error', error);
      throw error;
    }
  }

  public process(cycles: number): void {
    if (!this.running) return;

    this.cycleCounter += cycles;

    while (this.cycleCounter >= this.cyclesPerSample) {
      // Get the next sample from the DSP
      const sample = this.dsp.process();
      
      // Push the sample to the audio output
      this.output.pushSample(sample.left, sample.right);
      
      this.cycleCounter -= this.cyclesPerSample;
    }
  }

  public writeRegister(address: number, value: number): void {
    this.dsp.writeRegister(address, value);
  }

  public readRegister(address: number): number {
    return this.dsp.readRegister(address);
  }

  public setVolume(volume: number): void {
    this.output.setVolume(volume);
  }

  public suspend(): void {
    this.running = false;
    this.output.suspend();
  }

  public resume(): void {
    this.running = true;
    this.output.resume();
  }

  public reset(): void {
    this.cycleCounter = 0;
    this.dsp.reset();
    this.output.reset();
  }

  public destroy(): void {
    this.running = false;
    this.output.destroy();
  }

  public onError(callback: (error: Error) => void): void {
    this.events.on('error', callback);
  }

  public onBufferProcessed(callback: () => void): void {
    this.events.on('bufferProcessed', callback);
  }
}