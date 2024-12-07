import { useEffect, useRef } from 'react';
import { wrap, Remote } from 'comlink';
import { useEmulator } from '../contexts/EmulatorContext';

export const useEmulatorCore = () => {
  const workerRef = useRef<Worker | null>(null);
  const coreRef = useRef<Remote<any> | null>(null);
  const { isRunning, isPaused, start: startEmulator, pause: pauseEmulator } = useEmulator();

  useEffect(() => {
    // Create worker and wrap with Comlink
    workerRef.current = new Worker(
      new URL('../workers/emulatorCore.ts', import.meta.url),
      { type: 'module' }
    );
    coreRef.current = wrap(workerRef.current);

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!coreRef.current) return;

    if (isRunning && !isPaused) {
      coreRef.current.start();
    } else {
      coreRef.current.pause();
    }
  }, [isRunning, isPaused]);

  const loadROM = async (romData: ArrayBuffer) => {
    if (!coreRef.current) return;
    
    try {
      await coreRef.current.loadROM(romData);
      startEmulator();
    } catch (error) {
      console.error('Failed to load ROM:', error);
      throw error;
    }
  };

  const saveState = async () => {
    if (!coreRef.current) return new Uint8Array();
    return await coreRef.current.saveState();
  };

  const loadState = async (stateData: Uint8Array) => {
    if (!coreRef.current) return;
    await coreRef.current.loadState(stateData);
  };

  return {
    loadROM,
    saveState,
    loadState,
  };
};