import * as THREE from 'three';
import { blob } from '../actors';
import { node } from '../models/kit';
import { V, vox, voxMat } from '../models/voxel';
import { flutter } from '../models/cloth';
import { tone } from '../models/palette';

const HIP = 0.68;
const KNEE = HIP - 5 * V;

const HAND_DROP = 0.12; // fists float this far below each pose's height, beside the lower torso
const FIST = 2.6; // fist cube size in voxels

// Trove-style hand: no arm, just a weapon pivot floating beside the torso (YXZ: yaw aims, pitch raises/lowers).
// It hangs off an anchor that rides the hips with the torso and drops every pose to waist level.
export function handPivot(group, x) {
  const anchor = new THREE.Group();
  anchor.position.y = -HAND_DROP;
  const pivot = new THREE.Group();
  pivot.rotation.order = 'YXZ';
  pivot.position.x = x;
  anchor.add(pivot);
  group.add(anchor);
  return pivot;
}

// Chunky voxel fist gripping whatever its parent holds: a darker wrist cuff round its back and a raised knuckle ridge.
export function fist(parent, color) {
  parent.add(vox([
    [FIST, FIST, FIST, 0, 0, 0, color],
    [FIST + 0.3, FIST + 0.3, 0.8, 0, 0, 0.4 - FIST / 2, tone(color, -0.12)],
    [FIST * 0.8, 0.4, FIST * 0.5, 0, FIST / 2 + 0.2, FIST * 0.15, tone(color, 0.1)],
  ], voxMat({ roughness: 0.55, metalness: 0.3 })));
}

// YXZ so a lean (dash) or a fall tips the hero along its own facing, not a fixed world axis.
export function startHero(shadowRadius) {
  const group = new THREE.Group();
  group.rotation.order = 'YXZ';
  group.add(blob(shadowRadius));
  return group;
}

// Two jointed voxel legs (hip and knee pivots, returned for the walk cycle): thigh block, shin and boot in
// `w`-voxel-wide columns, plus optional knee plate, thigh plate, boot cuff, shin wraps and toe cap (all colours).
export function legs(group, { x = 0.15, w = 3, mat, leg, boot, knee, thigh, cuff, wraps, toe }) {
  const t = (HIP - KNEE) / V; // thigh length in voxels
  const k = KNEE / V; // knee to sole in voxels
  return [-1, 1].map((s) => {
    const shin = [
      [w - 0.2, k - 2, w - 0.2, 0, -(k - 2) / 2, 0, leg],
      [w + 0.4, 2, w + 1.4, 0, 1 - k, 0.5, boot],
    ];
    if (knee) shin.push([w - 0.6, 1.6, 1, 0, -0.4, w / 2 + 0.3, knee]);
    if (cuff) shin.push([w + 0.6, 0.8, w + 0.6, 0, 2.4 - k, 0, cuff]);
    if (wraps) [1.4, 2.8].forEach((y) => shin.push([w + 0.2, 0.5, w + 0.2, 0, -y, 0, wraps]));
    if (toe) shin.push([w - 0.6, 1, 1.4, 0, 0.5 - k, w / 2 + 1.6, toe]);
    const thighs = [[w, t + 0.5, w, 0, -t / 2, 0, leg]];
    if (thigh) thighs.push([w + 0.6, t * 0.6, w + 0.6, 0, -t * 0.32, 0, thigh]);
    const kneeNode = node(0, KNEE - HIP, 0, vox(shin, mat));
    const hip = node(s * x, HIP, 0, vox(thighs, mat), kneeNode);
    group.add(hip);
    return { hip, knee: kneeNode };
  });
}

// Adds the parry aura, caches base values and an animator (cape and cloth ripple, breathing eye glow).
export function finishHero(group, parts) {
  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 18, 14),
    new THREE.MeshBasicMaterial({ color: '#5ee7ff', transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  aura.position.y = 0.95;
  aura.visible = false;
  group.add(aura);
  // Everything but the ground shadow rides one rig, so leaps, flips and spins can turn the whole hero over
  const rig = new THREE.Group();
  group.children.filter((child) => child.name !== 'blob').forEach((child) => rig.add(child));
  group.add(rig);

  const { flaps = [], capeFlutter = 0.07, legs: stride = [], riders = [] } = parts;
  // The floating fists' anchors bob along with the torso
  const hands = [parts.weapon, parts.offhand].filter(Boolean).map((pivot) => pivot.parent);
  const eyeBase = parts.eyeMat.emissiveIntensity;
  let t = Math.random() * 5;
  return {
    group,
    parts: {
      offhand: null,
      muzzles: [],
      ...parts,
      aura,
      rig,
      heroGlow: parts.glowMat,
      baseEmissive: parts.bodyMat.emissive.clone(),
      baseGlow: parts.bodyMat.emissiveIntensity,
      glowBase: parts.glowMat.emissiveIntensity,
      bodyPitch: parts.body.rotation.x,
      capeBase: parts.cape.rotation.x,
      legs: stride,
      // Everything that rides the hips through the walk cycle, with its resting height
      riders: [parts.body, parts.head, parts.cape, ...hands, ...riders].map((object) => ({ object, y: object.position.y })),
      gait: { phase: 0, weight: 0, t: 0, ux: 0, uz: 1, lead: 0, dashing: false, hipY: stride[0]?.hip.position.y ?? 0 },
      animate(dt) {
        t += dt;
        flutter(parts.cape, t, capeFlutter, 5);
        flaps.forEach(([mesh, amount], i) => flutter(mesh, t + i * 1.7, amount, 4));
        parts.eyeMat.emissiveIntensity = eyeBase * (0.85 + Math.sin(t * 2.6) * 0.15);
      },
    },
  };
}