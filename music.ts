export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  albumArt: string;
  year?: number;
  genre: string;
  filePath: string;
  isFavorite?: boolean;
  lyrics?: string[];
  url?: string;
  isLocal?: boolean;
  synthPreset?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  year: number;
  songsCount: number;
  genre: string;
}

export interface Artist {
  id: string;
  name: string;
  songsCount: number;
  albumsCount: number;
  image: string;
}

export interface Folder {
  path: string;
  name: string;
  songsCount: number;
  songs: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  coverArt: string;
  songIds: string[];
  createdAt: string;
  isCustom?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type ExoPlayerState = 'STATE_IDLE' | 'STATE_BUFFERING' | 'STATE_READY' | 'STATE_ENDED';

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
  bassBoost: number; // 0 to 100
}

export type AndroidPermissionState = 'PROMPT' | 'GRANTED' | 'DENIED';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}
