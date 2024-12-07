import React from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';
import { useEmulator } from '../../contexts/EmulatorContext';

export const EmulatorControls: React.FC = () => {
  const { isRunning, isPaused, start, pause, reset, saveState } = useEmulator();

  const handleSave = async () => {
    try {
      const state = await saveState();
      // TODO: Implement save state UI
      console.log('State saved:', state.length, 'bytes');
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 rounded-lg">
      {!isRunning || isPaused ? (
        <button
          onClick={start}
          className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
        >
          <Play className="w-6 h-6 text-white" />
        </button>
      ) : (
        <button
          onClick={pause}
          className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-full transition-colors"
        >
          <Pause className="w-6 h-6 text-white" />
        </button>
      )}

      <button
        onClick={reset}
        className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
      >
        <RotateCcw className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={handleSave}
        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
      >
        <Save className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};