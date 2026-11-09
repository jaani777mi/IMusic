import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Sparkles,
  Lock,
  Code2,
  Maximize2,
  Minimize2,
  FolderSync,
  Sliders,
  Moon,
  Mic2,
  Bot,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { Song, Album, Artist, Playlist, RepeatMode } from './types/music';
import {
  INITIAL_DEMO_SONGS,
  DEMO_ALBUMS,
  DEMO_ARTISTS,
  DEMO_PLAYLISTS,
} from './data/demoLibrary';
import { audioEngine } from './utils/audioEngine';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidMediaNotification } from './components/AndroidMediaNotification';
import { AndroidLockScreen } from './components/AndroidLockScreen';
import { AndroidPermissionDialog } from './components/AndroidPermissionDialog';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingScreen } from './components/NowPlayingScreen';
import { LibraryView } from './components/LibraryView';
import { EqualizerModal } from './components/EqualizerModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { LyricsModal } from './components/LyricsModal';
import { GeminiChatSheet } from './components/GeminiChatSheet';
import { KotlinCodeViewerModal } from './components/KotlinCodeViewerModal';

export default function App() {
  // Library State
  const [songs, setSongs] = useState<Song[]>(INITIAL_DEMO_SONGS);
  const [albums] = useState<Album[]>(DEMO_ALBUMS);
  const [artists] = useState<Artist[]>(DEMO_ARTISTS);
  const [playlists, setPlaylists] = useState<Playlist[]>(DEMO_PLAYLISTS);

  // Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(INITIAL_DEMO_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_DEMO_SONGS[0].duration || 180);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Equalizer & Audio DSP State
  const [equalizerGains, setEqualizerGains] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);
  const [bassBoost, setBassBoost] = useState(0);

  // Sleep Timer State
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);

  // Android System & Overlays State
  const [hasPermission, setHasPermission] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showNotificationShade, setShowNotificationShade] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showGeminiChat, setShowGeminiChat] = useState(false);
  const [showKotlinCode, setShowKotlinCode] = useState(false);

  // Frame presentation: 'frame' (Android Phone mock) or 'expanded' (fullscreen desktop)
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [scanToast, setScanToast] = useState<string | null>(null);

  // Audio Engine Lifecycle Callbacks
  useEffect(() => {
    audioEngine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      if (dur > 0) setDuration(dur);
    });

    audioEngine.onEnded(() => {
      handleNextTrack();
    });

    audioEngine.onStateChange((state) => {
      if (state === 'ready') setIsPlaying(true);
      if (state === 'idle') setIsPlaying(false);
    });
  }, [currentSong, songs, repeatMode, isShuffle]);

  // Sleep Timer countdown interval
  useEffect(() => {
    if (sleepTimerSecondsLeft === null) return;
    if (sleepTimerSecondsLeft <= 0) {
      audioEngine.pause();
      setIsPlaying(false);
      setSleepTimerSecondsLeft(null);
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerSecondsLeft]);

  // Handle Play/Pause
  const handlePlayPause = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      if (currentSong) {
        audioEngine.play();
        setIsPlaying(true);
      }
    }
  };

  // Play specific song
  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    audioEngine.setSong(song, true);
    setIsPlaying(true);
  };

  // Skip Next
  const handleNextTrack = () => {
    if (!currentSong || songs.length === 0) return;

    if (repeatMode === 'one') {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % songs.length;
    }

    const nextSong = songs[nextIndex];
    handlePlaySong(nextSong);
  };

  // Skip Previous
  const handlePreviousTrack = () => {
    if (!currentSong || songs.length === 0) return;
    if (currentTime > 3) {
      // If played more than 3s, restart current song (standard Android player behavior)
      audioEngine.seek(0);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlaySong(songs[prevIndex]);
  };

  // Seek
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  // Toggle Repeat Mode: off -> all -> one -> off
  const handleToggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
    if (currentSong?.id === id) {
      setCurrentSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Update Equalizer
  const handleUpdateEqualizer = (
    newGains: [number, number, number, number, number],
    newBass: number
  ) => {
    setEqualizerGains(newGains);
    setBassBoost(newBass);
    audioEngine.setEqualizer(newGains, newBass);
  };

  // Set Sleep Timer
  const handleSetSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerSecondsLeft(null);
    } else {
      setSleepTimerSecondsLeft(minutes * 60);
    }
  };

  // Scan real local audio files from user's device/phone
  const handleScanDeviceFiles = (files: FileList) => {
    const newSongs: Song[] = [];

    Array.from(files).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const path = `/storage/emulated/0/Music/Scanned/${file.name}`;

      newSongs.push({
        id: `local-${Date.now()}-${idx}`,
        title: cleanName,
        artist: 'Local Device File',
        album: 'Scanned Media',
        duration: 210, // Default estimate until loaded
        albumArt: '/src/assets/images/album_cyber_beats_1794206018060.jpg',
        genre: 'Local Audio',
        filePath: path,
        isFavorite: false,
        url,
        isLocal: true,
      });
    });

    if (newSongs.length > 0) {
      setSongs((prev) => [...newSongs, ...prev]);
      handlePlaySong(newSongs[0]);
      setScanToast(`Discovered & indexed ${newSongs.length} local audio files via MediaStore!`);
      setTimeout(() => setScanToast(null), 4000);
    }
  };

  // Create custom playlist
  const handleCreatePlaylist = (name: string) => {
    const newPl: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      coverArt: currentSong?.albumArt || '/src/assets/images/album_neon_synthwave_1794206016611.jpg',
      songIds: currentSong ? [currentSong.id] : [],
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true,
    };
    setPlaylists((prev) => [...prev, newPl]);
    setScanToast(`Playlist "${name}" created!`);
    setTimeout(() => setScanToast(null), 3000);
  };

  // Queue songs from AI DJ recommendations
  const handleQueueSongsFromAI = (songTitles: string[]) => {
    const foundSongs = songs.filter((s) =>
      songTitles.some((title) => s.title.toLowerCase().includes(title.toLowerCase()))
    );
    if (foundSongs.length > 0) {
      handlePlaySong(foundSongs[0]);
      setScanToast(`Queued ${foundSongs.length} AI curated tracks in IMusic!`);
      setTimeout(() => setScanToast(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4">
      {/* Top Universal Control Bar (Desktop Host Toolbar) */}
      <div className="w-full max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 border-b border-white/5 mb-2">
        {/* Brand */}
        <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
          <div className="w-6 h-6 rounded-lg bg-cyan-400 flex items-center justify-center text-black font-extrabold shadow-[0_0_12px_#00e5ff]">
            iM
          </div>
          <span className="text-cyan-400">IMusic</span>
          <span className="text-slate-500 text-xs font-normal">Native Android Player</span>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Gemini AI DJ */}
          <button
            onClick={() => setShowGeminiChat(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-400/30 transition-all font-medium active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>AI DJ</span>
          </button>

          {/* Android Kotlin Code Inspector */}
          <button
            onClick={() => setShowKotlinCode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors font-medium"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Kotlin Code</span>
          </button>

          {/* Lock Screen Test */}
          <button
            onClick={() => setShowLockScreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
            title="Lock Android Phone Simulator"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Lock Screen</span>
          </button>

          {/* Frame Toggle */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title={isPhoneFrame ? 'Switch to Fullscreen Tablet View' : 'Switch to Phone Mock Frame'}
          >
            {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Container: Android Phone Shell or Expanded View */}
      <div
        className={`relative transition-all duration-300 flex flex-col overflow-hidden ${
          isPhoneFrame
            ? 'w-full max-w-[420px] h-[92vh] max-h-[880px] rounded-[48px] border-[10px] border-[#181a20] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(0,229,255,0.15)] bg-black'
            : 'w-full max-w-5xl h-[88vh] rounded-3xl border border-white/10 shadow-2xl bg-black'
        }`}
      >
        {/* Android Authentic Status Bar */}
        <AndroidStatusBar
          isPlaying={isPlaying}
          onToggleNotificationShade={() => setShowNotificationShade(!showNotificationShade)}
        />

        {/* Pull-down Android 13/14 Media Notification Shade */}
        {showNotificationShade && (
          <AndroidMediaNotification
            song={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            onSeek={handleSeek}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setShowNotificationShade(false)}
            onOpenNowPlaying={() => {
              setShowNotificationShade(false);
              setShowNowPlaying(true);
            }}
          />
        )}

        {/* Lock Screen View */}
        {showLockScreen && (
          <AndroidLockScreen
            song={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            onUnlock={() => setShowLockScreen(false)}
          />
        )}

        {/* Library Navigation & Content */}
        <LibraryView
          songs={songs}
          albums={albums}
          artists={artists}
          playlists={playlists}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={handlePlaySong}
          onToggleFavorite={handleToggleFavorite}
          onScanDeviceFiles={handleScanDeviceFiles}
          onRequestPermission={() => setShowPermissionDialog(true)}
          hasPermission={hasPermission}
          onCreatePlaylist={handleCreatePlaylist}
        />

        {/* Floating Mini Player */}
        <MiniPlayer
          song={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onNext={handleNextTrack}
          onToggleFavorite={handleToggleFavorite}
          onExpand={() => setShowNowPlaying(true)}
        />

        {/* Android Gesture Navigation Pill at Bottom */}
        <div className="w-full h-5 flex items-center justify-center shrink-0 bg-black">
          <div className="w-32 h-1 rounded-full bg-white/25 hover:bg-cyan-400/60 transition-colors cursor-pointer" />
        </div>

        {/* Full-Screen Now Playing Screen */}
        {showNowPlaying && (
          <NowPlayingScreen
            song={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            onPlayPause={handlePlayPause}
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            onSeek={handleSeek}
            onToggleShuffle={() => setIsShuffle(!isShuffle)}
            onToggleRepeat={handleToggleRepeat}
            onToggleFavorite={handleToggleFavorite}
            onCollapse={() => setShowNowPlaying(false)}
            onOpenEqualizer={() => setShowEqualizer(true)}
            onOpenSleepTimer={() => setShowSleepTimer(true)}
            onOpenLyrics={() => setShowLyrics(true)}
          />
        )}
      </div>

      {/* MediaStore Scan Toast Notification */}
      {scanToast && (
        <div className="fixed bottom-6 z-50 px-4 py-2.5 rounded-full bg-cyan-400 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{scanToast}</span>
        </div>
      )}

      {/* Android 13/14 Runtime Permission Dialog */}
      <AndroidPermissionDialog
        isOpen={showPermissionDialog}
        onAllow={() => {
          setHasPermission(true);
          setShowPermissionDialog(false);
          setScanToast('READ_MEDIA_AUDIO granted! Ready to scan device storage.');
          setTimeout(() => setScanToast(null), 3000);
        }}
        onDeny={() => {
          setHasPermission(false);
          setShowPermissionDialog(false);
        }}
      />

      {/* 5-Band Equalizer Modal */}
      <EqualizerModal
        isOpen={showEqualizer}
        onClose={() => setShowEqualizer(false)}
        gains={equalizerGains}
        bassBoost={bassBoost}
        onUpdateEqualizer={handleUpdateEqualizer}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
        activeTimerSeconds={sleepTimerSecondsLeft}
        onSetTimer={handleSetSleepTimer}
      />

      {/* Synchronized Lyrics Sheet */}
      <LyricsModal
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        song={currentSong}
        currentTime={currentTime}
      />

      {/* Gemini AI DJ & Companion Drawer */}
      <GeminiChatSheet
        isOpen={showGeminiChat}
        onClose={() => setShowGeminiChat(false)}
        currentSong={currentSong}
        onQueueSongs={handleQueueSongsFromAI}
      />

      {/* Kotlin Jetpack Compose Architecture Code Viewer */}
      <KotlinCodeViewerModal
        isOpen={showKotlinCode}
        onClose={() => setShowKotlinCode(false)}
      />
    </div>
  );
}
