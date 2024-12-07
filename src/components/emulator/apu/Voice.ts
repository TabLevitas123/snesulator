import { EventEmitter } from 'events';

export class Voice {
  private sampleData: Int16Array;
  private samplePosition: number;
  private pitch: number;
  private pitchModulation: boolean;
  private volume: { left: number; right: number };
  private adsr: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  private envelope: number;
  private envelopeMode: 'attack' | 'decay' | 'sustain' | 'release';
  private enabled: boolean;
  private events: EventEmitter;

  constructor() {
    this.sampleData = new Int16Array(16);
    this.samplePosition = 0;
    this.pitch = 0;
    this.pitchModulation = false;
    this.volume = { left: 0, right: 0 };
    this.adsr = {
      attack: 0,
      decay: 0,
      sustain: 0,
      release: 0
    };
    this.envelope = 0;
    this.envelopeMode = 'release';
    this.enabled = false;
    this.events = new EventEmitter();
  }

  public setADSR(attack: number, decay: number, sustain: number, release: number): void {
    this.adsr = { attack, decay, sustain, release };
  }

  public setPitch(pitch: number): void {
    this.pitch = pitch & 0x3FFF;
  }

  public setVolume(left: number, right: number): void {
    this.volume.left = left & 0x7F;
    this.volume.right = right & 0x7F;
  }

  public setSample(data: Int16Array): void {
    this.sampleData = data;
    this.samplePosition = 0;
  }

  public enable(enabled: boolean): void {
    if (enabled && !this.enabled) {
      this.envelope = 0;
      this.envelopeMode = 'attack';
    }
    this.enabled = enabled;
  }

  public setPitchModulation(enabled: boolean): void {
    this.pitchModulation = enabled;
  }

  public getSample(previousVoicePitch?: number): { left: number; right: number } {
    if (!this.enabled) {
      return { left: 0, right: 0 };
    }

    // Get base sample
    const sample = this.interpolate();

    // Apply pitch modulation if enabled
    let pitch = this.pitch;
    if (this.pitchModulation && previousVoicePitch !== undefined) {
      pitch = (pitch * previousVoicePitch) >> 12;
    }

    // Update sample position
    this.samplePosition = (this.samplePosition + pitch) % this.sampleData.length;

    // Update envelope
    this.updateEnvelope();

    // Apply envelope and volume
    const amplitude = (sample * this.envelope) >> 7;
    return {
      left: (amplitude * this.volume.left) >> 7,
      right: (amplitude * this.volume.right) >> 7
    };
  }

  private interpolate(): number {
    const pos = Math.floor(this.samplePosition);
    const fraction = this.samplePosition - pos;
    
    const sample1 = this.sampleData[pos];
    const sample2 = this.sampleData[(pos + 1) % this.sampleData.length];
    
    return sample1 + (sample2 - sample1) * fraction;
  }

  private updateEnvelope(): void {
    switch (this.envelopeMode) {
      case 'attack':
        this.envelope += this.adsr.attack;
        if (this.envelope >= 127) {
          this.envelope = 127;
          this.envelopeMode = 'decay';
        }
        break;

      case 'decay':
        this.envelope -= this.adsr.decay;
        if (this.envelope <= this.adsr.sustain) {
          this.envelope = this.adsr.sustain;
          this.envelopeMode = 'sustain';
        }
        break;

      case 'sustain':
        // Envelope stays at sustain level
        break;

      case 'release':
        this.envelope -= this.adsr.release;
        if (this.envelope <= 0) {
          this.envelope = 0;
          this.enabled = false;
          this.events.emit('voiceComplete');
        }
        break;
    }
  }

  public reset(): void {
    this.samplePosition = 0;
    this.pitch = 0;
    this.pitchModulation = false;
    this.volume = { left: 0, right: 0 };
    this.adsr = {
      attack: 0,
      decay: 0,
      sustain: 0,
      release: 0
    };
    this.envelope = 0;
    this.envelopeMode = 'release';
    this.enabled = false;
  }
}