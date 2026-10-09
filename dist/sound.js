/** Procedural score: synthetic voices, air, beating drones. No recordings. */
export class SoundScore {
  constructor() {
    this.context = null;
    this.enabled = false;
    this.playing = false;
    this.voices = new Set();
    this.lastCue = -1;
    this.cues = [26, 35, 43, 50, 58, 65, 73, 81, 87, 93];
  }
  async enable(position, playing) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    if (!this.context) this.build(new AudioContext());
    await this.context.resume();
    this.enabled = true;
    this.lastCue = this.cues.filter(t => t <= position).length - 1;
    this.setPlaying(playing);
    return true;
  }
  build(ctx) {
    this.context = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = 0;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -20;
    limiter.knee.value = 8;
    limiter.ratio.value = 16;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.2;
    const ceiling = ctx.createGain();
    ceiling.gain.value = 0.24;
    this.output.connect(limiter).connect(ceiling).connect(ctx.destination);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const samples = this.noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < samples.length; i++) {
      last = (last + (Math.random() * 2 - 1) * 0.04) / 1.04;
      samples[i] = last * 3.5;
    }
    this.bedGain = ctx.createGain();
    this.bedGain.gain.value = 0.12;
    this.bedFilter = ctx.createBiquadFilter();
    this.bedFilter.type = 'lowpass';
    this.bedFilter.frequency.value = 400;
    const air = ctx.createBufferSource();
    air.buffer = this.noise;
    air.loop = true;
    air.connect(this.bedFilter).connect(this.bedGain).connect(this.output);
    air.start();
    this.drones = [43.65, 58.27, 88.2].map((frequency, i) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = i === 2 ? 'triangle' : 'sawtooth';
      oscillator.frequency.value = frequency;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 190;
      const gain = ctx.createGain(); gain.gain.value = 0.055;
      oscillator.connect(filter).connect(gain).connect(this.output);
      oscillator.start();
      return oscillator;
    });
  }
  setPlaying(playing) {
    this.playing = playing;
    if (!this.context) return;
    const now = this.context.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setTargetAtTime(this.enabled && playing ? 0.7 : 0, now, 0.04);
    if (!playing) this.stopVoices();
  }
  disable() { this.enabled = false; this.setPlaying(false); }
  stopVoices() {
    for (const voice of this.voices) {
      try { voice.stop(); } catch { /* Already ended. */ }
    }
    this.voices.clear();
  }
  restart() { this.lastCue = -1; this.stopVoices(); }
  update(position, pressure) {
    if (!this.enabled || !this.playing || !this.context) return;
    const now = this.context.currentTime;
    const intensity = position < 24 ? position / 24 : position < 78 ? 0.65 : 0.9;
    const ending = position > 97 ? Math.max(0, 1 - (position - 97) / 4) : 1;
    this.output.gain.setTargetAtTime(0.7 * ending, now, 0.2);
    this.bedFilter.frequency.setTargetAtTime(250 + intensity * 1100 + pressure * 1600, now, 0.12);
    this.bedGain.gain.setTargetAtTime(0.12 + intensity * 0.13, now, 0.2);
    for (let i = 0; i < this.drones.length; i++) {
      this.drones[i].detune.setTargetAtTime(Math.sin(position * 0.39 + i) * (8 + intensity * 24), now, 0.15);
    }
    const cue = this.cues.findLastIndex(t => position >= t);
    if (cue > this.lastCue) {
      this.lastCue = cue;
      // Enabling sound halfway through does not replay missed cues.
      if (position - this.cues[cue] < 0.3) this.scream(cue, position >= 78 ? 2.9 : 2.1);
    }
  }
  scream(index, duration) {
    const ctx = this.context;
    const now = ctx.currentTime;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.46, now + 0.24);
    envelope.gain.setTargetAtTime(0.28, now + duration * 0.42, 0.2);
    envelope.gain.linearRampToValueAtTime(0, now + duration);
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (panner.pan) panner.pan.setValueAtTime(index % 2 === 0 ? -0.36 : 0.36, now);
    envelope.connect(panner).connect(this.output);
    const formants = [780, 1180, 2650].map((frequency, i) => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass'; filter.Q.value = [6, 9, 13][i];
      filter.frequency.setValueAtTime(frequency, now);
      filter.frequency.linearRampToValueAtTime(frequency * 1.22, now + duration * 0.5);
      filter.frequency.linearRampToValueAtTime(frequency * 0.8, now + duration);
      const gain = ctx.createGain(); gain.gain.value = [0.6, 0.35, 0.17][i];
      filter.connect(gain).connect(envelope);
      return filter;
    });
    const sources = [];
    for (let i = 0; i < 2; i++) {
      const voice = ctx.createOscillator();
      voice.type = 'sawtooth';
      const base = 230 + (index % 3) * 45 + i * 3;
      voice.frequency.setValueAtTime(base, now);
      voice.frequency.exponentialRampToValueAtTime(base * 2.9, now + duration * 0.3);
      voice.frequency.exponentialRampToValueAtTime(base * 1.7, now + duration * 0.74);
      voice.frequency.exponentialRampToValueAtTime(base * 0.75, now + duration);
      const wobble = ctx.createOscillator();
      wobble.frequency.value = 23 + index % 5;
      const wobbleGain = ctx.createGain(); wobbleGain.gain.value = 32;
      wobble.connect(wobbleGain).connect(voice.frequency);
      formants.forEach(filter => voice.connect(filter));
      voice.start(now); wobble.start(now);
      voice.stop(now + duration); wobble.stop(now + duration);
      sources.push(voice, wobble);
    }
    const breath = ctx.createBufferSource();
    breath.buffer = this.noise;
    breath.connect(formants[1]);
    breath.start(now); breath.stop(now + duration);
    sources.push(breath);
    for (const source of sources) {
      this.voices.add(source);
      source.addEventListener('ended', () => { source.disconnect(); this.voices.delete(source); }, {once:true});
    }
    breath.addEventListener('ended', () => {
      envelope.disconnect(); panner.disconnect(); formants.forEach(filter => filter.disconnect());
    }, {once:true});
  }
}
