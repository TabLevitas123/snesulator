import { useState, useCallback } from 'react';
import { useEmulator } from '../contexts/EmulatorContext';
import { ROMLoader } from '../utils/rom/loader';
import type { ROMData } from '../types/rom';
import type { LoadProgress } from '../utils/rom/types';

export const useROMLoader = () => {
  const { loadROM } = useEmulator();
  const [romData, setRomData] = useState<ROMData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<LoadProgress[]>([]);

  const processFile = useCallback(async (file: File) => {
    console.log('Processing ROM file:', { name: file.name, size: file.size });
    
    try {
      setIsLoading(true);
      setError(null);
      setProgress([]);

      const data = await ROMLoader.load(file, (progress) => {
        console.log('ROM loading progress:', progress);
        setProgress(prev => [...prev, progress]);
      });

      console.log('ROM loaded successfully:', {
        name: data.header.name,
        type: data.header.type,
        size: data.header.size
      });

      setRomData(data);
      await loadROM(data.data.buffer, file.name);
    } catch (err) {
      console.error('ROM loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ROM');
      setRomData(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadROM]);

  const clearError = useCallback(() => {
    setError(null);
    setProgress([]);
  }, []);

  return {
    romData,
    error,
    isLoading,
    progress,
    processFile,
    clearError
  };
};