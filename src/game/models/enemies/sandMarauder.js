import { glowing, node, pulse } from '../kit';
import { vox, voxMat, mirror, line, spike } from '../voxel';
import { voxCloth, flutter } from '../cloth';
import { legs } from '../../heroes/common';
import { creature, strikeArm, hangArm, clock, finish, rootOf } from './rig';
import { walker } from './gaits';

const WR = '#d6c08f';
const WR2 = '#c4ab78';
const CL = '#7a5c3a';
const BO = '#efe6d2';
const LE = '#4a2f1b';

// Bandage-wrapped torso: one stripe per voxel layer, belt, pouch, red sash and a cloth shoulder wrap
const TORSO = [
  ...Array.from({ length: 9 }, (_, i) => [i < 2 ? 7 : 8, 1, 5.5, 0, -4 + i, 0, i % 2 ? WR : WR2]),
  [8.6, 1, 6, 0, -4, 0, LE],
  [1.6, 2, 1.3, 3.5, -4.8, 1.6, LE],
  ...line([-3.5, -3, 2.9], [3.5, 3.5, 2.9], 1, '#7f1d1d'),
  [9, 2, 6.2, 0, 4.5, 0, CL],
  [7, 1, 5, 0, 6, 0, CL],
];
const HEAD = [
  [6, 6, 6, 0, 0, 0, WR],
  [7, 1.5, 7, 0, 2, 0, WR2],
  [6, 1, 6, 0, 3.2, 0, WR],
  // Bone skull mask: brow, cheeks, jaw, teeth, sockets and little horns
  [6, 3.5, 1, 0, 0.25, 3.4, BO],
  [4, 1, 1, 0, -2, 3.4, BO],
  ...[-1.5, -0.5, 0.5, 1.5].map((x) => [0.6, 0.8, 0.5, x, -2.7, 3.6, BO]),
  ...mirror([[1.6, 1.4, 0.4, 1.2, 0.4, 3.95, '#0a0603'], ...spike([1.2, 2, 3.2], [1.6, 4.4, 2.4], 0.8, BO, 0.4)]),
];
// Curved scimitar: steel cubes rising gently along the blade
const BLADE = Array.from({ length: 10 }, (_, i) => [0.6, 1.6, 1.2, 0, 0.03 * i * i, 8.8 + i * 1.15, i % 2 ? '#d4d4d8' : '#f4f4f5']);

// Desert Wastes voxel raider: striped bandage wraps, a bone skull mask with glowing eyes and a curved scimitar.
export default function sandMarauder() {
  const group = creature(0.62, 0.3);
  const wrap = voxMat({ roughness: 0.9, emissive: '#7c5e2a', emissiveIntensity: 0.25 });
  const eye = glowing('#fb923c', 2.6);
  const stride = legs(group, { x: 0.14, w: 2.6, mat: wrap, leg: WR, boot: LE, wraps: WR2 });

  const body = node(0, 0.95, 0, vox(TORSO, wrap));
  const scarf = voxCloth(2, 5, 1.75, wrap, (c, r) => ((c + r) % 2 ? CL : '#6b4f31'));
  scarf.position.set(-0.1, 1.28, -0.24);
  scarf.rotation.x = 0.25;
  const head = node(0, 1.47, 0, vox(HEAD, wrap), vox(mirror([[0.8, 0.8, 0.4, 1.2, 0.4, 4.15, BO]]), eye));

  const { arm, limb } = strikeArm(group, 0.3, 1.18, 0.05);
  limb.add(vox([[2.2, 2.2, 6.4, 0, 0, 3.2, WR], [2.4, 2.4, 0.8, 0, 0, 2, WR2], [2, 2, 2, 0, 0, 6.7, LE], [4.5, 1, 1, 0, 0, 7.8, '#c9a227'], ...BLADE], wrap));
  const off = hangArm(group, -0.3, 1.18, 0, -0.25);
  off.add(vox([[2.2, 7.2, 2.2, 0, -3.6, 0, WR], [2.4, 0.8, 2.4, 0, -2.4, 0, WR2], [2, 2, 2, 0, -7.5, 0, LE]], wrap));

  group.add(body, scarf, head);
  const animate = clock((t) => {
    flutter(scarf, t, 0.08, 6);
    pulse(eye, 2.4, 0.6, t, 3.5);
  });
  const walk = walker(rootOf(group), stride, { length: 0.68, swing: 0.5, cadence: 4.8, fold: 0.8 });
  return finish(group, { body, head, arm, bodyMat: wrap, animate, walk });
}