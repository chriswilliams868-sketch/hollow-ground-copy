// Vanguard weapons. All keep the hold-to-charge heavy; each one shapes the Timed Parry (skill).
const longsword = {
  id: 'longsword',
  name: 'Longsword',
  trait: 'Balanced 3-hit combo',
  stats: ['damage', 'attackSpeed'],
  hands: { main: 'longsword' },
  skill: { text: 'Riposte crit window lasts 2.5s', riposte: 2.5 },
  rest: { main: { yaw: -0.6, pitch: 0, y: 1.02, z: 0.08 } },
  poses: {
    horizontal: {
      wind: { main: { yaw: 1.5, pitch: -0.12, y: 1.08, z: 0.04 } },
      strike: { main: { yaw: -1.75, pitch: 0.05, y: 1.0, z: 0.14 } },
    },
    vertical: {
      wind: { main: { yaw: -0.18, pitch: -2.3, y: 1.32, z: -0.04 } },
      strike: { main: { yaw: -0.18, pitch: 0.62, y: 0.92, z: 0.22 } },
    },
    thrust: {
      wind: { main: { yaw: -0.26, pitch: -0.06, y: 1.06, z: -0.5 } },
      strike: { main: { yaw: -0.2, pitch: 0.02, y: 1.02, z: 0.9 } },
    },
    slam: {
      wind: { main: { yaw: 0.25, pitch: -2.75, y: 1.4, z: -0.14 } },
      strike: { main: { yaw: -0.05, pitch: 0.68, y: 0.88, z: 0.26 } },
    },
  },
  // "1, 2... 3": horizontal swipe, downward slash, then a delayed finisher thrust
  combo: [
    { style: 'horizontal', sfx: 'slash', cost: 12, windup: 0.07, active: 0.11, recovery: 0.2, damage: 12, range: 2.2, arc: 2.1, lunge: 2.4, hitAt: 0, hitStop: 0.05, shake: 0.12, poise: 4 },
    { style: 'vertical', sfx: 'slash', cost: 12, windup: 0.09, active: 0.09, recovery: 0.22, damage: 13, range: 2.3, arc: 1.4, lunge: 2.6, hitAt: 0.6, hitStop: 0.06, shake: 0.16, impactShake: 0.18, poise: 5 },
    { style: 'thrust', sfx: 'thrust', cost: 16, pause: 0.2, windup: 0.08, active: 0.16, recovery: 0.36, damage: 21, range: 3.2, arc: 1.4, lunge: 6, hitAt: 0.3, hitStop: 0.13, shake: 0.32, poise: 10 },
  ],
  heavy: {
    style: 'slam', sfx: 'slash', cost: 24, holdThreshold: 0.3, maxCharge: 1.5, chargeSpeed: 0.35,
    windup: 0.1, active: 0.12, recovery: 0.45, damage: 30, range: 2.9, arc: 2.6, lunge: 2.2, hitAt: 0.7,
    hitStop: 0.15, shake: 0.5, impactShake: 0.35, poise: 34, knockback: 2.4, stagger: 0.8,
  },
};

const spear = {
  id: 'spear',
  name: 'Spear',
  trait: 'Extended forward thrust reach',
  stats: ['damage', 'crit'],
  hands: { main: 'spear' },
  skill: { text: 'Perfect parries hurl the attacker back', parryKnock: 3 },
  rest: { main: { yaw: -0.15, pitch: -0.35, y: 1.0, z: -0.15 } },
  poses: {
    jab: {
      wind: { main: { yaw: -0.08, pitch: -0.05, y: 1.08, z: -0.55 } },
      strike: { main: { yaw: -0.06, pitch: 0.02, y: 1.05, z: 0.75 } },
    },
    lunge: {
      wind: { main: { yaw: -0.1, pitch: -0.12, y: 1.12, z: -0.7 } },
      strike: { main: { yaw: -0.05, pitch: 0.04, y: 1.04, z: 1.1 } },
    },
    skewer: {
      wind: { main: { yaw: 0.1, pitch: -0.3, y: 1.2, z: -0.8 } },
      strike: { main: { yaw: -0.05, pitch: 0.05, y: 1.05, z: 1.2 } },
    },
  },
  // A double jab, a triple-jab flurry (each thrust pulls back only part-way), then a long lunging finisher
  combo: [
    { style: 'jab', fx: 'thrust', sfx: 'thrust', cost: 11, windup: 0.07, active: 0.17, recovery: 0.16, damage: 6, range: 3.6, arc: 0.8, lunge: 2, hitStop: 0.04, shake: 0.08, poise: 3, thrusts: 2 },
    { style: 'jab', fx: 'thrust', sfx: 'thrust', cost: 12, windup: 0.06, active: 0.24, recovery: 0.18, damage: 4.5, range: 3.7, arc: 0.8, lunge: 2.2, hitStop: 0.04, shake: 0.08, poise: 3, thrusts: 3 },
    { style: 'lunge', fx: 'thrust', sfx: 'thrust', cost: 16, pause: 0.18, windup: 0.1, active: 0.18, recovery: 0.36, damage: 22, range: 4.6, arc: 0.75, lunge: 7, hitAt: 0.35, hitStop: 0.12, shake: 0.3, poise: 10 },
  ],
  heavy: {
    style: 'skewer', fx: 'thrust', sfx: 'thrust', cost: 24, holdThreshold: 0.3, maxCharge: 1.4, chargeSpeed: 0.35,
    windup: 0.1, active: 0.18, recovery: 0.45, damage: 32, range: 5.4, arc: 0.8, lunge: 8, hitAt: 0.4,
    hitStop: 0.15, shake: 0.45, impactShake: 0.3, poise: 30, knockback: 2.8, stagger: 0.8,
  },
};

