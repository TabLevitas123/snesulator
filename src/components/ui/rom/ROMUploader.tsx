import React, { useCallback } from 'react';
import { DropZone } from './DropZone';
import { ErrorMessage } from './ErrorMessage';
import { ROMInfo } from './ROMInfo';
import { useROMLoader } from '../../../hooks/useROMLoader';

export const ROMUploader: React.FC = () => {
  const { romData, error, isLoading, progress, processFile, clearError } = useROMLoader();

  const handleFileSelect = useCallback((file: File) => {
    processFile(file).catch(err => {
      console.error('Error processing ROM file:', err);
    });
  }, [processFile]);

  return (
    <div className="space-y-4">
      <DropZone
        isLoading={isLoading}
        onFileSelect={handleFileSelect}
      />

      {error && (
        <ErrorMessage
          message={error}
          details={{ progress }}
          onDismiss={clearError}
        />
      )}

      {romData && <ROMInfo header={romData.header} />}
    </div>
  );
};