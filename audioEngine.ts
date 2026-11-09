import { Song } from '../types/music';

// Web Audio API Engine supporting real audio playback, local file playback,
// 5-band Equalizer, Bass Boost, and Live FFT Analyser for visualizers.

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private bassBoostNode: BiquadFilterNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private masterGain: GainNode | null = null;

  // Procedural Synth scheduler for offline demo tracks
  private isSynthPlaying = false;
  private synthIntervalId: any = null;
  private currentSong: Song | null = null;
  private synthStartTime = 0;
  private synthPauseOffset = 0;

  // Callbacks
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onStateChangeCallback: ((state: 'idle' | 'buffering' | 'ready' | 'ended') => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initAudioContext() {
    if (this.audioCtx) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 1.0;

    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 128;
    this.analyserNode.smoothingTimeConstant = 0.85;

    // Bass Boost Filter (Low Shelf @ 80Hz)
    this.bassBoostNode = this.audioCtx.createBiquadFilter();
    this.bassBoostNode.type = 'lowshelf';
    this.bassBoostNode.frequency.value = 80;
    this.bassBoostNode.gain.value = 0;

    // 5-Band Equalizer: 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
    const frequencies = [60, 230, 910, 3600, 14000];
    this.eqFilters = frequencies.map((freq, idx) => {
      const filter = this.audioCtx!.createBiquadFilter();
      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === frequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Wire up filter graph:
    // [Source/Synth] -> [EQ 0] -> [EQ 1] -> [EQ 2] -> [EQ 3] -> [EQ 4] -> [Bass Boost] -> [Master Gain] -> [Analyser] -> [Destination]
    for (let i = 0; i < this.eqFilters.length - 1; i++) {
      this.eqFilters[i].connect(this.eqFilters[i + 1]);
    }
    this.eqFilters[this.eqFilters.length - 1].connect(this.bassBoostNode);
    this.bassBoostNode.connect(this.masterGain);
    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(this.audioCtx.destination);

    // Audio element listener setup
    this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
    this.sourceNode.connect(this.eqFilters[0]);

    this.audioElement.addEventListener('timeupdate', () => {
      if (!this.audioElement) return;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audioElement.currentTime, this.audioElement.duration || 1);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    this.audioElement.addEventListener('waiting', () => {
      this.onStateChangeCallback?.('buffering');
    });

    this.audioElement.addEventListener('playing', () => {
      this.onStateChangeCallback?.('ready');
    });
  }

  public async setSong(song: Song, autoPlay = true) {
    this.initAudioContext();
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.stop();
    this.currentSong = song;
    this.onStateChangeCallback?.('buffering');

    if (song.url) {
      // Real audio track or user-uploaded file via Object URL
      this.isSynthPlaying = false;
      this.audioElement!.src = song.url;
      this.audioElement!.currentTime = 0;
      if (autoPlay) {
        try {
          await this.audioElement!.play();
          this.onStateChangeCallback?.('ready');
        } catch (e) {
          console.warn('Autoplay prevented or network error:', e);
        }
      }
    } else {
      // Procedural synthesizer track for offline demo
      this.isSynthPlaying = true;
      this.synthPauseOffset = 0;
      if (autoPlay) {
        this.startSynthPlayback();
      }
    }
  }

  public async play() {
    this.initAudioContext();
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (!this.currentSong) return;

    if (this.currentSong.url) {
      try {
        await this.audioElement?.play();
        this.onStateChangeCallback?.('ready');
      } catch (err) {
        console.warn('Playback error:', err);
      }
    } else {
      this.startSynthPlayback();
    }
  }

  public pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    if (this.isSynthPlaying) {
      this.stopSynthPlayback(true);
    }
    this.onStateChangeCallback?.('idle');
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.stopSynthPlayback(false);
    this.synthPauseOffset = 0;
    this.onStateChangeCallback?.('idle');
  }

  public seek(seconds: number) {
    if (this.currentSong?.url && this.audioElement) {
      this.audioElement.currentTime = seconds;
    } else if (this.isSynthPlaying) {
      this.synthPauseOffset = seconds;
      this.synthStartTime = this.audioCtx ? this.audioCtx.currentTime - seconds : 0;
      this.onTimeUpdateCallback?.(seconds, this.currentSong?.duration || 180);
    }
  }

  public setVolume(volume: number) {
    this.initAudioContext();
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioCtx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public setEqualizer(gains: [number, number, number, number, number], bassBoost: number) {
    this.initAudioContext();
    if (!this.audioCtx) return;

    gains.forEach((gain, index) => {
      if (this.eqFilters[index]) {
        this.eqFilters[index].gain.setTargetAtTime(gain, this.audioCtx!.currentTime, 0.05);
      }
    });

    if (this.bassBoostNode) {
      // Map bassBoost (0-100) to gain (0 to 12dB)
      const boostGain = (bassBoost / 100) * 12;
      this.bassBoostNode.gain.setTargetAtTime(boostGain, this.audioCtx.currentTime, 0.05);
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64);
    }
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // --- Procedural Web Audio Synth Music Engine for Copyright-Free Offline Playback ---
  private startSynthPlayback() {
    if (!this.audioCtx) return;
    this.isSynthPlaying = true;
    this.synthStartTime = this.audioCtx.currentTime - this.synthPauseOffset;
    this.onStateChangeCallback?.('ready');

    if (this.synthIntervalId) clearInterval(this.synthIntervalId);

    let step = Math.floor(this.synthPauseOffset * 4); // 4 steps per second (16th notes / 120 bpm)

    this.synthIntervalId = setInterval(() => {
      if (!this.audioCtx || !this.isSynthPlaying || !this.currentSong) return;

      const elapsed = this.audioCtx.currentTime - this.synthStartTime;
      const duration = this.currentSong.duration || 180;

      if (elapsed >= duration) {
        this.stop();
        this.onEndedCallback?.();
        return;
      }

      this.onTimeUpdateCallback?.(elapsed, duration);

      // Play musical note patterns based on preset
      const preset = this.currentSong.synthPreset || 'synthwave';
      this.playSynthStep(preset, step);
      step++;
    }, 250); // 120 BPM 8th-notes
  }

  private stopSynthPlayback(isPause = false) {
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
    if (isPause && this.audioCtx) {
      this.synthPauseOffset = this.audioCtx.currentTime - this.synthStartTime;
    }
    this.isSynthPlaying = false;
  }

  private playSynthStep(preset: string, step: number) {
    if (!this.audioCtx || !this.eqFilters[0]) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const dest = this.eqFilters[0];

    // Different musical scales and chord patterns
    if (preset === 'synthwave') {
      // Synthwave: Minor pentatonic arpeggio + deep bass note + punchy kick on 1 and 3
      const bassNotes = [110, 110, 110, 110, 87.31, 87.31, 98, 98]; // A2, F2, G2
      const melodyNotes = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 440, 392];
      
      // Bass Synth
      if (step % 2 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const note = bassNotes[(step / 2) % bassNotes.length];
        osc.frequency.setValueAtTime(note, now);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.45);
      }

      // Arpeggio Lead
      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(melodyNotes[step % melodyNotes.length], now);
      leadGain.gain.setValueAtTime(0.12, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      leadOsc.connect(leadGain);
      leadGain.connect(dest);
      leadOsc.start(now);
      leadOsc.stop(now + 0.25);

      // Kick drum on quarter notes
      if (step % 4 === 0) {
        this.playKick(now, dest);
      }
      // Hi-hat on 8th notes
      if (step % 2 === 1) {
        this.playHiHat(now, dest);
      }
    } else if (preset === 'ambient') {
      // Liquid Ambient: Slow lush sine and triangle chords + delicate water drip harmonics
      if (step % 8 === 0) {
        const chordRoots = [261.63, 293.66, 329.63, 220.0]; // C4, D4, E4, A3
        const root = chordRoots[Math.floor(step / 8) % chordRoots.length];
        [root, root * 1.25, root * 1.5, root * 1.875].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 2.6);
        });
      }
    } else if (preset === 'cyber') {
      // Cyber Beats: Punchy 808 sub + snappy snare on beat 2 & 4
      if (step % 4 === 0) {
        this.playKick(now, dest, 140, 45, 0.4);
      }
      if (step % 4 === 2) {
        this.playSnare(now, dest);
      }
      if (step % 2 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(130.81, now); // C3
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } else {
      // Acoustic / Chill: Warm nylon-like pluck tones
      if (step % 2 === 0) {
        const chillNotes = [196, 246.94, 293.66, 392, 440];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(chillNotes[step % chillNotes.length], now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.55);
      }
    }
  }

  private playKick(time: number, dest: AudioNode, startFreq = 150, endFreq = 40, duration = 0.3) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + duration);
  }

  private playSnare(time: number, dest: AudioNode) {
    if (!this.audioCtx) return;
    // White noise buffer for snare snap
    const bufferSize = this.audioCtx.sampleRate * 0.15;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.16);
  }

  private playHiHat(time: number, dest: AudioNode) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 0.05;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.06);
  }

  public onTimeUpdate(cb: (time: number, duration: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onStateChange(cb: (state: 'idle' | 'buffering' | 'ready' | 'ended') => void) {
    this.onStateChangeCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }
}

export const audioEngine = new AudioEngine();
