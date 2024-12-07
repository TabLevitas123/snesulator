import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { useEmulator } from '../../contexts/EmulatorContext';
import { SaveStateButton } from './SaveStateButton';
import { SettingsPanel } from './SettingsPanel';

export const Header: React.FC = () => {
  const { isRunning, isPaused } = useEmulator();

  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-6 h-6" />
            <h1 className="text-xl font-bold">SNES Web Emulator</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`inline-block w-2 h-2 rounded-full ${
                isRunning && !isPaused ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm">
                {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
              </span>
            </div>
            
            <SaveStateButton />
            <SettingsPanel />
          </div>
        </div>
      </div>
    </header>
  );
};