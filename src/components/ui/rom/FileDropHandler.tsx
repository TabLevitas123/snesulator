import React, { useRef, useEffect } from 'react';

interface FileDropHandlerProps {
  onDrop: (file: File) => void;
  accept?: string[];
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const FileDropHandler: React.FC<FileDropHandlerProps> = ({
  onDrop,
  accept = ['.smc', '.sfc'],
  children,
  className = '',
  disabled = false,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const dropzone = dropRef.current;
    if (!dropzone || disabled) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      dropzone.classList.add('drag-active');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        dropzone.classList.remove('drag-active');
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-active');
      dragCounter.current = 0;

      const file = e.dataTransfer?.files[0];
      if (!file) return;

      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (accept.includes(fileExtension)) {
        onDrop(file);
      }
    };

    dropzone.addEventListener('dragenter', handleDragEnter);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('drop', handleDrop);

    return () => {
      dropzone.removeEventListener('dragenter', handleDragEnter);
      dropzone.removeEventListener('dragleave', handleDragLeave);
      dropzone.removeEventListener('dragover', handleDragOver);
      dropzone.removeEventListener('drop', handleDrop);
    };
  }, [onDrop, accept, disabled]);

  return (
    <div ref={dropRef} className={className}>
      {children}
    </div>
  );
};