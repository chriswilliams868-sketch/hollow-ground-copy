import { approach, smoothstep } from '../math';

const LEG = 0.68; // hip to sole: how far the hips dip so a swung leg stays planted
const CADENCE = 3.4; // stride phase (radians) per metre walked
const SWING = 0.5; // thigh swing either side of vertical
const FOLD = 0.85; // knee fold at mid-swing
const SOFT = 0.08; // knees never lock straight while walking
const DASH_LEAD = [0.62, 0.55]; // leading leg mid-dash: thigh forward, knee bent
const DASH_TRAIL = [-0.6, 0.35]; // trailing leg kicked back

// 0 → 1 → 0 across a dash: snaps into the stride, holds it, eases out at the end.
export const dashEnvelope = (p) => smoothstep(0, 0.15, p) * (1 - smoothstep(0.65, 1, p));

// World move direction in the hero's own frame (x: its side, z: its front), so strafing steps sideways or back.
function localDir(gait, player, dt) {
  const { x, z } = player.lastDir;
  const s = Math.sin(player.facing);
  const c = Math.cos(player.facing);
  gait.ux = approach(gait.ux, x * c - z * s, 12, dt);
  gait.uz = approach(gait.uz, x * s + z * c, 12, dt);
}

// Walk cycle: thighs swing along the move direction, each knee folds through its swing, and the hips dip as
// both feet plant, carrying the torso, head and cape with them. A dash holds a long split stride instead.
export function updateGait(player, dt) {
  const { parts } = player;
  const { gait } = parts;
  const walking = player.stride > 0.1;
  gait.t += dt;
  gait.weight = approach(gait.weight, walking ? 1 : 0, walking ? 9 : 6, dt);
  gait.phase += player.stride * CADENCE * dt;
  if (walking) localDir(gait, player, dt);
  const dash = player.dodging ? player.dash : 0;
  if (dash > 0 && !gait.dashing) gait.lead = Math.sin(gait.phase) >= 0 ? 0 : 1;
  gait.dashing = dash > 0;

  const w = gait.weight * (1 - dash);
  const swing = SWING * Math.sin(gait.phase) * w;
  const drop = LEG * (1 - Math.cos(swing * Math.hypot(gait.ux, gait.uz)));
  const step = Math.cos(gait.phase);
  parts.legs.forEach(({ hip, knee }, i) => {
    const side = i === 0 ? 1 : -1; // the second leg runs half a cycle behind the first
    const [lunge, lift] = i === gait.lead ? DASH_LEAD : DASH_TRAIL;
    hip.rotation.x = -swing * side * gait.uz - lunge * dash;
    hip.rotation.z = swing * side * gait.ux;
    hip.position.y = gait.hipY - drop;
    knee.rotation.x = (FOLD * Math.max(0, step * side) ** 1.5 + SOFT) * w + lift * dash;
  });

  // Torso, head and cape ride the hips (breathing when standing still) and roll over the planted foot
  const breath = Math.sin(gait.t * 3) * 0.012 * (1 - gait.weight);
  parts.riders.forEach(({ object, y }) => {
    object.position.y = y + breath - drop;
  });
  parts.body.rotation.z = -step * 0.03 * w;
  parts.cape.rotation.x = parts.capeBase + 0.22 * gait.weight + 0.5 * dash + Math.sin(gait.t * 6) * 0.03;
}