// Procedural Web Audio API sound generator for Pomodoro Ambient Focus
// Completely self-contained with no external network requests or assets

class FocusAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private activeSourceNodes: (AudioNode | number)[] = [];
  private currentType: string | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private stopTimeout: NodeJS.Timeout | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume * 0.35, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private cleanupActiveNodes() {
    this.activeSourceNodes.forEach((node) => {
      if (typeof node === 'number') {
        clearInterval(node);
      } else {
        try {
          (node as AudioScheduledSourceNode).stop?.();
          node.disconnect();
        } catch {}
      }
    });
    this.activeSourceNodes = [];
    this.ambientGain = null;
    this.currentType = null;
  }

  public stopAmbient() {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    this.stopTimeout = setTimeout(() => {
      this.cleanupActiveNodes();
      this.stopTimeout = null;
    }, 150);
  }

  public startAmbient(type: 'rain' | 'binaural' | 'waves' | 'brownNoise' | 'zen') {
    this.initContext();
    if (!this.ctx) return;

    if (this.currentType === type) return;

    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
      this.cleanupActiveNodes();
    } else {
      this.stopAmbient();
    }
    this.currentType = type;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume * 0.35, this.ctx.currentTime, 0.2);
    gain.connect(this.ctx.destination);
    this.ambientGain = gain;

    if (type === 'rain') {
      // Pink/Brown noise with lowpass filter for gentle rain sound
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1100;

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      this.activeSourceNodes.push(noise);
    } else if (type === 'binaural') {
      // 432Hz base with 40Hz gamma binaural wave
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 216; // Harmonic carrier
      osc2.frequency.value = 226; // 10Hz Alpha beat

      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.4;
      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(gain);
      osc1.start();
      osc2.start();
      this.activeSourceNodes.push(osc1, osc2);
    } else if (type === 'brownNoise') {
      // Deep warm brown noise
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;
      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      this.activeSourceNodes.push(noise);
    } else if (type === 'waves') {
      // Ocean wave swell simulation using filtered noise with periodic LFO
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 1.0;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.12; // 8-second wave swell
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 250;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      lfo.start();
      this.activeSourceNodes.push(noise, lfo);
    } else if (type === 'zen') {
      // Ambient warm drone with gentle 528Hz harmonic
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 132; // Sub-harmonic of 528
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;
      osc.connect(filter);
      filter.connect(gain);
      osc.start();
      this.activeSourceNodes.push(osc);
    }
  }

  // Pure bell chime when timer completes
  public playSessionEndChime() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [528, 792, 1056]; // Solfeggio 528Hz harmonious bell chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const now = this.ctx!.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 3.5);
    });
  }
}

export const focusAudio = new FocusAudioEngine();
