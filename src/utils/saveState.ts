import { EmulatorState } from '../types/emulator';

export class SaveStateManager {
  private static readonly SAVE_STATE_VERSION = 1;
  private static readonly MAGIC_NUMBER = 0x534E4553; // "SNES" in ASCII

  public static serialize(state: EmulatorState): Uint8Array {
    // Create a buffer to hold the serialized data
    const buffer = new ArrayBuffer(1024 * 1024); // 1MB buffer
    const view = new DataView(buffer);
    let offset = 0;

    // Write header
    view.setUint32(offset, this.MAGIC_NUMBER);
    offset += 4;
    view.setUint32(offset, this.SAVE_STATE_VERSION);
    offset += 4;

    // Write CPU state
    view.setUint8(offset, state.cpu.A);
    offset += 1;
    view.setUint8(offset, state.cpu.X);
    offset += 1;
    view.setUint8(offset, state.cpu.Y);
    offset += 1;
    view.setUint8(offset, state.cpu.SP);
    offset += 1;
    view.setUint16(offset, state.cpu.PC);
    offset += 2;
    view.setUint8(offset, state.cpu.P);
    offset += 1;

    // Write PPU state
    const vramLength = state.ppu.VRAM.length;
    view.setUint32(offset, vramLength);
    offset += 4;
    new Uint8Array(buffer, offset, vramLength).set(state.ppu.VRAM);
    offset += vramLength;

    const oamLength = state.ppu.OAM.length;
    view.setUint32(offset, oamLength);
    offset += 4;
    new Uint8Array(buffer, offset, oamLength).set(state.ppu.OAM);
    offset += oamLength;

    const cgramLength = state.ppu.CGRAM.length;
    view.setUint32(offset, cgramLength);
    offset += 4;
    new Uint8Array(buffer, offset, cgramLength).set(state.ppu.CGRAM);
    offset += cgramLength;

    // Write APU state
    const apuRamLength = state.apu.ram.length;
    view.setUint32(offset, apuRamLength);
    offset += 4;
    new Uint8Array(buffer, offset, apuRamLength).set(state.apu.ram);
    offset += apuRamLength;

    // Write SPC700 state
    view.setUint8(offset, state.apu.spc700.a);
    offset += 1;
    view.setUint8(offset, state.apu.spc700.x);
    offset += 1;
    view.setUint8(offset, state.apu.spc700.y);
    offset += 1;
    view.setUint8(offset, state.apu.spc700.sp);
    offset += 1;
    view.setUint16(offset, state.apu.spc700.pc);
    offset += 2;
    view.setUint8(offset, state.apu.spc700.psw);
    offset += 1;

    // Write DSP registers
    const dspRegLength = state.apu.dspRegisters.length;
    view.setUint32(offset, dspRegLength);
    offset += 4;
    new Uint8Array(buffer, offset, dspRegLength).set(state.apu.dspRegisters);
    offset += dspRegLength;

    // Write emulator state
    view.setUint32(offset, state.frameCount);
    offset += 4;
    view.setUint8(offset, state.isRunning ? 1 : 0);
    offset += 1;
    view.setUint8(offset, state.isPaused ? 1 : 0);
    offset += 1;

    // Return only the used portion of the buffer
    return new Uint8Array(buffer.slice(0, offset));
  }

  public static deserialize(data: Uint8Array): EmulatorState {
    const view = new DataView(data.buffer);
    let offset = 0;

    // Verify header
    const magic = view.getUint32(offset);
    offset += 4;
    if (magic !== this.MAGIC_NUMBER) {
      throw new Error('Invalid save state file');
    }

    const version = view.getUint32(offset);
    offset += 4;
    if (version !== this.SAVE_STATE_VERSION) {
      throw new Error('Incompatible save state version');
    }

    // Read CPU state
    const cpu = {
      A: view.getUint8(offset++),
      X: view.getUint8(offset++),
      Y: view.getUint8(offset++),
      SP: view.getUint8(offset++),
      PC: view.getUint16(offset),
      P: view.getUint8(offset + 2)
    };
    offset += 3;

    // Read PPU state
    const vramLength = view.getUint32(offset);
    offset += 4;
    const VRAM = new Uint8Array(data.slice(offset, offset + vramLength));
    offset += vramLength;

    const oamLength = view.getUint32(offset);
    offset += 4;
    const OAM = new Uint8Array(data.slice(offset, offset + oamLength));
    offset += oamLength;

    const cgramLength = view.getUint32(offset);
    offset += 4;
    const CGRAM = new Uint8Array(data.slice(offset, offset + cgramLength));
    offset += cgramLength;

    // Read APU state
    const apuRamLength = view.getUint32(offset);
    offset += 4;
    const apuRam = new Uint8Array(data.slice(offset, offset + apuRamLength));
    offset += apuRamLength;

    // Read SPC700 state
    const spc700 = {
      a: view.getUint8(offset++),
      x: view.getUint8(offset++),
      y: view.getUint8(offset++),
      sp: view.getUint8(offset++),
      pc: view.getUint16(offset),
      psw: view.getUint8(offset + 2)
    };
    offset += 3;

    // Read DSP registers
    const dspRegLength = view.getUint32(offset);
    offset += 4;
    const dspRegisters = new Uint8Array(data.slice(offset, offset + dspRegLength));
    offset += dspRegLength;

    // Read emulator state
    const frameCount = view.getUint32(offset);
    offset += 4;
    const isRunning = view.getUint8(offset++) === 1;
    const isPaused = view.getUint8(offset++) === 1;

    return {
      cpu,
      ppu: { VRAM, OAM, CGRAM },
      apu: { ram: apuRam, spc700, dspRegisters },
      frameCount,
      isRunning,
      isPaused,
      currentROM: null // ROM path is not saved in save states
    };
  }
}