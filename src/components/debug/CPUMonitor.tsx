import React, { useEffect, useState } from 'react';
import { useEmulator } from '../../contexts/EmulatorContext';
import type { CPUState } from '../../types/emulator';
import { InterruptType } from '../emulator/interrupts/InterruptController';

export const CPUMonitor: React.FC = () => {
  const { cpu } = useEmulator();
  const [state, setState] = useState<CPUState>(cpu);
  const [interruptLog, setInterruptLog] = useState<string[]>([]);

  useEffect(() => {
    setState(cpu);
  }, [cpu]);

  const flags = {
    N: (state.P & 0x80) !== 0, // Negative
    V: (state.P & 0x40) !== 0, // Overflow
    M: (state.P & 0x20) !== 0, // Memory Select
    X: (state.P & 0x10) !== 0, // Index Register Select
    D: (state.P & 0x08) !== 0, // Decimal Mode
    I: (state.P & 0x04) !== 0, // IRQ Disable
    Z: (state.P & 0x02) !== 0, // Zero
    C: (state.P & 0x01) !== 0, // Carry
  };

  const handleInterrupt = (type: InterruptType) => {
    setInterruptLog(prev => [
      `${new Date().toISOString()} - ${type} Interrupt`,
      ...prev.slice(0, 9)
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <RegisterDisplay name="A" value={state.A} />
        <RegisterDisplay name="X" value={state.X} />
        <RegisterDisplay name="Y" value={state.Y} />
        <RegisterDisplay name="SP" value={state.SP} />
        <RegisterDisplay name="PC" value={state.PC} />
        <RegisterDisplay name="P" value={state.P} />
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Flags</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(flags).map(([flag, value]) => (
            <div
              key={flag}
              className={`text-center p-1 rounded ${
                value ? 'bg-green-600' : 'bg-gray-700'
              }`}
              title={getFlagDescription(flag)}
            >
              {flag}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Interrupt Log</h3>
        <div className="space-y-1 text-sm font-mono">
          {interruptLog.map((log, index) => (
            <div key={index} className="text-gray-400">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RegisterDisplay: React.FC<{ name: string; value: number }> = ({
  name,
  value
}) => (
  <div className="bg-gray-800 p-2 rounded-lg">
    <div className="text-sm text-gray-400">{name}</div>
    <div className="font-mono">
      ${value.toString(16).toUpperCase().padStart(4, '0')}
    </div>
  </div>
);

function getFlagDescription(flag: string): string {
  switch (flag) {
    case 'N': return 'Negative Flag';
    case 'V': return 'Overflow Flag';
    case 'M': return 'Memory Select (8/16-bit)';
    case 'X': return 'Index Register Select (8/16-bit)';
    case 'D': return 'Decimal Mode';
    case 'I': return 'IRQ Disable';
    case 'Z': return 'Zero Flag';
    case 'C': return 'Carry Flag';
    default: return '';
  }
}