const claymore = {
  id: 'claymore',
  name: 'Claymore',
  trait: 'Wide arcs · wind-ups parry incoming blows',
  stats: ['damage', 'poise'],
  hands: { main: 'claymore' },
  skill: { text: 'Perfect parries unleash a sweeping shockwave', parryWave: 18 },
  rest: { main: { yaw: -0.4, pitch: -1.05, y: 1.05, z: 0 } },
  poses: {
    cleaveR: {
      wind: { main: { yaw: 2.15, pitch: -0.2, y: 1.12, z: -0.05 } },
      strike: { main: { yaw: -2.35, pitch: 0.02, y: 1.0, z: 0.16 } },
    },
    cleaveL: {
      wind: { main: { yaw: -2.3, pitch: -0.2, y: 1.12, z: -0.05 } },
      strike: { main: { yaw: 2.1, pitch: 0.02, y: 1.0, z: 0.16 } },
    },
    // Whirl: the blade swings out wide and the Vanguard spins a full turn behind it
    whirl: {
      wind: { main: { yaw: 2.2, pitch: -0.2, y: 1.12, z: -0.05 } },
      strike: { main: { yaw: 1.35, pitch: 0, y: 1.0, z: 0.1 } },
    },
    slam: {
      wind: { main: { yaw: 0.2, pitch: -2.8, y: 1.45, z: -0.15 } },
      strike: { main: { yaw: -0.05, pitch: 0.7, y: 0.86, z: 0.28 } },
    },
  },
  // Wide cleave, reverse cleave, then a 360° whirl; every wind-up parries blows that land during it
  combo: [
    { style: 'cleaveR', fx: 'sweep', sfx: 'slash', cost: 15, windup: 0.18, active: 0.15, recovery: 0.26, damage: 17, range: 3.1, arc: 3.5, lunge: 1.8, hitAt: 0.45, hitStop: 0.07, shake: 0.18, impactShake: 0.12, poise: 7, parry: true },
    { style: 'cleaveL', fx: 'sweep', sfx: 'slash', cost: 15, windup: 0.17, active: 0.15, recovery: 0.28, damage: 18, range: 3.1, arc: 3.5, lunge: 1.8, hitAt: 0.45, hitStop: 0.07, shake: 0.18, impactShake: 0.12, poise: 7, parry: true },
    { style: 'whirl', fx: 'whirl', sfx: 'slash', cost: 20, pause: 0.16, windup: 0.14, active: 0.28, recovery: 0.4, damage: 27, range: 3.2, arc: 6.3, lunge: 1.2, hitAt: 0.5, hitStop: 0.12, shake: 0.32, impactShake: 0.2, poise: 14, knockback: 2, spin: 1, parry: true },
  ],
  heavy: {
    style: 'slam', sfx: 'slash', cost: 26, holdThreshold: 0.3, maxCharge: 1.6, chargeSpeed: 0.3,
    windup: 0.12, active: 0.14, recovery: 0.5, damage: 36, range: 3.2, arc: 3, lunge: 1.8, hitAt: 0.7,
    hitStop: 0.16, shake: 0.55, impactShake: 0.4, poise: 38, knockback: 2.6, stagger: 0.9,
  },
};

export default { longsword, spear, claymore };