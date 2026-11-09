import React, { useState } from 'react';
import { X, Sliders, Volume2, RotateCcw, Check } from 'lucide-react';
import { EQUALIZER_PRESETS } from '../data/demoLibrary';
import { EqualizerPreset } from '../types/music';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gains: [number, number, number, number, number];
  bassBoost: number;
  onUpdateEqualizer: (gains: [number, number, number, number, number], bassBoost: number) => void;
}

const BAND_LABELS = ['60 Hz', '230 Hz', '910 Hz', '3.6 kHz', '14 kHz'];
const BAND_ROLES = ['Sub Bass', 'Bass', 'Midrange', 'Presence', 'Treble'];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  gains,
  bassBoost,
  onUpdateEqualizer,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('flat');

  if (!isOpen) return null;

  const handleGainChange = (index: number, value: number) => {
    const newGains = [...gains] as [number, number, number, number, number];
    newGains[index] = value;
    setSelectedPresetId('custom');
    onUpdateEqualizer(newGains, bassBoost);
  };

  const handleBassBoostChange = (value: number) => {
    setSelectedPresetId('custom');
    onUpdateEqualizer(gains, value);
  };

  const applyPreset = (preset: EqualizerPreset) => {
    setSelectedPresetId(preset.id);
    onUpdateEqualizer(preset.gains, preset.bassBoost);
  };

  const handleReset = () => {
    setSelectedPresetId('flat');
    onUpdateEqualizer([0, 0, 0, 0, 0], 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#0d0f14] border border-white/10 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">5-Band Equalizer</h3>
              <p className="text-xs text-slate-400">Media3 Audio Processor & Bass Boost</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reset to Flat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Horizontal Chips */}
        <div className="py-4">
          <span className="text-xs text-slate-400 font-medium block mb-2">Preset Profiles</span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {EQUALIZER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedPresetId === preset.id
                    ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {selectedPresetId === preset.id && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Vertical Sliders */}
        <div className="bg-black/50 rounded-2xl border border-white/5 p-4 my-2">
          <div className="grid grid-cols-5 gap-2 h-48 items-end justify-items-center">
            {gains.map((gain, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-between w-full">
                <span className="text-[11px] font-mono text-cyan-300 tabular-nums">
                  {gain > 0 ? `+${gain}` : gain}dB
                </span>

                {/* Vertical Range Slider */}
                <div className="relative flex items-center justify-center h-32 w-8">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={gain}
                    onChange={(e) => handleGainChange(idx, Number(e.target.value))}
                    className="h-28 w-1.5 accent-cyan-400 cursor-pointer appearance-none bg-white/20 rounded-full focus:outline-none"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                    }}
                  />
                </div>

                <div className="text-center">
                  <span className="text-xs font-semibold text-white block">{BAND_LABELS[idx]}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{BAND_ROLES[idx]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bass Boost Slider */}
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-white">Liquid Bass Boost</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 tabular-nums">{bassBoost}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={bassBoost}
            onChange={(e) => handleBassBoostChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-white/15 accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-sm transition-all shadow-lg shadow-cyan-400/20 active:scale-[0.98]"
        >
          Apply & Close
        </button>
      </div>
    </div>
  );
};
