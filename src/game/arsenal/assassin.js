// Assassin weapons. Each one changes how the Poison Smoke Bomb (skill) plays out.
const REST = {
  main: { yaw: -0.35, pitch: 0.3, y: 0.98, z: 0.12 },
  off: { yaw: 0.35, pitch: 0.3, y: 0.98, z: 0.12 },
};
const KNIVES = { speed: 30, range: 9 };

const daggers = {
  id: 'daggers',
  name: 'Twin Daggers',
  trait: 'Rapid X-cuts · leaping slam finisher',
  stats: ['damage', 'crit'],
  hands: { main: 'dagger', off: 'dagger' },
  skill: { text: 'Smoke Bomb recharges in 5s', cooldown: 5 },
  rest: REST,
  // Idle: one dagger at a time is flipped up off the fist and caught
  flourish: { hands: 'alternate', turns: 1, duration: 0.5, toss: 0.3, every: 2.4 },
  poses: {
    daggerR: {
      wind: { main: { yaw: 1.3, pitch: -0.9, y: 1.28, z: 0 } },
      strike: { main: { yaw: -1.2, pitch: 0.5, y: 0.9, z: 0.22 } },
    },
    daggerL: {
      wind: { off: { yaw: -1.3, pitch: -0.9, y: 1.28, z: 0 } },
      strike: { off: { yaw: 1.2, pitch: 0.5, y: 0.9, z: 0.22 } },
    },
    // Inward X-cut: both blades fall from high and wide to cross low in front
    daggerX: {
      wind: { main: { yaw: 1.1, pitch: -1.1, y: 1.32, z: -0.05 }, off: { yaw: -1.1, pitch: -1.1, y: 1.32, z: -0.05 } },
      strike: { main: { yaw: -1.0, pitch: 0.6, y: 0.9, z: 0.26 }, off: { yaw: 1.0, pitch: 0.6, y: 0.9, z: 0.26 } },
    },
    // Outward X-cut: from crossed low, both blades rip up and out
    daggerXOut: {
      wind: { main: { yaw: -1.0, pitch: 0.65, y: 0.9, z: 0.24 }, off: { yaw: 1.0, pitch: 0.65, y: 0.9, z: 0.24 } },
      strike: { main: { yaw: 1.2, pitch: -0.9, y: 1.28, z: 0.06 }, off: { yaw: -1.2, pitch: -0.9, y: 1.28, z: 0.06 } },
    },
    // Leaping slam: blades held overhead through the somersault, driven down into the ground on landing
    leapSlam: {
      wind: { main: { yaw: 0.35, pitch: -2.3, y: 1.38, z: -0.1 }, off: { yaw: -0.35, pitch: -2.3, y: 1.38, z: -0.1 } },
      strike: { main: { yaw: -0.25, pitch: 1.3, y: 0.95, z: 0.32 }, off: { yaw: 0.25, pitch: 1.3, y: 0.95, z: 0.32 } },
    },
  },
  // Right, left, an inward then an outward X-cut, then a leaping 360° somersault slam with both blades
  combo: [
    { style: 'daggerR', sfx: 'dagger', cost: 7, windup: 0.05, active: 0.07, recovery: 0.12, damage: 8, range: 1.9, arc: 1.9, lunge: 3, hitAt: 0.3, hitStop: 0.035, shake: 0.07, poise: 2 },
    { style: 'daggerL', sfx: 'dagger', cost: 7, windup: 0.05, active: 0.07, recovery: 0.12, damage: 8, range: 1.9, arc: 1.9, lunge: 3, hitAt: 0.3, hitStop: 0.035, shake: 0.07, poise: 2 },
    { style: 'daggerX', sfx: 'dagger', cost: 8, windup: 0.07, active: 0.08, recovery: 0.1, damage: 9, range: 2, arc: 2.1, lunge: 3.4, hitAt: 0.4, hitStop: 0.05, shake: 0.1, poise: 3 },
    { style: 'daggerXOut', sfx: 'dagger', cost: 8, windup: 0.05, active: 0.08, recovery: 0.14, damage: 10, range: 2, arc: 2.1, lunge: 2.6, hitAt: 0.4, hitStop: 0.05, shake: 0.12, poise: 3 },
    { style: 'leapSlam', sfx: 'thud', cost: 12, windup: 0.1, active: 0.36, recovery: 0.3, damage: 18, range: 2.6, arc: 6.3, lunge: 4.5, hitAt: 0.95, hitStop: 0.1, shake: 0.3, impactShake: 0.3, poise: 8, stagger: 0.5, knockback: 1.8, leap: { height: 1.3, turns: 1 } },
  ],
  heavy: null,
};

