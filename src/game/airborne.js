import { smoothstep } from './math';

const TAU = Math.PI * 2;
const WAIST = 0.9; // flips turn the hero over about the waist, not the feet

// Leaping somersault at progress p (`turns` > 0 forward, < 0 a backflip): lifts off, turns over and lands, legs tucked.
export function flipPose(p, turns, height) {
  const arc = Math.sin(Math.PI * p);
  return { pitch: TAU * turns * smoothstep(0, 1, p), lift: height * arc, tuck: arc };
}

// Whirlwind: a full-body spin that whips round fast and slows into the end of the turn.
export const spinPose = (p, turns) => ({ spin: -TAU * turns * (1 - (1 - p) ** 2) });

// Applies this frame's scripted aerial pose (player.air) after the walk cycle: the rig turns over about the waist,
// spins on the spot and leaves the ground while the legs tuck in. With none set the rig stands at rest.
export function poseAir(player) {
  const { rig, legs } = player.parts;
  const { pitch = 0, spin = 0, lift = 0, tuck = 0 } = player.air || {};
  rig.rotation.set(pitch, spin, 0);
  rig.position.set(0, WAIST * (1 - Math.cos(pitch)) + lift, -WAIST * Math.sin(pitch));
  if (tuck <= 0) return;
  legs.forEach(({ hip, knee }) => {
    hip.rotation.x = -1.2 * tuck;
    knee.rotation.x = 1.9 * tuck;
  });
}