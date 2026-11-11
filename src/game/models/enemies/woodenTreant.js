import { glowing, node, pulse } from '../kit';
import { vox, voxMat, line, spike, ellipsoid } from '../voxel';
import { creature, strikeArm, hangArm, hollowEyes, clock, finish, rootOf } from './rig';
import { walker } from './gaits';

const BARK = '#6b4423';
const BARK2 = '#5a391d';
const DARK = '#2b1d10';
const LEAF = '#3f7d1f';
const LEAF2 = '#4d9126';
const leaves = (i) => (i % 2 ? LEAF : LEAF2);

// Twisted trunk: stacked bark layers drifting side to side, knots, and leaf clumps on the shoulders
const TRUNK = [
  ...Array.from({ length: 10 }, (_, i) => [15 - i * 0.3, 2.08, 13 - i * 0.3, Math.round(Math.sin(i * 0.9) * 2) / 2, -9.36 + i * 2.08, 0, i % 2 ? BARK : BARK2]),
  [2, 2, 1.5, 4.8, -2.4, 6.6, DARK],
  [2, 2, 1.5, -5.4, 2.4, 5.8, DARK],
  [2, 2, 1.5, 1.6, -6.4, -6.6, DARK],
  [5, 2, 5, 6.7, 10.2, 0, LEAF],
  [5, 2, 5, -6.7, 10.2, 0, LEAF2],
];
const CANOPY = [
  ...ellipsoid(6.7, 4.5, 6.7, 0, 5.6, 0, leaves),
  ...ellipsoid(4.8, 3.4, 4.8, -6, 1.9, -1.6, leaves),
  ...ellipsoid(5.1, 3.6, 5.1, 6.4, 2.9, 0.8, leaves),
  ...ellipsoid(4.8, 3.4, 4.8, 0.8, 4, -5.6, leaves),
  ...line([4, 0, 0], [9, 6, 0], 1, DARK),
  ...line([-4, 0, 0], [-9, 6, 0], 1, DARK),
];
const leg = (s) => [
  [6, 7, 6, 0, -3.5, 0, DARK],
  [7.5, 5.8, 7.5, 0, -9.9, 0, '#24180d'],
  ...line([0, -12, 3], [s * 1, -12.4, 7], 1.5, DARK),
  ...line([3, -12, 1], [6.5, -12.4, 3.5], 1.5, DARK),
  ...line([-3, -12, 1], [-6, -12.4, 3], 1.5, DARK),
];

// Dark Forest voxel brute: twisted stacked-bark trunk, root legs, a leafy block canopy and hollow red eyes.
export default function woodenTreant() {
  const group = creature(1.0, 0.34);
  const bark = voxMat({ roughness: 0.95, emissive: '#7a4a1f', emissiveIntensity: 0.25 });
  const eye = glowing('#ff2d2d', 2.6);

  const legs = [-1, 1].map((s) => {
    const hip = node(s * 0.3, 0.8, 0, vox(leg(s), bark));
    group.add(hip);
    return { hip };
  });

  const body = node(0, 1.35, 0, vox(TRUNK, bark));
  const head = node(0, 2.0, 0, vox([[8, 1.4, 2, 0, -0.3, 7, DARK], [4, 1, 1, 0, -6, 7.6, '#050203']], bark));
  hollowEyes(head, eye, 0.15, -0.12, 0.45, 0.09, 0.04);
  const canopy = node(0, 0.05, -0.05, vox(CANOPY, bark));
  head.add(canopy);

  const { arm, limb } = strikeArm(group, 0.55, 1.75, 0.05);
  limb.add(vox([
    ...line([0, 0, 0], [0, 0, 13.6], 2, DARK),
    ...[-2.4, 0, 2.4].flatMap((x) => spike([0, 0, 13.6], [x, 0, 19], 1.2, DARK, 0.5)),
    [3.5, 3, 3.5, 0, 1.6, 4.8, LEAF],
  ], bark));
  const off = hangArm(group, -0.55, 1.7, 0, -0.35);
  off.add(vox([
    ...line([0, 0, 0], [0, -14.4, 0], 1.8, DARK),
    ...[-2, 0, 2].flatMap((x) => spike([0, -14.4, 0], [x, -19, x * 0.4], 1.1, DARK, 0.5)),
  ], bark));

  group.add(body, head);
  const animate = clock((t) => {
    canopy.rotation.z = Math.sin(t * 1.3) * 0.05;
    pulse(eye, 2.4, 0.6, t, 2.5);
  });
  const walk = walker(rootOf(group), legs, { length: 0.8, swing: 0.34, cadence: 5.9, roll: 0.05 });
  return finish(group, { body, head, arm, bodyMat: bark, animate, walk });
}