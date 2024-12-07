import React, { useRef, useEffect, useState } from 'react';
import { useEmulator } from '../../contexts/EmulatorContext';

export const PPUViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ppu } = useEmulator();
  const [activeLayer, setActiveLayer] = useState(0);
  const [showSprites, setShowSprites] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create ImageData for pattern table visualization
    const imageData = ctx.createImageData(256, 256);

    // Render pattern tables from VRAM
    for (let tile = 0; tile < 256; tile++) {
      const tileX = (tile % 16) * 8;
      const tileY = Math.floor(tile / 16) * 8;

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const pixelIndex = ((tileY + y) * 256 + (tileX + x)) * 4;
          const tileData = ppu.VRAM[tile * 16 + y];
          const pixel = (tileData >> (7 - x)) & 1;
          
          // Use grayscale for pattern table visualization
          const color = pixel * 255;
          imageData.data[pixelIndex] = color;     // R
          imageData.data[pixelIndex + 1] = color; // G
          imageData.data[pixelIndex + 2] = color; // B
          imageData.data[pixelIndex + 3] = 255;   // A
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [ppu]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Pattern Tables</h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSprites}
                onChange={(e) => setShowSprites(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Sprites</span>
            </label>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={256}
          height={256}
          className="border border-gray-700"
        />
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Background Layers</h3>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <button
              key={i}
              onClick={() => setActiveLayer(i)}
              className={`p-2 rounded ${
                activeLayer === i
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Layer {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Color Palettes</h3>
        <div className="grid grid-cols-16 gap-1">
          {Array.from({ length: 256 }, (_, i) => {
            const color = ppu.CGRAM[i * 2] | (ppu.CGRAM[i * 2 + 1] << 8);
            const r = (color & 0x1F) << 3;
            const g = ((color >> 5) & 0x1F) << 3;
            const b = ((color >> 10) & 0x1F) << 3;
            return (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: `rgb(${r},${g},${b})`,
                }}
                title={`Color ${i.toString(16).toUpperCase()}`}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Sprite Data</h3>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 32 }, (_, i) => {
            const baseAddr = i * 4;
            const x = ppu.OAM[baseAddr];
            const y = ppu.OAM[baseAddr + 1];
            const tile = ppu.OAM[baseAddr + 2];
            const attr = ppu.OAM[baseAddr + 3];
            return (
              <div key={i} className="text-xs bg-gray-700 p-2 rounded">
                <div>Sprite {i}</div>
                <div>X: {x}, Y: {y}</div>
                <div>Tile: {tile}</div>
                <div>Attr: {attr.toString(16).toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};