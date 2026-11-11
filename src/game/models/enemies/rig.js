import * as THREE from 'three';
import { blob } from '../../actors';
import { std, part, node } from '../kit';

// YXZ so a hit lean (stagger) or a fall tips the body along its own facing.
export function creature(shadow, opacity = 0.32) {
  const group = new THREE.Group();
  group.rotation.order = 'YXZ';
  group.add(blob(shadow, opacity));
  return group;
}

// Striking arm: the AI swings `arm` on X (-1.5 wind-up, 0.9 strike); the limb rests pointing forward-down.
export function strikeArm(group, x, y, z, rest = 0.7) {
  const arm = node(x, y, z);
  const limb = new THREE.Group();
  limb.rotation.x = rest;
  arm.add(limb);
  group.add(arm);
  return { arm, limb };
}

// Static off-arm hanging from the shoulder (children point down -Y).
export function hangArm(group, x, y, z, rz, rx = 0.2) {
  const arm = node(x, y, z);
  arm.rotation.set(rx, 0, rz);
  group.add(arm);
  return arm;
}

// Dark hollow voxel sockets with a glowing pupil cube deep inside each.
export function hollowEyes(parent, eyeMat, x, y, z, socket = 0.08, pupil = 0.035) {
  const voidMat = std('#050203', { roughness: 1 });
  [-1, 1].forEach((s) => {
    parent.add(
      part(new THREE.BoxGeometry(socket * 2, socket * 1.6, socket), voidMat, s * x, y, z),
      part(new THREE.BoxGeometry(pupil * 2, pupil * 2, pupil), eyeMat, s * x, y, z + socket * 0.5)
    );
  });
}

// Pivot at `at` holding parts placed in the same frame as it (they are re-based onto the pivot).
export function joint(parent, [x, y, z], ...parts) {
  const pivot = node(x, y, z);
  parts.forEach((p) => {
    p.position.set(p.position.x - x, p.position.y - y, p.position.z - z);
    pivot.add(p);
  });
  if (parent) parent.add(pivot);
  return pivot;
}

// Everything but the ground shadow rides one root node, so a walk cycle can dip and roll the whole body.
export function rootOf(group) {
  const root = new THREE.Group();
  group.children.filter((child) => child.name !== 'blob').forEach((child) => root.add(child));
  group.add(root);
  return root;
}

// Per-instance ambient animation clock.
export function clock(fn) {
  let t = Math.random() * 10;
  return (dt) => {
    t += dt;
    fn(t, dt);
  };
}

// AI contract: body/head/arm meshes, the flashing bodyMat (with its resting opacity) and an animator.
export function finish(group, parts) {
  return { group, parts: { ...parts, baseOpacity: parts.bodyMat.opacity } };
}