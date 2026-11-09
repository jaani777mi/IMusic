import React, { useState, useRef } from 'react';
import {
  Music2,
  Disc3,
  Users,
  FolderOpen,
  ListMusic,
  Search,
  ArrowUpDown,
  FolderSync,
  Play,
  Heart,
  MoreVertical,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Song, Album, Artist, Folder, Playlist } from '../types/music';

interface LibraryViewProps {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (id: string) => void;
  onScanDeviceFiles: (files: FileList) => void;
  onRequestPermission: () => void;
  hasPermission: boolean;
  onCreatePlaylist: (name: string) => void;
}

export type TabType = 'songs' | 'albums' | 'artists' | 'folders' | 'playlists';
export type SortOption = 'title' | 'artist' | 'duration' | 'recent';

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  albums,
  artists,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
  onScanDeviceFiles,
  onRequestPermission,
  hasPermission,
  onCreatePlaylist,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [showPlaylistCreateModal, setShowPlaylistCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group songs into folders
  const foldersMap = songs.reduce((acc, song) => {
    const folderPath = song.filePath.substring(0, song.filePath.lastIndexOf('/')) || '/storage/emulated/0/Music';
    const folderName = folderPath.split('/').pop() || 'Music';
    if (!acc[folderPath]) {
      acc[folderPath] = { path: folderPath, name: folderName, songsCount: 0, songs: [] };
    }
    acc[folderPath].songsCount++;
    acc[folderPath].songs.push(song);
    return acc;
  }, {} as Record<string, Folder>);

  const foldersList = Object.values(foldersMap);

  // Filter songs based on search
  const filteredSongs = songs
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'duration') return b.duration - a.duration;
      return 0;
    });

  const handleScanClick = () => {
    if (!hasPermission) {
      onRequestPermission();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onScanDeviceFiles(e.target.files);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black text-slate-100 select-none">
      {/* Hidden file input for real device audio selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Search Bar & MediaStore Scan Button */}
      <div className="p-4 pb-2 space-y-3">
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white focus-within:border-cyan-400/60 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent placeholder-slate-500 focus:outline-none text-white text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* MediaStore Scan Local Files Button */}
          <button
            onClick={handleScanClick}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs transition-transform active:scale-95 shadow-md shadow-cyan-400/15 shrink-0"
            title="Scan device local storage for audio files via MediaStore"
          >
            <FolderSync className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Phone</span>
          </button>
        </div>

        {/* Tab Navigation (Songs, Albums, Artists, Folders, Playlists) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'songs', label: 'Songs', icon: Music2 },
            { id: 'albums', label: 'Albums', icon: Disc3 },
            { id: 'artists', label: 'Artists', icon: Users },
            { id: 'folders', label: 'Folders', icon: FolderOpen },
            { id: 'playlists', label: 'Playlists', icon: ListMusic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSelectedFolder(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Library Subheader with Count & Sort */}
      <div className="px-5 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-white/5">
        <span>
          {activeTab === 'songs' && `${filteredSongs.length} Tracks`}
          {activeTab === 'albums' && `${albums.length} Albums`}
          {activeTab === 'artists' && `${artists.length} Artists`}
          {activeTab === 'folders' && `${foldersList.length} Folders`}
          {activeTab === 'playlists' && `${playlists.length} Playlists`}
        </span>

        {activeTab === 'songs' && (
          <div className="flex items-center gap-1 text-[11px]">
            <ArrowUpDown className="w-3 h-3 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="title" className="bg-[#111]">Sort by Title</option>
              <option value="artist" className="bg-[#111]">Sort by Artist</option>
              <option value="duration" className="bg-[#111]">Sort by Duration</option>
            </select>
          </div>
        )}

        {activeTab === 'playlists' && (
          <button
            onClick={() => setShowPlaylistCreateModal(true)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        )}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        {/* SONGS TAB */}
        {activeTab === 'songs' && (
          <div className="space-y-1">
            {filteredSongs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/40 border border-cyan-500/30 shadow-md shadow-cyan-950/30'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Index or Equalizer visualizer */}
                    <div className="w-6 text-center text-xs font-mono text-slate-500 shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <span className="w-0.5 h-3 bg-cyan-400 animate-pulse" />
                          <span className="w-0.5 h-2 bg-cyan-400 animate-ping" />
                          <span className="w-0.5 h-3 bg-cyan-400 animate-pulse" />
                        </div>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Artwork */}
                    <img
                      src={song.albumArt}
                      alt={song.title}
                      className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                    />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isCurrent ? 'text-cyan-400' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {song.artist} · {song.album}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {formatSeconds(song.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(song.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          song.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredSongs.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-xs">
                No songs found matching your search.
              </div>
            )}
          </div>
        )}

        {/* ALBUMS TAB */}
        {activeTab === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => {
                  const firstSong = songs.find((s) => s.album === album.title);
                  if (firstSong) onPlaySong(firstSong);
                }}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md border border-white/10">
                  <img
                    src={album.artwork}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {album.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {album.artist} · {album.year}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ARTISTS TAB */}
        {activeTab === 'artists' && (
          <div className="space-y-2">
            {artists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => {
                  const firstSong = songs.find((s) => s.artist === artist.name);
                  if (firstSong) onPlaySong(firstSong);
                }}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition-colors"
              >
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover border border-cyan-400/30"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{artist.name}</h4>
                  <p className="text-xs text-slate-400">
                    {artist.songsCount} {artist.songsCount === 1 ? 'Track' : 'Tracks'} · {artist.albumsCount} Album
                  </p>
                </div>
                <div className="p-2 text-cyan-400 hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOLDERS TAB */}
        {activeTab === 'folders' && (
          <div>
            {!selectedFolder ? (
              <div className="space-y-2">
                {foldersList.map((folder) => (
                  <div
                    key={folder.path}
                    onClick={() => setSelectedFolder(folder.path)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {folder.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-500 truncate">
                          {folder.path}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 font-medium">
                      {folder.songsCount} songs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="text-xs text-cyan-400 hover:underline mb-3 flex items-center gap-1"
                >
                  ← Back to Folders List
                </button>
                <h4 className="text-sm font-bold text-white mb-2">
                  {foldersMap[selectedFolder]?.name} ({foldersMap[selectedFolder]?.songsCount} tracks)
                </h4>
                <div className="space-y-1">
                  {foldersMap[selectedFolder]?.songs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => onPlaySong(song)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.04] cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={song.albumArt}
                          alt={song.title}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{song.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {formatSeconds(song.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLAYLISTS TAB */}
        {activeTab === 'playlists' && (
          <div className="grid grid-cols-2 gap-3 p-1">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => {
                  const songToPlay = songs.find((s) => pl.songIds.includes(s.id));
                  if (songToPlay) onPlaySong(songToPlay);
                }}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md border border-white/10">
                  <img
                    src={pl.coverArt}
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {pl.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {pl.songIds.length} Tracks
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showPlaylistCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs rounded-3xl bg-[#11131a] border border-white/10 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Create New Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowPlaylistCreateModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    onCreatePlaylist(newPlaylistName.trim());
                    setNewPlaylistName('');
                    setShowPlaylistCreateModal(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-cyan-400 text-black font-semibold text-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
