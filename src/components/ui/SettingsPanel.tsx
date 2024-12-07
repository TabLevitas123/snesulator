import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { InputControls } from './settings/InputControls';
import { DisplaySettings } from './settings/DisplaySettings';

export const SettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsOpen(false);
          }
        }}>
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <InputControls />
              <DisplaySettings />
            </div>
          </div>
        </div>
      )}
    </>
  );
};