import React from 'react';
import { Gamepad } from 'lucide-react';
import { useGamepad } from '../../hooks/useGamepad';

export const GamepadIndicator: React.FC = () => {
  const { gamepads } = useGamepad();
  const connectedCount = Object.values(gamepads).filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      <Gamepad className={`w-5 h-5 ${connectedCount > 0 ? 'text-green-500' : 'text-gray-400'}`} />
      <span className="text-sm">{connectedCount} Connected</span>
    </div>
  );
};