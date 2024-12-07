import React from 'react';
import { RotateCw, ZoomIn, FlipHorizontal, FlipVertical, Eye, Mountain } from 'lucide-react';
import { useMode7Controls } from '../../hooks/useMode7Controls';
import { useEmulator } from '../../contexts/EmulatorContext';

export const Mode7Controls: React.FC = () => {
  const { effects, updateEffects } = useMode7Controls();
  const { isRunning } = useEmulator();

  if (!isRunning) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <RotateCw className="w-4 h-4" />
        Mode 7 Controls
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Rotation</label>
          <input
            type="range"
            min="0"
            max="359"
            value={effects.rotation}
            onChange={(e) => updateEffects({
              rotation: parseInt(e.target.value)
            })}
            className="w-full"
          />
          <span className="text-sm">{effects.rotation}°</span>
        </div>

        <div>
          <label className="block text-sm mb-2">Scale</label>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={effects.scale}
            onChange={(e) => updateEffects({
              scale: parseFloat(e.target.value)
            })}
            className="w-full"
          />
          <span className="text-sm">{effects.scale}x</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => updateEffects({
              horizontalFlip: !effects.horizontalFlip
            })}
            className={`flex items-center gap-2 px-3 py-2 rounded ${
              effects.horizontalFlip ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            H-Flip
          </button>

          <button
            onClick={() => updateEffects({
              verticalFlip: !effects.verticalFlip
            })}
            className={`flex items-center gap-2 px-3 py-2 rounded ${
              effects.verticalFlip ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <FlipVertical className="w-4 h-4" />
            V-Flip
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={effects.perspective}
              onChange={(e) => updateEffects({
                perspective: e.target.checked
              })}
              className="rounded"
            />
            <Eye className="w-4 h-4" />
            Perspective
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={effects.horizon}
              onChange={(e) => updateEffects({
                horizon: e.target.checked
              })}
              className="rounded"
            />
            <Mountain className="w-4 h-4" />
            Horizon Effect
          </label>
        </div>
      </div>
    </div>
  );
};