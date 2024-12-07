import React from 'react';
import { useMouse } from '../../hooks/useMouse';
import { useSettings } from '../../hooks/useSettings';

export const MouseControls: React.FC = () => {
  const { mouseEnabled } = useSettings();
  const { position, isLeftPressed, isRightPressed } = useMouse();

  if (!mouseEnabled) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
      <h3 className="font-bold mb-2">Mouse Controls</h3>
      <div className="space-y-1">
        <div>Left Click: A Button</div>
        <div>Right Click: B Button</div>
        <div>Position: {position.x}, {position.y}</div>
        <div className="flex gap-2">
          <div className={`w-2 h-2 rounded-full ${isLeftPressed ? 'bg-green-500' : 'bg-gray-500'}`} />
          <div className={`w-2 h-2 rounded-full ${isRightPressed ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>
      </div>
    </div>
  );
};