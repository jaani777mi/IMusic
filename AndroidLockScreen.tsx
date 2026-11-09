import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Play, Pause, SkipBack, SkipForward, ChevronUp, Music } from 'lucide-react';
import { Song } from '../types/music';

interface AndroidLockScreenProps {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onUnlock: () => void;
}

export const AndroidLockScreen: React.FC<AndroidLockScreenProps> = ({
  song,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onUnlock,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('12:45');
  const [currentDateStr, setCurrentDateStr] = useState<string>('Sunday, Nov 8');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
      setCurrentDateStr(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between p-6 select-none animate-fadeIn">
      {/* Background ambient wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-black to-black pointer-events-none" />

      {/* Top Lock status & Large Clock */}
      <div className="relative z-10 flex flex-col items-center pt-8">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-6 text-slate-300">
          <Lock className="w-4 h-4" />
        </div>
        <h1 className="text-6xl font-extralight tracking-tight text-white mb-1 font-mono">
          {currentTimeStr}
        </h1>
        <p className="text-sm font-medium text-cyan-400 tracking-wide">{currentDateStr}</p>
      </div>

      {/* Center: Lock Screen Media Widget */}
      {song && (
        <div className="relative z-10 w-full max-w-sm mx-auto rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/15 p-4 shadow-2xl">
          <div className="flex items-center gap-3.5 mb-3">
            <img
              src={song.albumArt}
              alt={song.title}
              className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase block">
                IMusic Playing
              </span>
              <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
              <p className="text-xs text-slate-400 truncate">{song.artist}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-3">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-around">
            <button
              onClick={onPrevious}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/30 hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom: Swipe up to unlock affordance */}
      <div
        onClick={onUnlock}
        className="relative z-10 flex flex-col items-center pb-4 cursor-pointer group"
      >
        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 animate-bounce transition-colors" />
        <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
          Swipe up or tap to unlock
        </span>
      </div>
    </div>
  );
};
