import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Smartphone, Layers, Download } from 'lucide-react';
import { KOTLIN_ANDROID_FILES } from '../data/androidKotlinCode';

interface KotlinCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KotlinCodeViewerModal: React.FC<KotlinCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('service');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = KOTLIN_ANDROID_FILES.find((f) => f.id === selectedFileId) || KOTLIN_ANDROID_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-4xl h-[90vh] rounded-3xl bg-[#090b10] border border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Native Android Kotlin & Media3 Architecture
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production-ready code with Media3 ExoPlayer, MediaSessionService & MediaStore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/5 transition-colors"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold shadow-md shadow-cyan-400/20 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex gap-1 p-2 bg-black/60 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
          {KOTLIN_ANDROID_FILES.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedFileId === file.id
                  ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        {/* File Description Header */}
        <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-cyan-300/80 truncate">{currentFile.path}</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">{currentFile.description}</span>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#050608] font-mono text-xs text-slate-200 leading-relaxed no-scrollbar select-text">
          <pre className="whitespace-pre overflow-x-auto">{currentFile.code}</pre>
        </div>

        {/* Footer Architecture Notes */}
        <div className="p-3 bg-black/60 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Architecture: MVVM + MediaSessionService + Clean ContentResolver</span>
          </div>
          <span className="font-mono text-slate-500">Android 8.0 (API 26) to Android 15 (API 35)</span>
        </div>
      </div>
    </div>
  );
};
