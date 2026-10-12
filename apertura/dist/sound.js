import { TYPE_START } from './sequence.js?v=16';
/** The original light-field score ends at 9 s; identity impressions are silent. */
export class SoundScore {
  constructor() {
    this.context = null;
    this.enabled = false;
    this.playing = false;
    this.voices = new Set();
    this.lastCue = -1;
    this.cues = [];
  }
  async enable(position, playing, stillValid = () => true) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    if (!this.context) this.build(new AudioContext());
    await this.context.resume();
    if (!stillValid()) return false;
    this.enabled = true;
    this.lastCue = this.cues.filter(cue => cue.time <= position).length - 1;
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
    this.dryNoise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
    const dry=this.dryNoise.getChannelData(0);
    let seed=681;
    for(let i=0;i<dry.length;i++){
      seed=(seed*1664525+1013904223)>>>0;
      dry[i]=seed/2147483648-1;
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
    this.droneGains=[];
    this.drones = [43.65, 58.27, 88.2].map((frequency, i) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = i === 2 ? 'triangle' : 'sawtooth';
      oscillator.frequency.value = frequency;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 190;
      const gain = ctx.createGain(); gain.gain.value = 0.055;
      this.droneGains.push(gain);
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
  update(position) {
    if (!this.enabled || !this.playing || !this.context) return;
    if(position>=TYPE_START){
      // Stop once. The single logo arrival has no added sound.
      const now=this.context.currentTime;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.setValueAtTime(0,now);
      this.disable();this.context.suspend().catch(()=>{});return;
    }
    const now = this.context.currentTime;
    const inType=position>=TYPE_START;
    const intensity = position < TYPE_START ? position / TYPE_START : 0.12;
    this.output.gain.setTargetAtTime(0.7, now, 0.2);
    this.bedFilter.frequency.setTargetAtTime(inType?120:250 + intensity * 1100, now, 0.12);
    this.bedGain.gain.setTargetAtTime(inType?0:0.12 + intensity * 0.13, now, inType?.045:.2);
    for (let i = 0; i < this.drones.length; i++) {
      this.droneGains[i].gain.setTargetAtTime(inType?0:.055,now,inType?.045:.15);
      this.drones[i].detune.setTargetAtTime(Math.sin(position * 0.39 + i) * (8 + intensity * 24), now, 0.15);
    }
    const cue = this.cues.findLastIndex(cue => position >= cue.time);
    if (cue > this.lastCue) {
      this.lastCue = cue;
      // Enabling sound halfway through does not replay missed cues.
      const event=this.cues[cue];
      if (position - event.time < 0.15) {
        this.impression(event.kind,event.duration,cue);
      }
    }
  }
  impression(kind,duration,index,when=this.context.currentTime){
    const ctx=this.context,now=when;
    const press=kind==='press';
    const envelope=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    filter.type=press?'lowpass':'bandpass';
    filter.frequency.value=press?1700:620;
    filter.Q.value=press?.55:.65;
    const panner=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();
    if(panner.pan)panner.pan.value=index%2===0?-.12:.12;
    filter.connect(envelope).connect(panner).connect(this.output);
    const sources=[],cleanup=[filter,envelope,panner];
    const noise=ctx.createBufferSource();noise.buffer=this.dryNoise;
    noise.connect(filter);sources.push(noise);
    if(press){
      envelope.gain.setValueAtTime(0,now);
      envelope.gain.linearRampToValueAtTime(1.3,now+.003);
      envelope.gain.exponentialRampToValueAtTime(.025,now+duration*.7);
      envelope.gain.linearRampToValueAtTime(0,now+duration);
      const body=ctx.createOscillator(),bodyGain=ctx.createGain();
      body.type='sine';body.frequency.setValueAtTime(118,now);
      body.frequency.exponentialRampToValueAtTime(58,now+.12);
      bodyGain.gain.setValueAtTime(.36,now);
      bodyGain.gain.exponentialRampToValueAtTime(.002,now+duration);
      body.connect(bodyGain).connect(envelope);
      sources.push(body);cleanup.push(bodyGain);
    }else{
      const curve=new Float32Array(80);
      for(let i=0;i<curve.length;i++){
        const phase=i/(curve.length-1);
        const edge=Math.min(1,phase*14,(1-phase)*10);
        curve[i]=edge*(.32+.10*Math.sin(i*2.37)+.055*Math.sin(i*.91));
      }
      envelope.gain.setValueCurveAtTime(curve,now,duration);
    }
    for(const source of sources){
      this.voices.add(source);
      source.start(now);source.stop(now+duration);
      source.addEventListener('ended',()=>{
        source.disconnect();this.voices.delete(source);
      },{once:true});
    }
    noise.addEventListener('ended',()=>cleanup.forEach(node=>node.disconnect()),{once:true});
  }
}
