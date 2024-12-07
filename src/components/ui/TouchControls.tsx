import React from 'react';
import { useEmulator } from '../../contexts/EmulatorContext';

export const TouchControls: React.FC = () => {
  const { isRunning } = useEmulator();

  if (!isRunning) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/50 p-4 touch-none">
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {/* D-Pad */}
        <div className="relative aspect-square">
          <div className="absolute inset-0 bg-white/20 rounded-full">
            <button className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/30 rounded-full" />
            <button className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/30 rounded-full" />
            <button className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full" />
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Center buttons */}
        <div className="flex justify-center items-center gap-4">
          <button className="w-12 h-8 bg-white/30 rounded-lg">Select</button>
          <button className="w-12 h-8 bg-white/30 rounded-lg">Start</button>
        </div>

        {/* Action buttons */}
        <div className="relative aspect-square">
          <div className="absolute inset-0 bg-white/20 rounded-full">
            <button className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/30 rounded-full">Y</button>
            <button className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/30 rounded-full">B</button>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full">X</button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full">A</button>
          </div>
        </div>
      </div>
    </div>
  );
};