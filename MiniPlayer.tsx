import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { Song } from '../types/music';

interface MiniPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onToggleFavorite: (id: string) => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  song,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onToggleFavorite,
  onExpand,
}) => {
  if (!song) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative mx-3 mb-2 rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl transition-all duration-300">
      {/* Mini Player Row */}
      <div className="flex items-center justify-between p-2.5 gap-3">
        {/* Album Artwork + Song Info (Click to expand) */}
        <div
          onClick={onExpand}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
            <img
              src={song.albumArt}
              alt={song.title}
              className={`w-full h-full object-cover ${isPlaying ? 'brightness-110' : ''}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {song.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(song.id);
            }}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
            title="Toggle Favorite"
          >
            <Heart
              className={`w-4 h-4 ${
                song.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-md shadow-cyan-400/20 active:scale-95 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thin Neon Bottom Progress Bar */}
      <div className="h-0.5 w-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-cyan-400 shadow-[0_0_8px_#00e5ff] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
