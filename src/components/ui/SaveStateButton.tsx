import React, { useState, useRef } from 'react';
import { Save, Upload } from 'lucide-react';
import { useEmulator } from '../../contexts/EmulatorContext';
import { SaveHandler } from '../../utils/fileHandlers/saveHandler';
import { ROMHandler } from '../../utils/fileHandlers/romHandler';

export const SaveStateButton: React.FC = () => {
  const { currentROM, saveState, loadState } = useEmulator();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!currentROM?.name) {
      setError('No ROM loaded');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const state = await saveState();
      const filename = ROMHandler.getSuggestedSaveFileName(currentROM.name);
      await SaveHandler.writeSaveFile(state, filename);
    } catch (error) {
      console.error('Failed to save state:', error);
      setError('Failed to save state');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentROM) {
      if (!currentROM) setError('No ROM loaded');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!SaveHandler.isValidSaveFile(file)) {
        throw new Error('Invalid save file format');
      }

      const state = await SaveHandler.readSaveFile(file);
      await loadState(state);
    } catch (error) {
      console.error('Failed to load state:', error);
      setError(error instanceof Error ? error.message : 'Failed to load state');
    } finally {
      setLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const isDisabled = loading || !currentROM;

  return (
    <div className="relative flex gap-2">
      <button
        onClick={handleSave}
        disabled={isDisabled}
        className={`p-2 rounded-lg transition-colors ${
          isDisabled 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        title={currentROM ? 'Save State' : 'Load a ROM first'}
      >
        <Save className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
      </button>

      <label 
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          isDisabled 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
        title={currentROM ? 'Load State' : 'Load a ROM first'}
      >
        <Upload className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
        <input
          ref={fileInputRef}
          type="file"
          accept=".sav"
          onChange={handleLoad}
          disabled={isDisabled}
          className="hidden"
        />
      </label>

      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-500/10 text-red-500 px-3 py-1 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
};