import React from 'react';
import { Keyboard, Mouse, Gamepad2 } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';

export const InputControls: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="font-medium mb-3">Input Controls</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.keyboardEnabled}
            onChange={(e) => updateSettings({ keyboardEnabled: e.target.checked })}
            className="w-5 h-5 rounded bg-gray-600 border border-gray-500 hover:bg-gray-500"
          />
          <div className="flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
            <Keyboard className="w-4 h-4" />
            <span>Keyboard Controls</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.mouseEnabled}
            onChange={(e) => updateSettings({ mouseEnabled: e.target.checked })}
            className="w-5 h-5 rounded bg-gray-600 border border-gray-500 hover:bg-gray-500"
          />
          <div className="flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
            <Mouse className="w-4 h-4" />
            <span>Mouse Controls</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.gamepadEnabled}
            onChange={(e) => updateSettings({ gamepadEnabled: e.target.checked })}
            className="w-5 h-5 rounded bg-gray-600 border border-gray-500 hover:bg-gray-500"
          />
          <div className="flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
            <Gamepad2 className="w-4 h-4" />
            <span>Gamepad Controls</span>
          </div>
        </label>
      </div>
    </div>
  );
};