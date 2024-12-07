import { useEffect, useCallback } from 'react';
import { useEmulator } from '../contexts/EmulatorContext';

export interface KeyboardMapping {
  up: string;
  down: string;
  left: string;
  right: string;
  a: string;
  b: string;
  x: string;
  y: string;
  start: string;
  select: string;
  l: string;
  r: string;
}

const defaultMapping: KeyboardMapping = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  a: 'x',
  b: 'z',
  x: 's',
  y: 'a',
  start: 'Enter',
  select: 'ShiftRight',
  l: 'q',
  r: 'w'
};

export const useKeyboard = (mapping: KeyboardMapping = defaultMapping) => {
  const { isRunning } = useEmulator();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isRunning) return;
    
    // Prevent default browser actions for mapped keys
    if (Object.values(mapping).includes(event.key)) {
      event.preventDefault();
    }
    
    // Handle key press
    switch (event.key) {
      case mapping.up:
        // Handle up input
        break;
      case mapping.down:
        // Handle down input
        break;
      case mapping.left:
        // Handle left input
        break;
      case mapping.right:
        // Handle right input
        break;
      case mapping.a:
        // Handle A button
        break;
      case mapping.b:
        // Handle B button
        break;
      case mapping.x:
        // Handle X button
        break;
      case mapping.y:
        // Handle Y button
        break;
      case mapping.start:
        // Handle start button
        break;
      case mapping.select:
        // Handle select button
        break;
      case mapping.l:
        // Handle L button
        break;
      case mapping.r:
        // Handle R button
        break;
    }
  }, [isRunning, mapping]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isRunning) return;
    
    if (Object.values(mapping).includes(event.key)) {
      event.preventDefault();
    }
    
    // Handle key release
    // Similar switch statement as handleKeyDown but for releasing buttons
  }, [isRunning, mapping]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { mapping };
};