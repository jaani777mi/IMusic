import React from 'react';
import { Music2, ShieldCheck, FolderHeart, Info } from 'lucide-react';

interface AndroidPermissionDialogProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export const AndroidPermissionDialog: React.FC<AndroidPermissionDialogProps> = ({
  isOpen,
  onAllow,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Dialog card styled like Android 14 Material You Dialog */}
      <div className="w-full max-w-sm rounded-3xl bg-[#1c1b1f] border border-white/10 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Permission icon */}
        <div className="w-16 h-16 rounded-full bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
          <Music2 className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-snug">
          Allow IMusic to access music and audio on this device?
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          IMusic queries the Android <strong>MediaStore</strong> to discover your local songs, albums, artists, and audio folders.
        </p>

        {/* Technical permission badges */}
        <div className="w-full bg-white/[0.04] rounded-2xl p-3 mb-6 text-left border border-white/5 space-y-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-cyan-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="font-mono font-medium">android.permission.READ_MEDIA_AUDIO</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <FolderHeart className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>100% offline playback. Your local files never leave your device.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onAllow}
            className="w-full py-3.5 px-4 rounded-full bg-cyan-400 text-black font-semibold text-sm hover:bg-cyan-300 active:scale-[0.98] transition-all shadow-md shadow-cyan-400/20"
          >
            Allow
          </button>
          <button
            onClick={onDeny}
            className="w-full py-3 px-4 rounded-full bg-white/5 text-slate-300 font-medium text-sm hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            Don't allow
          </button>
        </div>
      </div>
    </div>
  );
};
