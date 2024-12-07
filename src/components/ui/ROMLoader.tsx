import React, { useCallback, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useEmulator } from '../../contexts/EmulatorContext';
import { ROMLoader } from '../../utils/romLoader';
import { ROMHandler } from '../../utils/fileHandlers/romHandler';
import { ROMInfo } from './ROMInfo';
import type { ROMData } from '../../types/rom';

export const ROMLoader: React.FC = () => {
  const { loadROM } = useEmulator();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [romData, setRomData] = useState<ROMData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      if (!ROMHandler.isValidROMFile(file)) {
        throw new Error('Invalid file type. Please select a .smc or .sfc file.');
      }

      const romBuffer = await ROMHandler.readROMFile(file);
      if (!ROMHandler.validateROMSize(romBuffer)) {
        throw new Error('Invalid ROM size');
      }

      const loader = new ROMLoader();
      const data = await loader.loadROM(romBuffer);
      
      if (!data.valid) {
        console.warn('ROM checksum validation failed');
      }

      setRomData(data);
      await loadROM(data.data.buffer, file.name);
    } catch (err) {
      console.error('Failed to load ROM:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ROM');
      setRomData(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadROM]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isLoading]);

  return (
    <div className="space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg border-2 border-dashed ${
          isLoading ? 'border-blue-500' : 'border-gray-600 hover:border-gray-500'
        } transition-colors duration-200 cursor-pointer`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".smc,.sfc"
          onChange={handleInputChange}
          className="hidden"
          aria-label="ROM file input"
        />

        <Upload className={`w-12 h-12 ${isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400'} mb-4`} />
        
        <div className="text-center">
          <p className="text-lg font-medium text-white mb-2">
            {isLoading ? 'Loading ROM...' : 'Load ROM File'}
          </p>
          <p className="text-sm text-gray-400">
            {isLoading ? 'Please wait...' : 'Drag & drop or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: .smc, .sfc
          </p>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/50" />
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {romData && <ROMInfo header={romData.header} />}
    </div>
  );
};