import React from 'react';
import { EmulatorProvider } from './contexts/EmulatorContext';
import { Header } from './components/ui/Header';
import { ROMUploader } from './components/ui/rom/ROMUploader';
import { Display } from './components/emulator/Display';
import { EmulatorControls } from './components/ui/EmulatorControls';
import { TouchControls } from './components/ui/TouchControls';
import { KeyboardControls } from './components/ui/KeyboardControls';
import { MouseControls } from './components/ui/MouseControls';
import { GamepadIndicator } from './components/ui/GamepadIndicator';
import { DebugPanel } from './components/debug/DebugPanel';
import { usePlatform } from './hooks/usePlatform';
import { useSettings } from './hooks/useSettings';

function App() {
  const { capabilities } = usePlatform();
  const { gamepadEnabled } = useSettings();

  return (
    <EmulatorProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Display />
            <EmulatorControls />
            <ROMUploader />
            {gamepadEnabled && (
              <div className="flex justify-end">
                <GamepadIndicator />
              </div>
            )}
          </div>
        </main>
        {capabilities.touch && <TouchControls />}
        <KeyboardControls />
        <MouseControls />
        <DebugPanel />
      </div>
    </EmulatorProvider>
  );
}

export default App;