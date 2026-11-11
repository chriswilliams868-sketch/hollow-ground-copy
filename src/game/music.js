import { getAudio } from './audio';

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// D minor pedal drone under a i - VI - iv - V progression (Dm, Bb, Gm, A).
const DRONE = [38, 45, 50, 53];
const CHORDS = [
  { bass: 38, tones: [62, 65, 69] },
  { bass: 34, tones: [58, 62, 65] },
  { bass: 31, tones: [55, 58, 62] },
  { bass: 33, tones: [57, 61, 64] },
];
const ARP = [0, 1, 2, 3, 2, 1, 2, 1];

const MODES = {
  explore: { tempo: 64, drone: 0.11, pulse: 0, arp: 0, heart: 0, drive: 0, detune: 0, cutoff: 420 },
  combat: { tempo: 112, drone: 0.1, pulse: 0.55, arp: 0.22, heart: 0, drive: 0, detune: 0, cutoff: 680 },
  boss2: { tempo: 140, drone: 0.13, pulse: 0.42, arp: 0.24, heart: 0.8, drive: 0.7, detune: -300, cutoff: 900 },
};

function driveCurve(amount) {
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// Procedural gothic score: a brooding drone, with a sub-bass pulse and minor arpeggio layered in for
// combat, and a pitch drop, distortion and racing heartbeat for the boss's second phase.
export class Music {
  constructor() {
    this.ready = false;
    this.mode = 'explore';
    this.tempo = MODES.explore.tempo;
  }

  start() {
    if (this.ready) return;
    const audio = getAudio();
    if (!audio) return;
    const ctx = audio.ctx;
    const now = ctx.currentTime;
    this.ctx = ctx;
    this.ready = true;
    this.changedAt = now;

    this.out = this.gain(0.0001, audio.master);
    this.out.gain.setTargetAtTime(0.9, now, 1.5);
    this.dry = this.gain(1, this.out);
    this.wet = this.gain(0, this.out);
    const shaper = ctx.createWaveShaper();
    shaper.curve = driveCurve(60);
    shaper.oversample = '4x';
    shaper.connect(this.wet);
    this.mix = this.gain(1, this.dry);
    this.mix.connect(shaper);

    // Drone: detuned minor-chord oscillators through a slowly breathing low-pass
    this.droneGain = this.gain(MODES.explore.drone, this.mix);
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = MODES.explore.cutoff;
    this.filter.Q.value = 5;
    this.filter.connect(this.droneGain);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    lfo.connect(this.gain(180, this.filter.frequency));
    lfo.start(now);
    this.voices = [lfo];
    this.pitched = [];
    DRONE.forEach((note, i) => {
      [-7, 7].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.value = hz(note);
        osc.detune.value = cents;
        osc.connect(this.gain(i === 0 ? 0.5 : 0.22, this.filter));
        osc.start(now);
        this.voices.push(osc);
        this.pitched.push({ osc, cents });
      });
    });

    // Rhythmic layers (silent until combat); the arpeggio gets a dark echo
    this.pulseGain = this.gain(0, this.mix);
    this.heartGain = this.gain(0, this.mix);
    this.arpGain = this.gain(0, this.mix);
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.36;
    this.arpGain.connect(delay);
    delay.connect(this.gain(0.32, delay));
    delay.connect(this.gain(0.35, this.mix));
    this.arpFilter = ctx.createBiquadFilter();
    this.arpFilter.type = 'lowpass';
    this.arpFilter.frequency.value = 1500;
    this.arpFilter.connect(this.arpGain);

    this.step = 0;
    this.nextTime = now + 0.1;
    this.timer = setInterval(() => this.tick(), 25);
  }

  gain(value, destination) {
    const node = this.ctx.createGain();
    node.gain.value = value;
    node.connect(destination);
    return node;
  }

  setMode(mode) {
    if (!this.ready || mode === this.mode) return;
    this.mode = mode;
    const m = MODES[mode];
    const now = this.ctx.currentTime;
    this.changedAt = now;
    this.droneGain.gain.setTargetAtTime(m.drone, now, 1.2);
    this.pulseGain.gain.setTargetAtTime(m.pulse, now, 0.6);
    this.arpGain.gain.setTargetAtTime(m.arp, now, 0.8);
    this.heartGain.gain.setTargetAtTime(m.heart, now, 0.5);
    this.wet.gain.setTargetAtTime(m.drive, now, 0.6);
    this.dry.gain.setTargetAtTime(1 - m.drive * 0.5, now, 0.6);
    this.filter.frequency.setTargetAtTime(m.cutoff, now, 1.5);
    this.pitched.forEach(({ osc, cents }) => osc.detune.setTargetAtTime(cents + m.detune, now, 1.4));
  }

  // Look-ahead scheduler: queue 16th-note steps slightly ahead of the audio clock.
  tick() {
    const ctx = this.ctx;
    this.tempo += (MODES[this.mode].tempo - this.tempo) * 0.03;
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.15) {
      this.schedule(this.step, this.nextTime);
      this.nextTime += 60 / this.tempo / 4;
      this.step = (this.step + 1) % 64;
    }
  }

  schedule(step, time) {
    const m = MODES[this.mode];
    const fading = time - this.changedAt < 3;
    const chord = CHORDS[Math.floor(step / 16)];
    const shift = 2 ** (m.detune / 1200);
    if (m.pulse > 0 || fading) {
      if (step % 4 === 0) this.kick(this.pulseGain, hz(chord.bass) * shift, time, 0.5);
      if (step % 8 === 6) this.kick(this.pulseGain, hz(chord.bass) * shift, time, 0.25);
    }
    if ((m.arp > 0 || fading) && step % 2 === 0) {
      const tones = [...chord.tones, chord.tones[0] + 12];
      this.pluck(hz(tones[ARP[(step / 2) % 8]]) * shift, time);
    }
    if ((m.heart > 0 || fading) && step % 4 === 0) {
      this.kick(this.heartGain, 52, time, 0.9);
      this.kick(this.heartGain, 46, time + 0.16, 0.6);
    }
  }

  kick(destination, frequency, time, volume) {
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.frequency.setValueAtTime(frequency * 2.2, time);
    osc.frequency.exponentialRampToValueAtTime(frequency, time + 0.06);
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(volume, time + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.36);
    osc.connect(env).connect(destination);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  pluck(frequency, time) {
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = frequency;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(0.3, time + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);
    osc.connect(env).connect(this.arpFilter);
    osc.start(time);
    osc.stop(time + 0.26);
  }

  stop() {
    if (!this.ready) return;
    this.ready = false;
    clearInterval(this.timer);
    const now = this.ctx.currentTime;
    this.out.gain.setTargetAtTime(0.0001, now, 0.15);
    this.voices.forEach((voice) => voice.stop(now + 0.8));
  }
}