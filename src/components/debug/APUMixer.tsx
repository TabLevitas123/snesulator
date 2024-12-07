import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useEmulator } from '../../contexts/EmulatorContext';

interface WaveformData {
  data: Float32Array;
  position: number;
}

export const APUMixer: React.FC = () => {
  const { apu } = useEmulator();
  const [volumes, setVolumes] = useState(Array(8).fill(100));
  const [muted, setMuted] = useState(Array(8).fill(false));
  const [waveforms, setWaveforms] = useState<WaveformData[]>(
    Array(8).fill({ data: new Float32Array(1024), position: 0 })
  );
  const [solo, setSolo] = useState<number | null>(null);
  const [masterVolume, setMasterVolume] = useState(100);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    canvasRefs.current = canvasRefs.current.slice(0, 8);
  }, []);

  useEffect(() => {
    const drawWaveforms = () => {
      waveforms.forEach((waveform, index) => {
        const canvas = canvasRefs.current[index];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw waveform
        ctx.beginPath();
        ctx.strokeStyle = muted[index] ? '#EF4444' : '#60A5FA';
        ctx.lineWidth = 2;

        const step = waveform.data.length / canvas.width;
        const scale = canvas.height / 2;

        for (let i = 0; i < canvas.width; i++) {
          const dataIndex = Math.floor(i * step);
          const x = i;
          const y = (waveform.data[dataIndex] * scale) + (canvas.height / 2);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });
    };

    const animationId = requestAnimationFrame(drawWaveforms);
    return () => cancelAnimationFrame(animationId);
  }, [waveforms, muted]);

  const handleVolumeChange = (channel: number, value: number) => {
    const newVolumes = [...volumes];
    newVolumes[channel] = value;
    setVolumes(newVolumes);
  };

  const handleMasterVolumeChange = (value: number) => {
    setMasterVolume(value);
  };

  const handleMute = (channel: number) => {
    const newMuted = [...muted];
    newMuted[channel] = !newMuted[channel];
    setMuted(newMuted);
  };

  const handleSolo = (channel: number) => {
    setSolo(solo === channel ? null : channel);
    const newMuted = Array(8).fill(false);
    if (solo !== channel) {
      newMuted.forEach((_, i) => {
        if (i !== channel) newMuted[i] = true;
      });
    }
    setMuted(newMuted);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Master Volume</h3>
          <span className="text-sm">{masterVolume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={masterVolume}
          onChange={(e) => handleMasterVolumeChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium">Voice {i + 1}</h3>
              <button
                onClick={() => handleSolo(i)}
                className={`px-2 py-1 text-xs rounded ${
                  solo === i
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Solo
              </button>
            </div>
            <button
              onClick={() => handleMute(i)}
              className={`p-1 rounded hover:bg-gray-700 ${
                muted[i] ? 'text-red-500' : 'text-white'
              }`}
            >
              {muted[i] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <input
              type="range"
              min="0"
              max="100"
              value={volumes[i]}
              onChange={(e) => handleVolumeChange(i, parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-sm">
              {volumes[i]}%
            </span>
          </div>

          <div className="relative">
            <canvas
              ref={el => canvasRefs.current[i] = el}
              width={300}
              height={60}
              className="w-full h-16 bg-gray-900 rounded"
            />
            <div className="absolute bottom-1 left-1 text-xs text-gray-500">
              {apu?.spc700 ? (
                <>
                  Pitch: {apu.spc700.a}
                  {' | '}
                  Vol: {apu.spc700.x}
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>ADSR: {apu?.dspRegisters?.[i * 16 + 5] ?? 0}</div>
            <div>Pitch: {apu?.dspRegisters?.[i * 16 + 2] ?? 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
};