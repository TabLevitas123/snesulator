import React from 'react';
import { FileText, HardDrive, Globe, Tag, Hash } from 'lucide-react';
import { ROMHeader } from '../../../types/rom';

interface ROMInfoProps {
  header: ROMHeader;
}

export const ROMInfo: React.FC<ROMInfoProps> = ({ header }) => {
  const getRegionName = (code: number): string => {
    switch (code) {
      case 0: return 'Japan';
      case 1: return 'USA';
      case 2: return 'Europe';
      case 3: return 'Sweden';
      case 4: return 'Finland';
      case 5: return 'Denmark';
      case 6: return 'France';
      case 7: return 'Netherlands';
      case 8: return 'Spain';
      case 9: return 'Germany';
      case 10: return 'Italy';
      case 11: return 'China';
      case 12: return 'Indonesia';
      case 13: return 'Korea';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        ROM Information
      </h3>
      
      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Name:</span>
          <span className="font-medium">{header.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Type:</span>
            <span className="font-medium">{header.type}</span>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Region:</span>
            <span className="font-medium">{getRegionName(header.country)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400">ROM Size:</span>
            <span className="font-medium ml-2">
              {(header.size / 1024).toFixed(2)} KB
            </span>
          </div>

          <div>
            <span className="text-gray-400">SRAM:</span>
            <span className="font-medium ml-2">
              {(header.sramSize / 1024).toFixed(2)} KB
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400">Version:</span>
            <span className="font-medium ml-2">1.{header.version}</span>
          </div>

          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-sm">
              {header.checksum.toString(16).toUpperCase().padStart(4, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};