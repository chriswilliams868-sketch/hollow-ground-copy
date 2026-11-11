import * as THREE from 'three';
import { groundHeight, groundNormal, surfaceHeight } from './terrain';

const UP = new THREE.Vector3(0, 1, 0);
const DISC = new THREE.Vector3(0, 0, 1);
const normal = new THREE.Vector3();
const tilt = new THREE.Quaternion();
const inverse = new THREE.Quaternion();

// A point `lift` metres above the terrain under `position`.
export const above = (position, lift = 0) => new THREE.Vector3(position.x, groundHeight(position.x, position.z) + lift, position.z);

// Lowest ground under a footprint, so props sit flush on a slope instead of floating on its low side.
export function restHeight(x, z, radius) {
  return Math.min(
    groundHeight(x, z),
    groundHeight(x + radius, z),
    groundHeight(x - radius, z),
    groundHeight(x, z + radius),
    groundHeight(x, z - radius)
  );
}

// Rotation that lays a flat (XZ-plane) object onto the slope at (x, z).
export const slopeQuaternion = (x, z, out = new THREE.Quaternion()) => out.setFromUnitVectors(UP, groundNormal(x, z, normal));

// Drops a ground decal (ring, telegraph, cloud) onto the terrain, or onto the water over a river: surface plus `lift`.
export function settle(object, x, z, lift = 0) {
  object.position.set(x, surfaceHeight(x, z) + lift, z);
  object.quaternion.premultiply(slopeQuaternion(x, z, tilt));
  return object;
}

// Lays an actor's contact shadow flat on the slope beneath it, whatever way the body is turned.
export function shadeGround(actor) {
  if (actor.groundShadow === undefined) actor.groundShadow = actor.group.getObjectByName('blob') || null;
  if (!actor.groundShadow) return;
  const p = actor.group.position;
  tilt.setFromUnitVectors(DISC, groundNormal(p.x, p.z, normal));
  actor.groundShadow.quaternion.copy(inverse.copy(actor.group.quaternion).invert().multiply(tilt));
}

// Feet on the terrain, shadow on the slope.
export function standOnGround(actor) {
  const p = actor.group.position;
  p.y = groundHeight(p.x, p.z);
  shadeGround(actor);
}