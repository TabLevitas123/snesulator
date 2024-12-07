import React, { useState, useEffect } from 'react';
import { useEmulator } from '../../contexts/EmulatorContext';

export const MemoryViewer: React.FC = () => {
  const { memory } = useEmulator();
  const [address, setAddress] = useState(0);
  const [rows] = useState(16);
  const [cols] = useState(16);
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    // Update memory data when address changes
    const data: number[] = [];
    for (let i = 0; i < rows * cols; i++) {
      const currentAddress = (address + i) & 0xFFFF;
      data.push(memory?.read(currentAddress) ?? 0);
    }
    setMemoryData(data);
  }, [address, memory]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 16);
    if (!isNaN(value)) {
      setAddress(value & 0xFFFF);
    }
  };

  const handleCellClick = (index: number) => {
    setSelectedCell(index);
    setEditValue((memoryData[index] ?? 0).toString(16).padStart(2, '0'));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 2);
    setEditValue(value);
  };

  const handleValueSubmit = () => {
    if (selectedCell === null) return;

    const value = parseInt(editValue, 16);
    if (!isNaN(value)) {
      const targetAddress = (address + selectedCell) & 0xFFFF;
      memory?.write(targetAddress, value);
      
      // Update local memory data
      const newData = [...memoryData];
      newData[selectedCell] = value;
      setMemoryData(newData);
    }
    setSelectedCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValueSubmit();
    } else if (e.key === 'Escape') {
      setSelectedCell(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm">Address:</label>
          <input
            type="text"
            value={address.toString(16).toUpperCase().padStart(4, '0')}
            onChange={handleAddressChange}
            className="bg-gray-800 px-2 py-1 rounded w-20 font-mono"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setAddress((address - 256) & 0xFFFF)}
            className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700"
          >
            ← Page
          </button>
          <button
            onClick={() => setAddress((address + 256) & 0xFFFF)}
            className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700"
          >
            Page →
          </button>
        </div>
      </div>

      <div className="font-mono text-sm">
        <div className="flex mb-2">
          <div className="w-16"></div>
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="w-8 text-center text-gray-400">
              {i.toString(16).toUpperCase()}
            </div>
          ))}
        </div>

        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex">
            <div className="w-16 text-gray-400">
              {(address + row * 16)
                .toString(16)
                .toUpperCase()
                .padStart(4, '0')}
            </div>
            {Array.from({ length: cols }, (_, col) => {
              const index = row * cols + col;
              const isSelected = selectedCell === index;
              return (
                <div
                  key={col}
                  className={`w-8 text-center cursor-pointer hover:bg-gray-700 ${
                    isSelected ? 'bg-blue-600' : ''
                  }`}
                  onClick={() => handleCellClick(index)}
                >
                  {isSelected ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={handleValueChange}
                      onKeyDown={handleKeyDown}
                      onBlur={handleValueSubmit}
                      className="w-full bg-transparent text-center outline-none"
                      autoFocus
                    />
                  ) : (
                    (memoryData[index] ?? 0)
                      .toString(16)
                      .toUpperCase()
                      .padStart(2, '0')
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400">
        <p>Click a cell to edit its value. Press Enter to save or Escape to cancel.</p>
        <p>Values are in hexadecimal format (00-FF).</p>
      </div>
    </div>
  );
};