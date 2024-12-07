import { useState, useCallback, DragEvent } from 'react';

interface UseDragAndDropOptions {
  onDrop: (file: File) => void;
  accept?: string[];
}

export const useDragAndDrop = ({ onDrop, accept = ['.smc', '.sfc'] }: UseDragAndDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the drop zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files[0];
    if (!file) return;

    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!accept.includes(fileExtension)) {
      console.warn('Invalid file type:', fileExtension);
      return;
    }

    onDrop(file);
  }, [onDrop, accept]);

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    }
  };
};