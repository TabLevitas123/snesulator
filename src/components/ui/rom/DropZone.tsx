import React, { useCallback, useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface DropZoneProps {
  isLoading: boolean;
  onFileSelect: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ isLoading, onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCountRef.current = 0;

    if (isLoading) return;

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      return ['.smc', '.sfc'].includes(ext);
    });

    if (validFile) {
      onFileSelect(validFile);
    }
  }, [isLoading, onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading || !e.target.files?.length) return;

    const file = e.target.files[0];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (['.smc', '.sfc'].includes(ext)) {
      onFileSelect(file);
    }
    
    // Reset input
    e.target.value = '';
  }, [isLoading, onFileSelect]);

  const openFileDialog = useCallback(() => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isLoading]);

  return (
    <div
      ref={dropZoneRef}
      className={`
        relative min-h-[200px] flex flex-col items-center justify-center p-8 
        bg-gray-800 rounded-lg border-2 border-dashed transition-all duration-200
        ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-600'}
        ${!isLoading && !isDragging ? 'hover:border-gray-500 hover:bg-gray-700/50 cursor-pointer' : ''}
      `}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".smc,.sfc"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="ROM file input"
      />

      {isLoading ? (
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      ) : (
        <Upload 
          className={`w-12 h-12 mb-4 ${isDragging ? 'text-indigo-400' : 'text-gray-400'}`}
        />
      )}
      
      <div className="text-center">
        <p className="text-lg font-medium text-white mb-2">
          {isLoading ? 'Loading ROM...' : isDragging ? 'Drop ROM File Here' : 'Load ROM File'}
        </p>
        <p className="text-sm text-gray-400">
          {isLoading ? 'Please wait...' : 'Drag & drop or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: .smc, .sfc
        </p>
      </div>

      {isLoading && (
        <div className="absolute inset-0" onClick={e => e.stopPropagation()} />
      )}
    </div>
  );
};