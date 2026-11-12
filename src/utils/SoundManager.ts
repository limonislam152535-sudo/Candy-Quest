import { StorageManager } from './StorageManager.js';

export class SoundManager {
  private static ctx: AudioContext | null = null;
  private static sfxEnabled = true;
  private static musicEnabled = true;
  private static bgmInterval: any = null;
  private static bgmGain: GainNode | null = null;

  static init(): void {
    const data = StorageManager.load();
    this.sfxEnabled = data.soundEnabled;
    this.musicEnabled = data.musicEnabled;
  }

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  static setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    StorageManager.save({ soundEnabled: enabled });
  }

  static setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    StorageManager.save({ musicEnabled: enabled });
    if (!enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  static isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  static isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  /**
   * UI Click Tap
   */
  static playClick(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  /**
   * Candy Swap swoosh
   */
  static playSwap(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // ignore
    }
  }

  /**
   * Candy Match Pop (scaled by combo)
   */
  static playMatch(combo = 1): void {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const baseFreq = 400 + Math.min(8, combo) * 60;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // ignore
    }
  }

  /**
   * Special Candy Creation or Activation (Chime)
   */
  static playSpecial(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Hammer booster bonk
   */
  static playHammer(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  }

  /**
   * Level Complete Fanfare
   */
  static playWin(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const fanfare = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.5, d: 0.35 }  // C6
      ];
      let t = ctx.currentTime;
      fanfare.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + note.d);
        t += note.d * 0.85;
      });
    } catch {
      // ignore
    }
  }

  /**
   * Level Failed
   */
  static playFail(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [440, 392, 349.23, 293.66];
      let t = ctx.currentTime;
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t + idx * 0.12);

        gain.gain.setValueAtTime(0.12, t + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.18);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Soft ambient Background Music loop synthesized with calming sweet arpeggios
   */
  static startMusic(): void {
    if (!this.musicEnabled || this.bgmInterval) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Pleasant pentatonic arpeggio chords in F major / C major
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C major
      [220.00, 261.63, 329.63, 440.00], // A minor
      [174.61, 220.00, 261.63, 349.23], // F major
      [196.00, 246.94, 293.66, 392.00]  // G major
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.04, ctx.currentTime);
    this.bgmGain.connect(ctx.destination);

    const playNextNote = () => {
      if (!this.musicEnabled || !this.bgmGain) return;
      const currentCtx = this.getContext();
      if (!currentCtx) return;

      const currentChord = chords[chordIdx];
      const freq = currentChord[noteIdx];

      try {
        const osc = currentCtx.createOscillator();
        const noteGain = currentCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, currentCtx.currentTime);

        noteGain.gain.setValueAtTime(0.04, currentCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, currentCtx.currentTime + 0.45);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start();
        osc.stop(currentCtx.currentTime + 0.45);
      } catch {
        // ignore
      }

      noteIdx++;
      if (noteIdx >= currentChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    };

    this.bgmInterval = setInterval(playNextNote, 480);
  }

  static stopMusic(): void {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch {
        // ignore
      }
      this.bgmGain = null;
    }
  }
}
