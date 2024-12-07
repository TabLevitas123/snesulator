import React from 'react';
import { useKeyboard, KeyboardMapping } from '../../hooks/useKeyboard';
import { useSettings } from '../../hooks/useSettings';

interface KeyboardControlsProps {
  mapping?: KeyboardMapping;
}

export const KeyboardControls: React.FC<KeyboardControlsProps> = ({ mapping }) => {
  const { keyboardEnabled } = useSettings();
  useKeyboard(mapping);

  if (!keyboardEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
      <h3 className="font-bold mb-2">Keyboard Controls</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>↑↓←→: D-Pad</div>
        <div>X: A Button</div>
        <div>Z: B Button</div>
        <div>S: X Button</div>
        <div>A: Y Button</div>
        <div>Enter: Start</div>
        <div>R-Shift: Select</div>
        <div>Q/W: L/R</div>
      </div>
    </div>
  );
};