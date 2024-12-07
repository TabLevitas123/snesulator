import React, { createContext, useContext } from 'react';
import { create } from 'zustand';
import type { EmulatorState } from '../types/emulator';
import { StateManager } from '../utils/stateManager';

interface EmulatorStore extends EmulatorState {
  loadROM: (romData: ArrayBuffer, romName: string) => Promise<void>;
  start: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
  saveState: () => Promise<Uint8Array>;
  loadState: (state: Uint8Array) => Promise<void>;
}

const useEmulatorStore = create<EmulatorStore>((set, get) => ({
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

  loadROM: async (romData: ArrayBuffer, romName: string) => {
    try {
      console.log('Loading ROM:', { name: romName, size: romData.byteLength });
      
      // Create a copy of the ROM data to prevent modifications
      const romBuffer = romData.slice(0);
      
      set({ 
        currentROM: { 
          name: romName, 
          data: romBuffer 
        },
        isRunning: true,
        isPaused: false,
      });

      console.log('ROM loaded successfully');
    } catch (error) {
      console.error('Failed to load ROM:', error);
      throw error;
    }
  },

  start: () => {
    console.log('Starting emulator');
    set({ isRunning: true, isPaused: false });
  },

  pause: () => {
    console.log('Pausing emulator');
    set({ isPaused: true });
  },

  reset: () => {
    console.log('Resetting emulator');
    const { currentROM } = get();
    set({
      isRunning: false,
      isPaused: false,
      currentROM,
      frameCount: 0,
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
    });
  },

  step: () => {
    // Implementation will be added in Phase 3
  },

  saveState: async () => {
    try {
      console.log('Saving emulator state');
      const state = get();
      
      if (!state.currentROM) {
        throw new Error('No ROM loaded');
      }
      
      const serializedState = await StateManager.serialize(state);
      console.log('State saved successfully');
      return serializedState;
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  },

  loadState: async (stateData: Uint8Array) => {
    try {
      console.log('Loading emulator state');
      const newState = await StateManager.deserialize(stateData);
      const currentROM = get().currentROM;
      set({ ...newState, currentROM });
      console.log('State loaded successfully');
    } catch (error) {
      console.error('Failed to load state:', error);
      throw error;
    }
  },
}));

const EmulatorContext = createContext<typeof useEmulatorStore | null>(null);

export const EmulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EmulatorContext.Provider value={useEmulatorStore}>
    {children}
  </EmulatorContext.Provider>
);

export const useEmulator = () => {
  const store = useContext(EmulatorContext);
  if (!store) throw new Error('useEmulator must be used within EmulatorProvider');
  return store();
};