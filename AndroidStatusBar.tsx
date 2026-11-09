import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Music, Bell } from 'lucide-react';

interface AndroidStatusBarProps {
  onToggleNotificationShade?: () => void;
  isPlaying?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  onToggleNotificationShade,
  isPlaying = false,
}) => {
  const [time, setTime] = useState<string>('12:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onToggleNotificationShade}
      className="w-full h-8 px-6 flex items-center justify-between text-xs text-slate-300 select-none cursor-pointer hover:bg-white/[0.03] transition-colors relative z-30"
      title="Click to pull down Android Media Notification Shade"
    >
      {/* Left side: Time & Playing Icon */}
      <div className="flex items-center gap-2 font-medium tracking-tight">
        <span>{time}</span>
        {isPlaying && (
          <span className="flex items-center text-cyan-400 animate-pulse text-[11px]" title="IMusic Playing">
            <Music className="w-3 h-3" />
          </span>
        )}
      </div>

      {/* Center: Camera Punch hole simulation */}
      <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20 mx-auto shadow-inner" />

      {/* Right side: 5G, Wi-Fi, Battery */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-slate-400">5G</span>
        <Signal className="w-3 h-3 text-slate-300" />
        <Wifi className="w-3 h-3 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono tabular-nums text-slate-300">89%</span>
          <Battery className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
        </div>
      </div>
    </div>
  );
};
