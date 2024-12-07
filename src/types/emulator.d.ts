export interface CPUState {
  A: number;    // Accumulator
  X: number;    // X Index Register
  Y: number;    // Y Index Register
  SP: number;   // Stack Pointer
  PC: number;   // Program Counter
  P: number;    // Processor Status
}

export interface PPUState {
  VRAM: Uint8Array;
  OAM: Uint8Array;
  CGRAM: Uint8Array;
}

export interface APUState {
  ram: Uint8Array;
  spc700: {
    a: number;
    x: number;
    y: number;
    sp: number;
    pc: number;
    psw: number;
  };
  dspRegisters: Uint8Array;
}

export interface EmulatorState {
  isRunning: boolean;
  isPaused: boolean;
  currentROM: { name: string; data: ArrayBuffer } | null;
  cpu: CPUState;
  ppu: PPUState;
  apu: APUState;
  frameCount: number;
}

export interface EmulatorControls {
  loadROM: (romData: ArrayBuffer, romName: string) => Promise<void>;
  start: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
  saveState: () => Promise<Uint8Array>;
  loadState: (state: Uint8Array) => Promise<void>;
}