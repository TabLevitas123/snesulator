import { useState, useCallback } from 'react';
import { useEmulator } from '../contexts/EmulatorContext';

interface Mode7Effects {
  rotation: number;
  scale: number;
  horizontalFlip: boolean;
  verticalFlip: boolean;
  perspective: boolean;
  horizon: boolean;
}

export const useMode7Controls = () => {
  const [effects, setEffects] = useState<Mode7Effects>({
    rotation: 0,
    scale: 1,
    horizontalFlip: false,
    verticalFlip: false,
    perspective: false,
    horizon: false
  });

  const { isRunning } = useEmulator();

  const updateEffects = useCallback((newEffects: Partial<Mode7Effects>) => {
    if (!isRunning) return;

    setEffects(prev => ({
      ...prev,
      ...newEffects
    }));

    // Update will be handled by the emulator worker
  }, [isRunning]);

  return {
    effects,
    updateEffects
  };
};