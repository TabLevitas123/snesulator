import { useState, useEffect } from 'react';
import { useEmulator } from '../contexts/EmulatorContext';

interface GamepadState {
  [index: number]: Gamepad | null;
}

export const useGamepad = () => {
  const [gamepads, setGamepads] = useState<GamepadState>({});
  const { isRunning } = useEmulator();

  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      setGamepads(prev => ({
        ...prev,
        [e.gamepad.index]: e.gamepad
      }));
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      setGamepads(prev => ({
        ...prev,
        [e.gamepad.index]: null
      }));
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const pollGamepads = () => {
      const currentGamepads = navigator.getGamepads();
      setGamepads(Object.fromEntries(
        Array.from(currentGamepads).map((gamepad, index) => [index, gamepad])
      ));
    };

    const intervalId = setInterval(pollGamepads, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, [isRunning]);

  return { gamepads };
};