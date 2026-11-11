const STIFF = 240; // spring pulling the struck body back upright
const DAMP = 17; // underdamped: it rocks back past upright once before settling

// Directional hit reaction: the struck actor snaps into a lean along the blow (pushed away from the attacker), in its
// own frame, so a hit from the front rocks it back and one from the side tips it over sideways. Needs YXZ rotation.
export function kickStagger(actor, dir, lean) {
  const s = actor.sway || (actor.sway = { x: 0, z: 0, vx: 0, vz: 0 });
  const sin = Math.sin(actor.facing);
  const cos = Math.cos(actor.facing);
  s.x = (dir.x * sin + dir.z * cos) * lean;
  s.z = -(dir.x * cos - dir.z * sin) * lean;
  s.vx = 0;
  s.vz = 0;
}

// Springs the lean back upright each frame.
export function swayBack(actor, dt) {
  const s = actor.sway;
  if (!s) return;
  s.vx += (-STIFF * s.x - DAMP * s.vx) * dt;
  s.vz += (-STIFF * s.z - DAMP * s.vz) * dt;
  s.x += s.vx * dt;
  s.z += s.vz * dt;
  actor.group.rotation.x = s.x;
  actor.group.rotation.z = s.z;
}