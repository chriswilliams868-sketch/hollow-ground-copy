// Paladin weapons. The tower shield stays in the off-hand for Bulwark Block; each weapon adds a block effect.
const SHIELD_TUCK = { yaw: 0.8, pitch: 0, y: 0.98, z: 0.04 };
const REST_OFF = { yaw: 0.35, pitch: 0, y: 1.0, z: 0.2 };
// Shield raised while Bulwark Block is held
const BLOCK = { off: { yaw: 0.05, pitch: -0.1, y: 1.18, z: 0.42 } };
const tucked = (wind, strike) => ({ wind: { main: wind, off: SHIELD_TUCK }, strike: { main: strike, off: SHIELD_TUCK } });
const hands = (main) => ({ main, off: 'towerShield' });

const warhammer = {
  id: 'warhammer',
  name: 'War Hammer',
  trait: 'High stagger · slow',
  stats: ['damage', 'poise'],
  hands: hands('warHammer'),
  skill: { text: 'Blocked attackers are staggered', blockStagger: 1 },
  rest: { main: { yaw: -0.35, pitch: -0.75, y: 1.0, z: 0.1 }, off: REST_OFF },
  poses: {
    hammerSlam: tucked({ yaw: -0.1, pitch: -2.6, y: 1.45, z: -0.1 }, { yaw: -0.1, pitch: 0.78, y: 0.88, z: 0.32 }),
    hammerSweep: tucked({ yaw: 2.0, pitch: -0.3, y: 1.05, z: 0 }, { yaw: -2.3, pitch: -0.1, y: 1.0, z: 0.12 }),
    // Whirlwind: the hammer swings out wide and the Paladin spins a full turn behind it
    hammerWhirl: tucked({ yaw: 2.1, pitch: -0.35, y: 1.05, z: 0 }, { yaw: 1.35, pitch: -0.12, y: 1.0, z: 0.12 }),
    block: BLOCK,
  },
  // Two ground-shattering slams, a wide sweep, then a 360° whirlwind
  combo: [
    { style: 'hammerSlam', sfx: 'thud', cost: 14, windup: 0.18, active: 0.12, recovery: 0.26, damage: 18, range: 2.4, arc: 1.6, lunge: 1.4, hitAt: 0.65, hitStop: 0.08, shake: 0.22, impactShake: 0.28, poise: 12, stagger: 0.6, knockback: 1.5, shatter: true },
    { style: 'hammerSlam', sfx: 'thud', cost: 14, windup: 0.16, active: 0.12, recovery: 0.28, damage: 20, range: 2.5, arc: 1.6, lunge: 1.6, hitAt: 0.65, hitStop: 0.09, shake: 0.24, impactShake: 0.32, poise: 14, stagger: 0.6, knockback: 1.7, shatter: true },
    { style: 'hammerSweep', sfx: 'thud', cost: 16, windup: 0.2, active: 0.18, recovery: 0.34, damage: 24, range: 2.9, arc: 4.2, lunge: 1.2, hitAt: 0.4, hitStop: 0.1, shake: 0.28, impactShake: 0.2, poise: 16, stagger: 0.7, knockback: 2.2 },
    { style: 'hammerWhirl', fx: 'whirl', sfx: 'thud', cost: 18, windup: 0.22, active: 0.3, recovery: 0.44, damage: 28, range: 3, arc: 6.3, lunge: 1, hitAt: 0.5, hitStop: 0.12, shake: 0.34, impactShake: 0.26, poise: 20, stagger: 0.8, knockback: 2.6, spin: 1 },
  ],
  heavy: null,
};

