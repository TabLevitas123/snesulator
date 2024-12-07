import { VoiceController } from './VoiceController';
import { EchoProcessor } from './EchoProcessor';
import { EventEmitter } from 'events';

export class DSPProcessor {
  private voiceController: VoiceController;
  private echoProcessor: EchoProcessor;
  private events: EventEmitter;
  private registers: Uint8Array;

  constructor(sampleRate: number = 32000) {
    this.voiceController = new VoiceController(sampleRate);
    this.echoProcessor = new EchoProcessor();
    this.events = new EventEmitter();
    this.registers = new Uint8Array(128);
  }

  public writeRegister(address: number, value: number): void {
    this.registers[address] = value;
    this.updateFromRegister(address);
  }

  public readRegister(address: number): number {
    return this.registers[address];
  }

  private updateFromRegister(address: number): void {
    const voice = Math.floor(address / 16);
    const reg = address % 16;

    if (voice < 8) {
      // Voice registers
      switch (reg) {
        case 0: // Volume Left
          this.voiceController.setVoiceVolume(voice, value, undefined);
          break;
        case 1: // Volume Right
          this.voiceController.setVoiceVolume(voice, undefined, value);
          break;
        case 2: // Pitch Low
          const pitch = (this.registers[voice * 16 + 3] << 8) | value;
          this.voiceController.setVoicePitch(voice, pitch);
          break;
        case 4: // ADSR1
          const attack = (value >> 4) & 0x0F;
          const decay = value & 0x07;
          const sustainEnabled = (value & 0x80) !== 0;
          if (sustainEnabled) {
            const sustain = this.registers[voice * 16 + 5] >> 4;
            const release = this.registers[voice * 16 + 5] & 0x0F;
            this.voiceController.setVoiceADSR(voice, attack, decay, sustain, release);
          }
          break;
      }
    } else {
      // Global registers
      switch (address) {
        case 0x0C: // Master Volume Left
          this.voiceController.setMasterVolume(value, undefined);
          break;
        case 0x1C: // Master Volume Right
          this.voiceController.setMasterVolume(undefined, value);
          break;
        case 0x2C: // Echo Volume Left
          this.echoProcessor.setVolume(value, undefined);
          break;
        case 0x3C: // Echo Volume Right
          this.echoProcessor.setVolume(undefined, value);
          break;
        case 0x4C: // Key On
          for (let i = 0; i < 8; i++) {
            if (value & (1 << i)) {
              this.voiceController.enableVoice(i, true);
            }
          }
          break;
        case 0x5C: // Key Off
          for (let i = 0; i < 8; i++) {
            if (value & (1 << i)) {
              this.voiceController.enableVoice(i, false);
            }
          }
          break;
        case 0x6C: // Flags
          this.echoProcessor.setEnabled((value & 0x20) !== 0);
          break;
        case 0x6D: // Echo Feedback
          this.echoProcessor.setFeedback(value);
          break;
        case 0x7D: // Echo Length
          this.echoProcessor.setLength(value & 0x0F);
          break;
        default:
          // Echo FIR filter coefficients
          if (address >= 0x0F && address <= 0x7F) {
            const filterIndex = (address - 0x0F) >> 4;
            if (filterIndex < 8) {
              this.echoProcessor.setFilterCoefficient(filterIndex, value);
            }
          }
          break;
      }
    }
  }

  public process(): { left: number; right: number } {
    // Get voice output
    const voiceOutput = this.voiceController.getSample();
    
    // Process echo effects
    return this.echoProcessor.process(voiceOutput);
  }

  public reset(): void {
    this.voiceController.reset();
    this.echoProcessor.reset();
    this.registers.fill(0);
  }
}