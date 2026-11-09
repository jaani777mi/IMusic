import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Sliders,
  Moon,
  Mic2,
  Info,
  ListMusic,
  Share2,
} from 'lucide-react';
import { Song, RepeatMode } from '../types/music';
import { audioEngine } from '../utils/audioEngine';

interface NowPlayingScreenProps {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (id: string) => void;
  onCollapse: () => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onOpenLyrics: () => void;
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  song,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onCollapse,
  onOpenEqualizer,
  onOpenSleepTimer,
  onOpenLyrics,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Live FFT Audio Visualizer Animation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderVisualizer = () => {
      animId = requestAnimationFrame(renderVisualizer);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const freqData = audioEngine.getVisualizerData();
      const barCount = 32;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i] || 0;
        const normalized = val / 255;
        // If not playing, keep a subtle ambient resting wave
        const effectiveHeight = isPlaying ? Math.max(4, normalized * height) : Math.sin(Date.now() / 600 + i * 0.3) * 6 + 8;

        const x = i * (barWidth + 2);
        const y = height - effectiveHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, y);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
        gradient.addColorStop(0.7, 'rgba(0, 229, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, effectiveHeight, [4, 4, 0, 0]);
        ctx.fill();
      }
    };

    renderVisualizer();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  if (!song) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col justify-between overflow-y-auto no-scrollbar animate-fadeIn select-none">
      {/* Liquid Refraction Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-blue-600/10 blur-[90px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full px-6 pt-12 pb-4 flex items-center justify-between">
        <button
          onClick={onCollapse}
          className="p-2.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Collapse to mini player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[10px] tracking-widest text-cyan-400 font-bold uppercase block">
            ExoPlayer Media3
          </span>
          <span className="text-xs text-slate-400 truncate max-w-[200px] inline-block">
            {song.album}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Song Info"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Section: Rounded Album Artwork & Liquid Visualizer */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 my-auto">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,229,255,0.2)] border border-white/15 group">
          <img
            src={song.albumArt}
            alt={song.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Live FFT Canvas Visualizer */}
        <div className="w-64 sm:w-72 h-14 mt-6 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={280}
            height={56}
            className="w-full h-full opacity-80"
          />
        </div>
      </div>

      {/* Lower Section: Titles, Slider, Controls, and Utility Pills */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 pb-10">
        {/* Title, Artist & Favorite */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {song.title}
            </h2>
            <p className="text-sm font-medium text-slate-400 truncate mt-0.5">{song.artist}</p>
          </div>

          <button
            onClick={() => onToggleFavorite(song.id)}
            className="p-3 rounded-full hover:bg-white/10 transition-transform active:scale-90"
            title="Favorite"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                song.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Progress Slider */}
        <div className="mb-6">
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
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_#00e5ff]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono tabular-nums">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center justify-between mb-8 px-2">
          {/* Shuffle */}
          <button
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-full transition-colors ${
              isShuffle ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-white'
            }`}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={onPrevious}
            className="p-2.5 text-slate-200 hover:text-white hover:scale-110 active:scale-95 transition-all"
            title="Previous Track"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          {/* Giant Liquid Play / Pause */}
          <button
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)] active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="p-2.5 text-slate-200 hover:text-white hover:scale-110 active:scale-95 transition-all"
            title="Next Track"
          >
            <SkipForward className="w-7 h-7" />
          </button>

          {/* Repeat */}
          <button
            onClick={onToggleRepeat}
            className={`p-2.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Utility Controls: Equalizer, Lyrics, Sleep Timer */}
        <div className="flex items-center justify-around pt-3 border-t border-white/10">
          <button
            onClick={onOpenEqualizer}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[11px] font-medium">Equalizer</span>
          </button>

          <button
            onClick={onOpenLyrics}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Mic2 className="w-5 h-5" />
            <span className="text-[11px] font-medium">Lyrics</span>
          </button>

          <button
            onClick={onOpenSleepTimer}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Moon className="w-5 h-5" />
            <span className="text-[11px] font-medium">Sleep Timer</span>
          </button>
        </div>
      </div>

      {/* Song Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#11131a] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Track Metadata</h3>
            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">Title:</span>
                <span className="text-white font-sans text-sm font-semibold">{song.title}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Artist:</span>
                <span>{song.artist}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Album:</span>
                <span>{song.album}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Genre & Year:</span>
                <span>{song.genre} · {song.year || '2024'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">File Path:</span>
                <span className="text-cyan-300 break-all">{song.filePath}</span>
              </div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-2.5 rounded-full bg-cyan-400 text-black font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
