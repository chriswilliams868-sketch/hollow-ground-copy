import { approach } from './math';
import { flipPose, spinPose } from './airborne';

// Every attack style moves as one of three keyframed arcs.
const SLAM = new Set(['vertical', 'slam', 'hammerSlam', 'axeChop', 'gsOverhead', 'leapSlam']);
const THRUST = new Set(['thrust', 'jab', 'lunge', 'skewer', 'throwR', 'throwL', 'throwX']);
export const motionOf = (style) => (SLAM.has(style) ? 'slam' : THRUST.has(style) ? 'thrust' : 'sweep');

// Sweeps whip out and settle, slams accelerate into the ground, thrusts drive straight through.
export const EASE = { sweep: (p) => 1 - (1 - p) ** 3, slam: (p) => p ** 2.2, thrust: (p) => 1 - (1 - p) ** 2 };

// Multi-thrust: n jabs in one motion, each pulling back only part-way before the next drives out; ends at full reach.
export function flurry(p, n) {
  const s = Math.sin(Math.PI * (n - 0.5) * p) ** 2;
  return p <= 1 / (2 * n - 1) ? s : 1 - (1 - s) * 0.65;
}

// When each blow connects: every thrust of a flurry just before full reach, a slam once the weapon meets the ground.
export function hitTimes(config) {
  const n = config.thrusts;
  if (n) return Array.from({ length: n }, (_, k) => (k + 0.5) / (n - 0.5) - 0.04);
  return [motionOf(config.style) === 'slam' ? Math.max(config.hitAt, 0.85) : config.hitAt];
}

// Leaps somersault through the active frames; whirlwinds spin the whole body a full turn behind the weapon.
export function airPose(config, p) {
  if (config.leap) return flipPose(p, config.leap.turns, config.leap.height);
  return config.spin ? spinPose(p, config.spin) : null;
}

const twistOf = (pivot) => Math.max(-0.75, Math.min(0.75, pivot.rotation.y * 0.32));
const leadHand = (parts, set) => (set.main || !parts.offTip ? parts.weapon : parts.offhand);

// Wind-up: hips coil with the weapon, lean back under an overhead, or turn the shoulder for a thrust.
export function coilBody(player, set, motion, dt) {
  const parts = player.parts;
  const twist = motion === 'sweep' ? twistOf(leadHand(parts, set)) : motion === 'thrust' ? 0.3 : 0;
  const lean = motion === 'slam' ? -0.16 : motion === 'thrust' ? -0.05 : 0;
  parts.body.rotation.y = approach(parts.body.rotation.y, twist, 20, dt);
  parts.body.rotation.x = approach(parts.body.rotation.x, parts.bodyPitch + lean, 16, dt);
}

// Active frames: bow the weapon path outward (multi-axis arc) and drive the torso through the strike.
export function driveSwing(player, set, motion, p, eased) {
  const parts = player.parts;
  const arc = Math.sin(Math.PI * p);
  [[parts.weapon, set.main], [parts.offhand, parts.offTip && set.off]].forEach(([pivot, pose]) => {
    if (!pivot || !pose) return;
    if (motion === 'sweep') {
      pivot.position.z += arc * 0.32;
      pivot.position.y += arc * 0.07;
      pivot.rotation.x -= arc * 0.22;
    }
    if (motion === 'slam') pivot.position.z += arc * 0.28;
  });
  if (motion === 'sweep') parts.body.rotation.y = twistOf(leadHand(parts, set));
  if (motion === 'slam') parts.body.rotation.x = parts.bodyPitch - 0.16 + eased * 0.46;
  if (motion === 'thrust') {
    parts.body.rotation.y = 0.3 - eased * 0.55;
    parts.body.rotation.x = parts.bodyPitch + eased * 0.2;
  }
}

// Ease the torso back to its natural stance (recovery, idle, gun recoil).
export function settleBody(parts, dt, rate = 10) {
  parts.body.rotation.y = approach(parts.body.rotation.y, 0, rate, dt);
  parts.body.rotation.x = approach(parts.body.rotation.x, parts.bodyPitch, rate, dt);
}