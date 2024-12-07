import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { MemoryViewer } from './MemoryViewer';
import { CPUMonitor } from './CPUMonitor';
import { PPUViewer } from './PPUViewer';
import { APUMixer } from './APUMixer';

type DebugTab = 'memory' | 'cpu' | 'ppu' | 'apu';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DebugTab>('cpu');

  return (
    <div className={`fixed right-0 top-0 h-screen bg-gray-900 text-white shadow-xl transition-all ${
      isOpen ? 'w-96' : 'w-12'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-4 p-2 bg-gray-800 rounded-l-lg hover:bg-gray-700"
      >
        <Wrench className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="h-full flex flex-col p-4">
          <h2 className="text-xl font-bold mb-4">Debug Tools</h2>
          
          <div className="flex space-x-2 mb-4">
            <TabButton
              active={activeTab === 'cpu'}
              onClick={() => setActiveTab('cpu')}
            >
              CPU
            </TabButton>
            <TabButton
              active={activeTab === 'memory'}
              onClick={() => setActiveTab('memory')}
            >
              Memory
            </TabButton>
            <TabButton
              active={activeTab === 'ppu'}
              onClick={() => setActiveTab('ppu')}
            >
              PPU
            </TabButton>
            <TabButton
              active={activeTab === 'apu'}
              onClick={() => setActiveTab('apu')}
            >
              APU
            </TabButton>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'cpu' && <CPUMonitor />}
            {activeTab === 'memory' && <MemoryViewer />}
            {activeTab === 'ppu' && <PPUViewer />}
            {activeTab === 'apu' && <APUMixer />}
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);