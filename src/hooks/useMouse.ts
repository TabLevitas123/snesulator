import { useEffect, useCallback, useState } from 'react';
import { useEmulator } from '../contexts/EmulatorContext';

interface MousePosition {
  x: number;
  y: number;
}

export const useMouse = () => {
  const { isRunning } = useEmulator();
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isLeftPressed, setIsLeftPressed] = useState(false);
  const [isRightPressed, setIsRightPressed] = useState(false);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isRunning) return;
    
    setPosition({
      x: event.clientX,
      y: event.clientY
    });
  }, [isRunning]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!isRunning) return;
    
    if (event.button === 0) {
      setIsLeftPressed(true);
    } else if (event.button === 2) {
      setIsRightPressed(true);
    }
  }, [isRunning]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!isRunning) return;
    
    if (event.button === 0) {
      setIsLeftPressed(false);
    } else if (event.button === 2) {
      setIsRightPressed(false);
    }
  }, [isRunning]);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleContextMenu]);

  return {
    position,
    isLeftPressed,
    isRightPressed
  };
};