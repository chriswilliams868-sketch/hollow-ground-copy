// Hand pivots use rotation order YXZ: yaw aims the weapon, pitch raises/lowers it.
export function poseTowards(pivot, pose, rate, dt) {
  const k = 1 - Math.exp(-rate * dt);
  pivot.rotation.y += (pose.yaw - pivot.rotation.y) * k;
  pivot.rotation.x += (pose.pitch - pivot.rotation.x) * k;
  pivot.position.y += (pose.y - pivot.position.y) * k;
  pivot.position.z += (pose.z - pivot.position.z) * k;
}

export function applyPose(pivot, pose) {
  pivot.rotation.y = pose.yaw;
  pivot.rotation.x = pose.pitch;
  pivot.position.y = pose.y;
  pivot.position.z = pose.z;
}

function capturePose(pivot) {
  return { yaw: pivot.rotation.y, pitch: pivot.rotation.x, y: pivot.position.y, z: pivot.position.z };
}

function lerpPose(pivot, from, to, t) {
  pivot.rotation.y = from.yaw + (to.yaw - from.yaw) * t;
  pivot.rotation.x = from.pitch + (to.pitch - from.pitch) * t;
  pivot.position.y = from.y + (to.y - from.y) * t;
  pivot.position.z = from.z + (to.z - from.z) * t;
}

// A pose set is { main, off }; a hand missing from the set falls back to the class rest pose.
export function handsTowards(player, set, rate, dt) {
  const { weapon, offhand } = player.parts;
  const rest = player.kit.rest;
  poseTowards(weapon, set?.main || rest.main, rate, dt);
  if (offhand) poseTowards(offhand, set?.off || rest.off, rate, dt);
}

export function captureHands(player) {
  const { weapon, offhand } = player.parts;
  return { main: capturePose(weapon), off: offhand ? capturePose(offhand) : null };
}

// Snap both hands into the equipped weapon's rest pose (after a weapon swap).
export function restHands(player) {
  const { weapon, offhand } = player.parts;
  applyPose(weapon, player.kit.rest.main);
  if (offhand) applyPose(offhand, player.kit.rest.off);
}

export function lerpHands(player, from, set, t) {
  const { weapon, offhand } = player.parts;
  const rest = player.kit.rest;
  lerpPose(weapon, from.main, set.main || rest.main, t);
  if (offhand) lerpPose(offhand, from.off, set.off || rest.off, t);
}