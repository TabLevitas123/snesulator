import { create } from 'zustand';
import type { EmulatorState } from '../types/emulator';

interface EmulatorStore extends EmulatorState {
  setRunning: (isRunning: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setROM: (rom: string | null) => void;
  updateState: (state: Partial<EmulatorState>) => void;
}

export const useEmulatorStore = create<EmulatorStore>((set) => ({
  isRunning: false,
  isPaused: false,
  currentROM: null,
  cpu: {
    A: 0,
    X: 0,
    Y: 0,
    SP: 0,
    PC: 0,
    P: 0,
  },
  ppu: {
    VRAM: new Uint8Array(64 * 1024),
    OAM: new Uint8Array(544),
    CGRAM: new Uint8Array(512),
  },
  apu: {
    ram: new Uint8Array(64 * 1024),
    spc700: {
      a: 0,
      x: 0,
      y: 0,
      sp: 0,
      pc: 0,
      psw: 0,
    },
    dspRegisters: new Uint8Array(128),
  },
  frameCount: 0,

  setRunning: (isRunning) => set({ isRunning }),
  setPaused: (isPaused) => set({ isPaused }),
  setROM: (rom) => set({ currentROM: rom }),
  updateState: (state) => set((prev) => ({ ...prev, ...state })),
}));