const battleaxe = {
  id: 'battleaxe',
  name: 'Battle Axe',
  trait: 'Cleave · +15% damage per extra foe hit',
  stats: ['damage', 'attackSpeed'],
  hands: hands('battleAxe'),
  skill: { text: 'Blocked hits reflect 60% damage back', blockReflect: 0.6 },
  rest: { main: { yaw: -0.3, pitch: -0.6, y: 1.0, z: 0.1 }, off: REST_OFF },
  poses: {
    axeChop: tucked({ yaw: 0.6, pitch: -2.2, y: 1.4, z: -0.05 }, { yaw: -0.5, pitch: 0.7, y: 0.9, z: 0.3 }),
    axeSweep: tucked({ yaw: 1.9, pitch: -0.25, y: 1.05, z: 0 }, { yaw: -2.2, pitch: -0.05, y: 1.0, z: 0.12 }),
    // Whirlwind cleave: the axe swings out wide and the Paladin spins a full turn behind it
    axeSpin: tucked({ yaw: 2.2, pitch: -0.3, y: 1.06, z: 0 }, { yaw: 1.3, pitch: -0.08, y: 1.0, z: 0.12 }),
    block: BLOCK,
  },
  // Ground-shattering diagonal chop, wide sweep, then a 360° whirlwind cleave
  combo: [
    { style: 'axeChop', fx: 'cleave', sfx: 'thud', cost: 13, windup: 0.15, active: 0.12, recovery: 0.24, damage: 16, range: 2.6, arc: 2.4, lunge: 1.6, hitAt: 0.55, hitStop: 0.07, shake: 0.18, impactShake: 0.18, poise: 9, stagger: 0.45, cleave: 0.15, shatter: true },
    { style: 'axeSweep', fx: 'sweep', sfx: 'slash', cost: 14, windup: 0.15, active: 0.15, recovery: 0.26, damage: 17, range: 2.8, arc: 3.6, lunge: 1.4, hitAt: 0.45, hitStop: 0.08, shake: 0.2, impactShake: 0.14, poise: 9, stagger: 0.5, cleave: 0.15 },
    { style: 'axeSpin', fx: 'whirl', sfx: 'thud', cost: 18, windup: 0.18, active: 0.3, recovery: 0.4, damage: 24, range: 3, arc: 6.3, lunge: 1, hitAt: 0.5, hitStop: 0.11, shake: 0.3, impactShake: 0.22, poise: 14, stagger: 0.6, knockback: 2.2, cleave: 0.15, spin: 1 },
  ],
  heavy: null,
};

const greatsword = {
  id: 'greatsword',
  name: 'Greatsword',
  trait: 'Wide reach · heavy poise hits',
  stats: ['damage', 'poise'],
  hands: hands('greatsword'),
  skill: { text: 'Blocking costs 30% less stamina', blockCost: 0.7 },
  rest: { main: { yaw: -0.25, pitch: -1.2, y: 1.05, z: 0.05 }, off: REST_OFF },
  poses: {
    gsOverhead: tucked({ yaw: -0.1, pitch: -2.7, y: 1.5, z: -0.12 }, { yaw: -0.1, pitch: 0.72, y: 0.88, z: 0.32 }),
    gsSweep: tucked({ yaw: 2.0, pitch: -0.2, y: 1.1, z: 0 }, { yaw: -2.2, pitch: -0.05, y: 1.0, z: 0.14 }),
    block: BLOCK,
  },
  // Overhead cleave, wide sweep, then a delayed crushing overhead
  combo: [
    { style: 'gsOverhead', fx: 'greatswing', sfx: 'thud', cost: 16, windup: 0.22, active: 0.14, recovery: 0.32, damage: 22, range: 3.5, arc: 1.4, lunge: 1.6, hitAt: 0.6, hitStop: 0.1, shake: 0.26, impactShake: 0.3, poise: 22, stagger: 0.7, knockback: 1.8 },
    { style: 'gsSweep', fx: 'sweep', sfx: 'slash', cost: 17, windup: 0.22, active: 0.18, recovery: 0.36, damage: 24, range: 3.6, arc: 3.2, lunge: 1.4, hitAt: 0.45, hitStop: 0.1, shake: 0.28, impactShake: 0.2, poise: 24, stagger: 0.7, knockback: 2 },
    { style: 'gsOverhead', fx: 'greatswing', sfx: 'thud', cost: 20, pause: 0.18, windup: 0.24, active: 0.16, recovery: 0.5, damage: 32, range: 3.8, arc: 1.6, lunge: 2, hitAt: 0.6, hitStop: 0.14, shake: 0.4, impactShake: 0.38, poise: 32, stagger: 0.9, knockback: 2.6 },
  ],
  heavy: null,
};

export default { warhammer, battleaxe, greatsword };