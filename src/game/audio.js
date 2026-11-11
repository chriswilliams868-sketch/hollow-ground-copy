let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let noiseBuffer = null;

const VOLUME_KEY = 'hollow-ground-settings';

function readVolumes() {
  try {
    return JSON.parse(localStorage.getItem(VOLUME_KEY) || '{}');
  } catch {
    return {};
  }
}

const volumes = { master: 0.8, music: 0.7, sfx: 0.9, ...readVolumes() };

function applyVolumes() {
  if (!ctx) return;
  master.gain.value = 0.6 * volumes.master;
  sfxBus.gain.value = volumes.sfx;
  musicBus.gain.value = volumes.music;
}

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.connect(master);
    musicBus = ctx.createGain();
    musicBus.connect(master);
    applyVolumes();
  }
  return ctx;
}

export function getVolumes() {
  return { ...volumes };
}

export function setVolume(kind, value) {
  volumes[kind] = value;
  applyVolumes();
  try {
    localStorage.setItem(VOLUME_KEY, JSON.stringify(volumes));
  } catch {
    // storage unavailable: the volume still applies for this session
  }
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}

// Shared context + master bus for the procedural music engine.
export function getAudio() {
  const c = getCtx();
  return c ? { ctx: c, master: musicBus } : null;
}

