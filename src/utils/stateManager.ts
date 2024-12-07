import { EmulatorState } from '../types/emulator';

export class StateManager {
  private static readonly STATE_VERSION = 1;
  private static readonly MAGIC = 0x534E4553; // "SNES"

  public static async serialize(state: EmulatorState): Promise<Uint8Array> {
    try {
      console.log('Serializing emulator state');
      
      // Create a buffer to hold the serialized data
      const buffer = new ArrayBuffer(1024 * 1024); // 1MB initial buffer
      const view = new DataView(buffer);
      let offset = 0;

      // Write header
      view.setUint32(offset, this.MAGIC);
      offset += 4;
      view.setUint32(offset, this.STATE_VERSION);
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

      // Write memory states
      this.writeMemoryBlock(view, offset, state.ppu.VRAM);
      offset += state.ppu.VRAM.length + 4;
      this.writeMemoryBlock(view, offset, state.ppu.OAM);
      offset += state.ppu.OAM.length + 4;
      this.writeMemoryBlock(view, offset, state.ppu.CGRAM);
      offset += state.ppu.CGRAM.length + 4;

      // Write APU state
      this.writeMemoryBlock(view, offset, state.apu.ram);
      offset += state.apu.ram.length + 4;
      this.writeMemoryBlock(view, offset, state.apu.dspRegisters);
      offset += state.apu.dspRegisters.length + 4;

      // Write emulator state
      view.setUint32(offset, state.frameCount);
      offset += 4;
      view.setUint8(offset, state.isRunning ? 1 : 0);
      offset += 1;
      view.setUint8(offset, state.isPaused ? 1 : 0);
      offset += 1;

      console.log('State serialized successfully');
      return new Uint8Array(buffer.slice(0, offset));
    } catch (error) {
      console.error('Failed to serialize state:', error);
      throw error;
    }
  }

  public static async deserialize(data: Uint8Array): Promise<EmulatorState> {
    try {
      console.log('Deserializing emulator state');
      const view = new DataView(data.buffer);
      let offset = 0;

      // Verify header
      const magic = view.getUint32(offset);
      offset += 4;
      if (magic !== this.MAGIC) {
        throw new Error('Invalid save state format');
      }

      const version = view.getUint32(offset);
      offset += 4;
      if (version !== this.STATE_VERSION) {
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

      // Read memory states
      const vram = this.readMemoryBlock(view, offset);
      offset += vram.length + 4;
      const oam = this.readMemoryBlock(view, offset);
      offset += oam.length + 4;
      const cgram = this.readMemoryBlock(view, offset);
      offset += cgram.length + 4;

      // Read APU state
      const apuRam = this.readMemoryBlock(view, offset);
      offset += apuRam.length + 4;
      const dspRegisters = this.readMemoryBlock(view, offset);
      offset += dspRegisters.length + 4;

      // Read emulator state
      const frameCount = view.getUint32(offset);
      offset += 4;
      const isRunning = view.getUint8(offset++) === 1;
      const isPaused = view.getUint8(offset++) === 1;

      console.log('State deserialized successfully');

      return {
        cpu,
        ppu: { VRAM: vram, OAM: oam, CGRAM: cgram },
        apu: {
          ram: apuRam,
          spc700: {
            a: 0,
            x: 0,
            y: 0,
            sp: 0,
            pc: 0,
            psw: 0
          },
          dspRegisters
        },
        frameCount,
        isRunning,
        isPaused,
        currentROM: null
      };
    } catch (error) {
      console.error('Failed to deserialize state:', error);
      throw error;
    }
  }

  private static writeMemoryBlock(view: DataView, offset: number, data: Uint8Array): void {
    view.setUint32(offset, data.length);
    new Uint8Array(view.buffer, offset + 4, data.length).set(data);
  }

  private static readMemoryBlock(view: DataView, offset: number): Uint8Array {
    const length = view.getUint32(offset);
    return new Uint8Array(view.buffer.slice(offset + 4, offset + 4 + length));
  }
}