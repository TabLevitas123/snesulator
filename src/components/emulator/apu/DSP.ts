export class DSP {
  private registers: Uint8Array;
  private voices: Voice[];
  private mainVolume: { left: number; right: number };
  private echoVolume: { left: number; right: number };
  private echoBuffer: Float32Array;
  private echoWritePos: number;
  private echoLength: number;

  constructor() {
    this.registers = new Uint8Array(128);
    this.voices = Array.from({ length: 8 }, () => new Voice());
    this.mainVolume = { left: 0, right: 0 };
    this.echoVolume = { left: 0, right: 0 };
    this.echoBuffer = new Float32Array(64 * 1024);
    this.echoWritePos = 0;
    this.echoLength = 0;
  }

  public reset(): void {
    this.registers.fill(0);
    this.voices.forEach(voice => voice.reset());
    this.mainVolume = { left: 0, right: 0 };
    this.echoVolume = { left: 0, right: 0 };
    this.echoBuffer.fill(0);
    this.echoWritePos = 0;
    this.echoLength = 0;
  }

  public writeRegister(address: number, value: number): void {
    this.registers[address] = value;
    this.updateFromRegister(address);
  }

  public readRegister(address: number): number {
    return this.registers[address];
  }

  private updateFromRegister(address: number): void {
    const value = this.registers[address];
    const voice = Math.floor(address / 16);

    if (voice < 8) {
      // Voice registers
      const reg = address % 16;
      this.updateVoiceRegister(voice, reg, value);
    } else {
      // Global registers
      this.updateGlobalRegister(address, value);
    }
  }

  private updateVoiceRegister(voice: number, reg: number, value: number): void {
    const v = this.voices[voice];
    switch (reg) {
      case 0: // Volume Left
        v.volumeLeft = value;
        break;
      case 1: // Volume Right
        v.volumeRight = value;
        break;
      case 2: // Pitch Low
        v.pitch = (v.pitch & 0xFF00) | value;
        break;
      case 3: // Pitch High
        v.pitch = (v.pitch & 0x00FF) | (value << 8);
        break;
      // Add more voice register handling
    }
  }

  private updateGlobalRegister(address: number, value: number): void {
    switch (address) {
      case 0x0C: // Main Volume Left
        this.mainVolume.left = value;
        break;
      case 0x1C: // Main Volume Right
        this.mainVolume.right = value;
        break;
      case 0x2C: // Echo Volume Left
        this.echoVolume.left = value;
        break;
      case 0x3C: // Echo Volume Right
        this.echoVolume.right = value;
        break;
      // Add more global register handling
    }
  }

  public getSample(): { left: number; right: number } {
    let left = 0;
    let right = 0;

    // Mix voices
    for (const voice of this.voices) {
      const sample = voice.getSample();
      left += sample * voice.volumeLeft;
      right += sample * voice.volumeRight;
    }

    // Apply main volume
    left *= this.mainVolume.left / 128;
    right *= this.mainVolume.right / 128;

    // Add echo
    if (this.echoLength > 0) {
      const echoPos = (this.echoWritePos - this.echoLength + this.echoBuffer.length) % this.echoBuffer.length;
      left += this.echoBuffer[echoPos] * this.echoVolume.left / 128;
      right += this.echoBuffer[echoPos + 1] * this.echoVolume.right / 128;
    }

    // Write to echo buffer
    this.echoBuffer[this.echoWritePos] = left;
    this.echoBuffer[this.echoWritePos + 1] = right;
    this.echoWritePos = (this.echoWritePos + 2) % this.echoBuffer.length;

    return { left, right };
  }
}

class Voice {
  public volumeLeft: number = 0;
  public volumeRight: number = 0;
  public pitch: number = 0;
  private sample: number = 0;

  public reset(): void {
    this.volumeLeft = 0;
    this.volumeRight = 0;
    this.pitch = 0;
    this.sample = 0;
  }

  public getSample(): number {
    // Simplified sample generation for now
    return this.sample;
  }
}