import { EventEmitter } from 'events';

export class EchoProcessor {
  private buffer: Float32Array;
  private position: number;
  private length: number;
  private feedback: number;
  private filterCoeffs: Int8Array;
  private fir: Float32Array;
  private events: EventEmitter;
  private enabled: boolean;
  private volume: { left: number; right: number };

  constructor() {
    this.buffer = new Float32Array(65536); // Maximum echo buffer size
    this.position = 0;
    this.length = 0;
    this.feedback = 0;
    this.filterCoeffs = new Int8Array(8);
    this.fir = new Float32Array(8);
    this.events = new EventEmitter();
    this.enabled = false;
    this.volume = { left: 0, right: 0 };
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public setLength(delay: number): void {
    this.length = Math.min(delay * 2048, this.buffer.length);
  }

  public setFeedback(feedback: number): void {
    this.feedback = (feedback & 0x7F) / 128;
  }

  public setVolume(left: number, right: number): void {
    this.volume.left = (left & 0x7F) / 128;
    this.volume.right = (right & 0x7F) / 128;
  }

  public setFilterCoefficient(index: number, value: number): void {
    if (index >= 0 && index < 8) {
      this.filterCoeffs[index] = value;
    }
  }

  public process(input: { left: number; right: number }): { left: number; right: number } {
    if (!this.enabled || this.length === 0) {
      return input;
    }

    // Read from echo buffer
    const readPos = (this.position - this.length + this.buffer.length) % this.buffer.length;
    const echoLeft = this.buffer[readPos * 2];
    const echoRight = this.buffer[readPos * 2 + 1];

    // Apply FIR filter
    let filteredLeft = 0;
    let filteredRight = 0;
    for (let i = 0; i < 8; i++) {
      const pos = (readPos + i * 2) % this.buffer.length;
      const coeff = this.filterCoeffs[i] / 128;
      filteredLeft += this.buffer[pos] * coeff;
      filteredRight += this.buffer[pos + 1] * coeff;
    }

    // Calculate output with echo
    const outputLeft = input.left + filteredLeft * this.volume.left;
    const outputRight = input.right + filteredRight * this.volume.right;

    // Write to echo buffer with feedback
    this.buffer[this.position * 2] = input.left + echoLeft * this.feedback;
    this.buffer[this.position * 2 + 1] = input.right + echoRight * this.feedback;

    // Update buffer position
    this.position = (this.position + 1) % this.buffer.length;

    return {
      left: outputLeft,
      right: outputRight
    };
  }

  public reset(): void {
    this.buffer.fill(0);
    this.position = 0;
    this.length = 0;
    this.feedback = 0;
    this.filterCoeffs.fill(0);
    this.fir.fill(0);
    this.enabled = false;
    this.volume.left = 0;
    this.volume.right = 0;
  }
}