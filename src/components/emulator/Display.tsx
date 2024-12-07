import React from 'react';
import { Canvas } from './Canvas';
import { Mode7Controls } from '../ui/Mode7Controls';
import { useEmulator } from '../../contexts/EmulatorContext';
import { usePlatform } from '../../hooks/usePlatform';

export const Display: React.FC = () => {
  const { isRunning, currentROM } = useEmulator();
  const { isMobile } = usePlatform();

  // Calculate optimal scale based on screen size
  const scale = isMobile ? 1.5 : 2.5;

  if (!isRunning || !currentROM) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-900 rounded-lg">
        <p className="text-gray-400">No ROM loaded</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-center items-center bg-gray-900 p-4 rounded-lg">
        <Canvas scale={scale} />
      </div>
      <Mode7Controls />
    </div>
  );
};