const katana = {
  id: 'katana',
  name: 'Katana',
  trait: 'Fast sweeps that make enemies bleed',
  stats: ['damage', 'attackSpeed'],
  hands: { main: 'katana' },
  skill: { text: 'The smoke cloud also makes enemies bleed', cloudBleed: true },
  rest: { main: { yaw: -0.9, pitch: 0.35, y: 0.98, z: 0.1 }, off: REST.off },
  poses: {
    kataR: {
      wind: { main: { yaw: 1.5, pitch: -0.25, y: 1.12, z: 0 } },
      strike: { main: { yaw: -1.7, pitch: 0.1, y: 0.98, z: 0.16 } },
    },
    kataL: {
      wind: { main: { yaw: -1.6, pitch: -0.3, y: 1.12, z: 0 } },
      strike: { main: { yaw: 1.5, pitch: 0.12, y: 0.98, z: 0.16 } },
    },
    iai: {
      wind: { main: { yaw: -1.2, pitch: 0.35, y: 0.95, z: -0.2 } },
      strike: { main: { yaw: 1.7, pitch: -0.05, y: 1.05, z: 0.3 } },
    },
  },
  // Two bleeding sweeps, then a delayed draw-cut
  combo: [
    { style: 'kataR', fx: 'katana', sfx: 'slash', cost: 8, windup: 0.05, active: 0.08, recovery: 0.13, damage: 9, range: 2.4, arc: 2.6, lunge: 3, hitAt: 0.35, hitStop: 0.04, shake: 0.08, poise: 3, bleed: 0.3 },
    { style: 'kataL', fx: 'katana', sfx: 'slash', cost: 8, windup: 0.05, active: 0.08, recovery: 0.13, damage: 9, range: 2.4, arc: 2.6, lunge: 3, hitAt: 0.35, hitStop: 0.04, shake: 0.08, poise: 3, bleed: 0.3 },
    { style: 'iai', fx: 'katana', sfx: 'slash', cost: 12, pause: 0.12, windup: 0.06, active: 0.1, recovery: 0.26, damage: 16, range: 2.8, arc: 2.4, lunge: 6, hitAt: 0.4, hitStop: 0.09, shake: 0.2, poise: 6, bleed: 0.45 },
  ],
  heavy: null,
};

const throwingKnives = {
  id: 'throwingKnives',
  name: 'Throwing Knives',
  trait: 'Medium-range rapid strikes',
  stats: ['damage', 'crit'],
  hands: { main: 'throwingKnife', off: 'throwingKnife' },
  skill: { text: 'Leaping back throws a fan of 5 knives', knifeFan: 5 },
  rest: { main: { yaw: -0.3, pitch: 0.4, y: 1.0, z: 0.1 }, off: { yaw: 0.3, pitch: 0.4, y: 1.0, z: 0.1 } },
  flourish: { hands: 'alternate', turns: 2, duration: 0.55, toss: 0.38, every: 2.4 },
  poses: {
    throwR: {
      wind: { main: { yaw: 0.6, pitch: -1.6, y: 1.35, z: -0.25 } },
      strike: { main: { yaw: -0.1, pitch: 0.2, y: 1.1, z: 0.4 } },
    },
    throwL: {
      wind: { off: { yaw: -0.6, pitch: -1.6, y: 1.35, z: -0.25 } },
      strike: { off: { yaw: 0.1, pitch: 0.2, y: 1.1, z: 0.4 } },
    },
    throwX: {
      wind: { main: { yaw: 0.6, pitch: -1.6, y: 1.35, z: -0.25 }, off: { yaw: -0.6, pitch: -1.6, y: 1.35, z: -0.25 } },
      strike: { main: { yaw: -0.15, pitch: 0.2, y: 1.1, z: 0.4 }, off: { yaw: 0.15, pitch: 0.2, y: 1.1, z: 0.4 } },
    },
  },
  // Right, left, right throws, then a three-knife fan with both hands
  combo: [
    { style: 'throwR', fx: 'toss', sfx: 'dagger', cost: 6, windup: 0.05, active: 0.06, recovery: 0.12, damage: 8, lunge: 0.4, hitAt: 0.3, hitStop: 0.03, shake: 0.05, poise: 2, projectile: { ...KNIVES, count: 1, spread: 0 } },
    { style: 'throwL', fx: 'toss', sfx: 'dagger', cost: 6, windup: 0.05, active: 0.06, recovery: 0.12, damage: 8, lunge: 0.4, hitAt: 0.3, hitStop: 0.03, shake: 0.05, poise: 2, projectile: { ...KNIVES, count: 1, spread: 0 } },
    { style: 'throwR', fx: 'toss', sfx: 'dagger', cost: 6, windup: 0.05, active: 0.06, recovery: 0.12, damage: 9, lunge: 0.4, hitAt: 0.3, hitStop: 0.03, shake: 0.05, poise: 2, projectile: { ...KNIVES, count: 1, spread: 0 } },
    { style: 'throwX', fx: 'toss', sfx: 'dagger', cost: 9, windup: 0.08, active: 0.08, recovery: 0.24, damage: 9, lunge: 0.4, hitAt: 0.35, hitStop: 0.05, shake: 0.08, poise: 3, projectile: { ...KNIVES, count: 3, spread: 0.2 } },
  ],
  heavy: null,
};

export default { daggers, katana, throwingKnives };