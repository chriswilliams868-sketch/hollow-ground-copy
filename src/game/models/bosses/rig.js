import * as THREE from 'three';
import { blob } from '../../actors';
import { node } from '../kit';
import { vox } from '../voxel';

// Guardians are colossal, so they stack chunkier voxels: one boss voxel is 12.5 cm.
export const U = 0.125;
export const bvox = (list, material, x = 0, y = 0, z = 0) => vox(list, material, x, y, z, U);

// Boss root: the AI moves/turns `group` (YXZ, so a hit lean tips it along its facing); the contact shadow stays on the ground.
export function bossRoot(shadowRadius) {
  const group = new THREE.Group();
  group.rotation.order = 'YXZ';
  const shadow = blob(shadowRadius, 0.42);
  group.add(shadow);
  return { group, shadow };
}

// Arm pivot the AI swings on X (rest: hanging down).
export function shoulder(parent, x, y, z) {
  const pivot = node(x, y, z);
  parent.add(pivot);
  return pivot;
}

// Levitation: bobs the model rig and shrinks/fades the ground shadow as it rises.
export function hover(rig, shadow, base, t, amount = 0.15) {
  const lift = Math.sin(t * 1.6) * amount;
  rig.position.y = base + lift;
  shadow.scale.setScalar(1 - lift * 0.5);
  shadow.material.opacity = 0.55 - lift;
}