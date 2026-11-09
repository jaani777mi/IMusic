import React from 'react';
import { X, Mic2, Music } from 'lucide-react';
import { Song } from '../types/music';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  currentTime: number;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  song,
  currentTime,
}) => {
  if (!isOpen || !song) return null;

  // Parse lyrics with timestamps like [00:12.00] Line content
  const parsedLyrics = (song.lyrics || []).map((line) => {
    const match = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const timestamp = minutes * 60 + seconds;
      const text = match[3].trim();
      return { timestamp, text };
    }
    return { timestamp: 0, text: line };
  });

  // Find the active lyric index
  let activeIndex = -1;
  for (let i = 0; i < parsedLyrics.length; i++) {
    if (currentTime >= parsedLyrics[i].timestamp) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-md h-[80vh] rounded-t-3xl sm:rounded-3xl bg-[#090b10] border border-white/10 flex flex-col p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient liquid glow behind lyrics */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/20">
              <Mic2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{song.title}</h3>
              <p className="text-xs text-slate-400 truncate">{song.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics scrollable list */}
        <div className="flex-1 overflow-y-auto py-8 space-y-6 text-center no-scrollbar relative z-10">
          {parsedLyrics.length > 0 ? (
            parsedLyrics.map((item, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <p
                  key={idx}
                  className={`text-base sm:text-lg font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-300 scale-105 drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] font-bold'
                      : isPast
                      ? 'text-slate-500'
                      : 'text-slate-600'
                  }`}
                >
                  {item.text || '♪ ♪ ♪'}
                </p>
              );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Music className="w-10 h-10 mb-3 opacity-40 text-cyan-400" />
              <p className="text-sm">Instrumental track or lyrics not available</p>
            </div>
          )}
        </div>

        {/* Bottom hint */}
        <div className="text-center pt-3 border-t border-white/5 text-[11px] text-slate-500 font-mono relative z-10 shrink-0">
          Syncing with ExoPlayer audio timeline
        </div>
      </div>
    </div>
  );
};
