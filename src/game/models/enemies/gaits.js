import { approach } from '../../math';

// Stride clock: the phase advances with distance walked (no foot skating), the weight eases the pose in and out.
function stride(cadence) {
  const gait = { phase: Math.random() * Math.PI * 2, weight: 0 };
  return (dt, moved) => {
    gait.weight = approach(gait.weight, moved > 0 ? 1 : 0, moved > 0 ? 8 : 5, dt);
    gait.phase += moved * cadence;
    return gait;
  };
}

// Two-legged walk: legs swing in opposite pairs from the hips (knees fold through each swing), the body dips
// as both feet plant and rolls over the planted foot.
export function walker(root, legs, { length, swing, cadence, fold = 0, roll = 0.03 }) {
  const tick = stride(cadence);
  return (dt, moved) => {
    const { phase, weight: w } = tick(dt, moved);
    const a = Math.sin(phase) * swing * w;
    const c = Math.cos(phase);
    legs.forEach(({ hip, knee }, i) => {
      const side = i % 2 ? -1 : 1;
      hip.rotation.x = -a * side;
      if (knee) knee.rotation.x = fold * Math.max(0, c * side) ** 1.5 * w;
    });
    root.position.y = -length * (1 - Math.cos(a));
    root.rotation.z = -c * roll * w;
  };
}

// Six-legged tripod gait: alternating triangles of legs sweep forward lifted, then push back planted.
// Blends over the idle leg twitch the model's own animator set this frame.
export function scuttle(legs, { swing, lift, cadence }) {
  const tick = stride(cadence);
  return (dt, moved) => {
    const { phase, weight: w } = tick(dt, moved);
    legs.forEach((leg, i) => {
      const side = i < 3 ? -1 : 1;
      const p = phase + Math.PI * (((i % 3) + (i < 3 ? 0 : 1)) % 2);
      leg.rotation.y = leg.rotation.y * (1 - w) - side * swing * Math.sin(p) * w;
      leg.rotation.z = side * lift * Math.max(0, Math.cos(p)) * w;
    });
  };
}

// Robed glide: the hem trails back and swishes side to side over unseen steps while the body bobs.
export function glide(root, skirt, { cadence, sway = 0.08, trail = 0.12, bob = 0.03 }) {
  const tick = stride(cadence);
  return (dt, moved) => {
    const { phase, weight: w } = tick(dt, moved);
    skirt.rotation.x = (trail + Math.sin(phase * 2) * 0.04) * w;
    skirt.rotation.z = Math.sin(phase) * sway * w;
    root.position.y = Math.abs(Math.cos(phase)) * bob * w;
  };
}