function tone({ type = 'sine', freq, to, dur = 0.2, vol = 0.3, delay = 0 }) {
  const c = getCtx();
  if (!c || c.state !== 'running') return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(sfxBus);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise({ dur = 0.2, vol = 0.3, filter = 'bandpass', freq = 1000, to, q = 1 }) {
  const c = getCtx();
  if (!c || c.state !== 'running') return;
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  const f = c.createBiquadFilter();
  f.type = filter;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(gain).connect(sfxBus);
  src.start(t);
  src.stop(t + dur);
}

export const sfx = {
  slash: () => noise({ dur: 0.14, vol: 0.35, freq: 2600, to: 700, q: 2 }),
  hit: () => {
    tone({ freq: 150, to: 50, dur: 0.18, vol: 0.5 });
    noise({ dur: 0.08, vol: 0.3, filter: 'lowpass', freq: 1500 });
  },
  whoosh: () => noise({ dur: 0.3, vol: 0.3, freq: 400, to: 2400, q: 0.8 }),
  parry: () => {
    [1320, 1980, 2640].forEach((f, i) => tone({ type: 'triangle', freq: f, dur: 0.7 - i * 0.15, vol: 0.16 }));
    noise({ dur: 0.05, vol: 0.3, filter: 'highpass', freq: 4000 });
  },
  stomp: () => {
    tone({ freq: 95, to: 32, dur: 0.4, vol: 0.6 });
    noise({ dur: 0.22, vol: 0.25, filter: 'lowpass', freq: 380 });
  },
  click: () => tone({ type: 'square', freq: 880, to: 1320, dur: 0.06, vol: 0.07 }),
  pickup: () => tone({ freq: 900, to: 1700, dur: 0.1, vol: 0.07 }),
  lock: () => {
    tone({ type: 'square', freq: 740, to: 1100, dur: 0.06, vol: 0.05 });
    tone({ type: 'square', freq: 1100, to: 1480, dur: 0.07, vol: 0.05, delay: 0.07 });
  },
  unlock: () => tone({ type: 'square', freq: 820, to: 410, dur: 0.1, vol: 0.045 }),
  // Class skills
  block: () => {
    tone({ type: 'triangle', freq: 620, to: 380, dur: 0.18, vol: 0.18 });
    noise({ dur: 0.08, vol: 0.3, filter: 'highpass', freq: 2600 });
  },
  guardBreak: () => {
    tone({ type: 'sawtooth', freq: 300, to: 90, dur: 0.35, vol: 0.14 });
    noise({ dur: 0.2, vol: 0.3, filter: 'lowpass', freq: 900 });
  },
  smoke: () => noise({ dur: 0.5, vol: 0.32, filter: 'lowpass', freq: 900, to: 200, q: 0.6 }),
  explosion: () => {
    tone({ freq: 80, to: 26, dur: 0.7, vol: 0.7 });
    noise({ dur: 0.8, vol: 0.55, filter: 'lowpass', freq: 1800, to: 150, q: 0.6 });
  },
  // Progression & loot
  levelUp: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ type: 'triangle', freq: f, dur: 0.4, vol: 0.14, delay: i * 0.07 })),
  loot: () => {
    tone({ type: 'triangle', freq: 660, to: 990, dur: 0.12, vol: 0.12 });
    tone({ type: 'triangle', freq: 990, to: 1480, dur: 0.18, vol: 0.1, delay: 0.09 });
  },
  potion: () => {
    noise({ dur: 0.25, vol: 0.18, freq: 700, to: 1800, q: 4 });
    tone({ freq: 440, to: 880, dur: 0.3, vol: 0.1 });
  },
  equip: () => {
    noise({ dur: 0.06, vol: 0.25, filter: 'highpass', freq: 3000 });
    tone({ type: 'square', freq: 520, to: 780, dur: 0.08, vol: 0.06 });
  },
  coin: () => {
    tone({ type: 'triangle', freq: 1568, to: 2093, dur: 0.07, vol: 0.05 });
    tone({ type: 'triangle', freq: 2637, dur: 0.1, vol: 0.035, delay: 0.05 });
  },
  anvil: () => {
    tone({ type: 'triangle', freq: 1240, to: 1180, dur: 0.45, vol: 0.05 });
    tone({ freq: 2480, dur: 0.25, vol: 0.025 });
    noise({ dur: 0.05, vol: 0.1, filter: 'highpass', freq: 3000 });
  },
  gem: () => [784, 988, 1175, 1568].forEach((f, i) => tone({ freq: f, dur: 0.9, vol: 0.12, delay: i * 0.1 })),
  gateOpen: () => {
    tone({ freq: 60, to: 30, dur: 1.6, vol: 0.5 });
    noise({ dur: 0.95, vol: 0.25, filter: 'lowpass', freq: 300, to: 120 });
  },
  // Class weapons
  thud: () => {
    tone({ freq: 85, to: 38, dur: 0.32, vol: 0.65 });
    tone({ type: 'triangle', freq: 210, to: 140, dur: 0.12, vol: 0.12 });
    noise({ dur: 0.2, vol: 0.32, filter: 'lowpass', freq: 520 });
  },
  dagger: () => noise({ dur: 0.07, vol: 0.28, freq: 5200, to: 1800, q: 3.5 }),
  thrust: () => {
    noise({ dur: 0.16, vol: 0.32, freq: 900, to: 3600, q: 1.6 });
    tone({ type: 'triangle', freq: 1250, to: 900, dur: 0.22, vol: 0.06 });
  },
  gunshot: () => {
    noise({ dur: 0.45, vol: 0.7, filter: 'lowpass', freq: 2400, to: 260, q: 0.7 });
    tone({ freq: 140, to: 38, dur: 0.3, vol: 0.55 });
    noise({ dur: 0.04, vol: 0.4, filter: 'highpass', freq: 3500 });
  },
  pistol: () => {
    noise({ dur: 0.14, vol: 0.45, filter: 'lowpass', freq: 3200, to: 600, q: 0.8 });
    tone({ freq: 220, to: 70, dur: 0.12, vol: 0.3 });
  },
  snipe: () => {
    noise({ dur: 0.7, vol: 0.75, filter: 'lowpass', freq: 3000, to: 180, q: 0.7 });
    tone({ freq: 110, to: 30, dur: 0.5, vol: 0.6 });
    tone({ type: 'triangle', freq: 1800, to: 600, dur: 0.25, vol: 0.06 });
  },
  reloadClick: () => {
    tone({ type: 'square', freq: 2400, to: 1800, dur: 0.025, vol: 0.06 });
    tone({ type: 'square', freq: 1600, to: 1200, dur: 0.03, vol: 0.06, delay: 0.12 });
  },
  reloadDone: () => {
    noise({ dur: 0.05, vol: 0.25, filter: 'highpass', freq: 2500 });
    tone({ type: 'square', freq: 900, to: 600, dur: 0.04, vol: 0.07, delay: 0.08 });
    tone({ type: 'square', freq: 1800, to: 1400, dur: 0.03, vol: 0.06, delay: 0.16 });
  },
  // Rising hum while charging; returns a stop function for early release.
  charge: () => {
    const c = getCtx();
    if (!c || c.state !== 'running') return () => {};
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 1.5);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.1, t + 1.5);
    osc.connect(gain).connect(sfxBus);
    osc.start(t);
    osc.stop(t + 1.6);
    return () => {
      const now = c.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    };
  },
  victory: () =>
    [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', freq: f, dur: 0.5, vol: 0.2, delay: i * 0.14 })),
  defeat: () =>
    [392, 330, 262, 196].forEach((f, i) => tone({ type: 'sawtooth', freq: f, dur: 0.5, vol: 0.08, delay: i * 0.18 })),
};