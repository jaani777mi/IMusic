import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronUp, Cast, Volume2 } from 'lucide-react';
import { Song } from '../types/music';

interface AndroidMediaNotificationProps {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onToggleFavorite: (songId: string) => void;
  onClose: () => void;
  onOpenNowPlaying: () => void;
}

export const AndroidMediaNotification: React.FC<AndroidMediaNotificationProps> = ({
  song,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleFavorite,
  onClose,
  onOpenNowPlaying,
}) => {
  if (!song) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="absolute inset-x-0 top-0 z-50 bg-black/85 backdrop-blur-3xl border-b border-white/10 shadow-2xl p-4 transition-all duration-300">
      {/* Shade Header */}
      <div className="flex items-center justify-between pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200">IMusic Playback Service</span>
          <span>·</span>
          <span className="text-[11px] text-cyan-400">Foreground Active</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Close notification shade"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Android 13/14 Media Notification Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 to-cyan-950/40 border border-white/10 p-4 shadow-xl">
        {/* Device Switcher row */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Media Output</span>
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-cyan-300 text-[11px] font-medium hover:bg-white/15 transition-colors">
            <Cast className="w-3 h-3" />
            <span>Phone Speaker</span>
          </button>
        </div>

        {/* Song info and artwork */}
        <div className="flex items-center gap-3.5 mb-3">
          <img
            src={song.albumArt}
            alt={song.title}
            onClick={onOpenNowPlaying}
            className="w-14 h-14 rounded-2xl object-cover cursor-pointer shadow-md hover:scale-105 transition-transform border border-white/10"
          />
          <div className="flex-1 min-w-0" onClick={onOpenNowPlaying} role="button">
            <h4 className="text-sm font-semibold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors">
              {song.title}
            </h4>
            <p className="text-xs text-slate-400 truncate">{song.artist}</p>
          </div>
          <button
            onClick={() => onToggleFavorite(song.id)}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Interactive Squiggly / Linear Progress Bar */}
        <div className="mb-2">
          <div
            className="relative h-2 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(ratio * duration);
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-cyan-400 group-hover:bg-cyan-300 transition-all rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono tabular-nums">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Media Notification Controls */}
        <div className="flex items-center justify-around pt-1">
          <button
            onClick={onPrevious}
            className="p-2 text-slate-300 hover:text-white transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-11 h-11 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-lg shadow-cyan-400/30 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-slate-300 hover:text-white transition-colors"
            title="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
