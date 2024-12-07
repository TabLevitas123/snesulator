import { Voice } from './Voice';
import { EventEmitter } from 'events';

export class VoiceController {
  private voices: Voice[];
  private events: EventEmitter;
  private sampleRate: number;
  private masterVolume: { left: number; right: number };

  constructor(sampleRate: number = 32000) {
    this.voices = Array.from({ length: 8 }, () => new Voice());
    this.events = new EventEmitter();
    this.sampleRate = sampleRate;
    this.masterVolume = { left: 127, right: 127 };
  }

  public setVoiceVolume(voice: number, left: number, right: number): void {
    if (voice >= 0 && voice < 8) {
      this.voices[voice].setVolume(left, right);
    }
  }

  public setVoicePitch(voice: number, pitch: number): void {
    if (voice >= 0 && voice < 8) {
      this.voices[voice].setPitch(pitch);
    }
  }

  public setVoiceADSR(voice: number, attack: number, decay: number, sustain: number, release: number): void {
    if (voice >= 0 && voice < 8) {
      this.voices[voice].setADSR(attack, decay, sustain, release);
    }
  }

  public setVoiceSample(voice: number, data: Int16Array): void {
    if (voice >= 0 && voice < 8) {
      this.voices[voice].setSample(data);
    }
  }

  public enableVoice(voice: number, enabled: boolean): void {
    if (voice >= 0 && voice < 8) {
      this.voices[voice].enable(enabled);
    }
  }

  public setMasterVolume(left: number, right: number): void {
    this.masterVolume.left = left & 0x7F;
    this.masterVolume.right = right & 0x7F;
  }

  public getSample(): { left: number; right: number } {
    let left = 0;
    let right = 0;

    // Mix all voice outputs
    for (let i = 0; i < 8; i++) {
      const sample = this.voices[i].getSample(
        i > 0 ? this.voices[i - 1].getPitch() : undefined
      );
      left += sample.left;
      right += sample.right;
    }

    // Apply master volume
    left = (left * this.masterVolume.left) >> 7;
    right = (right * this.masterVolume.right) >> 7;

    // Clamp values
    left = Math.max(-32768, Math.min(32767, left));
    right = Math.max(-32768, Math.min(32767, right));

    return { left, right };
  }

  public reset(): void {
    this.voices.forEach(voice => voice.reset());
    this.masterVolume = { left: 127, right: 127 };
  }
}