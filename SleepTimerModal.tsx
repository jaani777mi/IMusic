import React from 'react';
import { X, Moon, Clock, Check } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTimerSeconds: number | null;
  onSetTimer: (minutes: number | null) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeTimerSeconds,
  onSetTimer,
}) => {
  if (!isOpen) return null;

  const timerOptions = [
    { label: '15 Minutes', minutes: 15 },
    { label: '30 Minutes', minutes: 30 },
    { label: '45 Minutes', minutes: 45 },
    { label: '60 Minutes', minutes: 60 },
  ];

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#0f1118] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/20">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sleep Timer</h3>
              <p className="text-xs text-slate-400">Gentle volume fade-out</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Banner */}
        {activeTimerSeconds !== null && (
          <div className="mt-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 text-xs">
              <Clock className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Stops playing in:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-cyan-400 text-sm tabular-nums">
                {formatCountdown(activeTimerSeconds)}
              </span>
              <button
                onClick={() => onSetTimer(null)}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Turn off
              </button>
            </div>
          </div>
        )}

        {/* Option list */}
        <div className="py-4 space-y-2">
          {timerOptions.map((opt) => (
            <button
              key={opt.minutes}
              onClick={() => {
                onSetTimer(opt.minutes);
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between text-sm text-slate-200 transition-all active:scale-[0.99]"
            >
              <span>{opt.label}</span>
              <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                {activeTimerSeconds !== null && Math.ceil(activeTimerSeconds / 60) === opt.minutes && (
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        {activeTimerSeconds !== null && (
          <button
            onClick={() => {
              onSetTimer(null);
              onClose();
            }}
            className="w-full py-3 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium text-xs transition-colors border border-rose-500/20"
          >
            Cancel Active Timer
          </button>
        )}
      </div>
    </div>
  );
};
