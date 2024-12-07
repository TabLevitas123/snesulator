import React from 'react';
import { Monitor } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';

export const DisplaySettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="font-medium mb-3 flex items-center gap-2">
        <Monitor className="w-4 h-4" />
        Display
      </h3>
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.smoothing}
            onChange={(e) => updateSettings({ smoothing: e.target.checked })}
            className="w-5 h-5 rounded bg-gray-600 border border-gray-500 hover:bg-gray-500"
          />
          <div className="flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
            <span>Image Smoothing</span>
          </div>
        </label>
      </div>
    </div>
  );
};