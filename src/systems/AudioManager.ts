/**
 * Procedural Web Audio API Sound Synthesizer
 * Provides 100% royalty-free, original sound effects and peaceful countryside Vietnamese ambient melody
 * with zero external audio assets required.
 */

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmInterval: number | null = null;
  private isPlayingBgm: boolean = false;

  private constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Restore muted preference from localStorage
      const savedMute = localStorage.getItem('tq_audio_muted');
      if (savedMute === 'true') {
        this.setMuted(true);
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this environment', e);
    }
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.init();
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('tq_audio_muted', muted ? 'true' : 'false');
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.6, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Footstep sound (Soft grass rustle)
   */
  public playFootstep() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(140 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  /**
   * Tea Pluck Sound (Bright chime)
   */
  public playPluck() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  /**
   * UI Click Sound
   */
  public playClick() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Dialogue Typewriter Blip
   */
  public playDialogueBlip() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 40, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  /**
   * Quest Completion & Fragment Discovery Fanfare
   */
  public playFanfare() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.25, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } catch (e) {}
  }

  /**
   * Serene Discovery / Sunset Atmospheric Chime (Pentatonic scale)
   */
  public playDiscovery() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const notes = [440, 523.25, 659.25, 880]; // A4, C5, E5, A5
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0.2, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.8);
      });
    } catch (e) {}
  }

  /**
   * Sizzling Tea Roasting Sound (Sao chè trên chảo gang)
   */
  public playSizzle() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2500, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
    } catch (e) {}
  }

  /**
   * Starts peaceful Vietnamese Countryside Pentatonic Ambient Melody
   * Scale: C, D, F, G, A (Traditional Bắc Bộ Pentatonic scale)
   */
  public startPeacefulBGM() {
    if (this.isPlayingBgm) return;
    this.isPlayingBgm = true;

    const melodyNotes = [
      261.63, 293.66, 349.23, 392.00, 440.00, // C4, D4, F4, G4, A4
      523.25, 587.33, 698.46, 783.99, 880.00  // C5, D5, F5, G5, A5
    ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isPlayingBgm || this.isMuted || !this.ctx || !this.bgmGain) return;
      try {
        const freq = melodyNotes[noteIdx % melodyNotes.length];
        noteIdx = (noteIdx + Math.floor(Math.random() * 3 + 1)) % melodyNotes.length;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Bamboo flute timbre (sine with gentle harmonic)
        osc.type = 'sine';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.3); // Soft attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2); // Long tail

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 2.3);
      } catch (e) {}
    };

    // Play initial note then interval
    playNextNote();
    this.bgmInterval = window.setInterval(playNextNote, 2400);
  }

  public stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}
