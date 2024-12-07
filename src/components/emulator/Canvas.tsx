import React, { useRef, useEffect, useState } from 'react';
import { useEmulator } from '../../contexts/EmulatorContext';
import { WebGLRenderer } from './renderer/WebGLRenderer';

interface CanvasProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  width = 256,
  height = 224,
  scale = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const { isRunning } = useEmulator();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isRunning) return;

    try {
      // Initialize WebGL renderer
      rendererRef.current = new WebGLRenderer(canvas);
      rendererRef.current.resize(width * scale, height * scale);

      // Animation frame loop for rendering
      let animationFrameId: number;
      const render = () => {
        if (rendererRef.current) {
          rendererRef.current.render();
        }
        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
        rendererRef.current?.destroy();
        rendererRef.current = null;
      };
    } catch (err) {
      console.error('WebGL initialization failed:', err);
      setError('WebGL not supported. Please use a modern browser.');
    }
  }, [isRunning, width, height, scale]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width * scale}
        height={height * scale}
        className="bg-black rounded-lg shadow-lg"
      />
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </>
  );
};