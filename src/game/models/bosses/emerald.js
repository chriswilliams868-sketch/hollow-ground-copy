import { glowing, gem, node, rot, pulse } from '../kit';
import { voxMat, line, spike, ellipsoid } from '../voxel';
import { hollowEyes } from '../enemies/rig';
import { bossRoot, shoulder, bvox } from './rig';

const BARK = '#6b4423';
const BARK2 = '#5a391d';
const DARK = '#2b1d10';
const ROOT = '#24180d';
const LEAF = '#3f7d1f';
const LEAF2 = '#4d9126';
const leaves = (i) => (i % 2 ? LEAF : LEAF2);

// Half-depth of the trunk layer at height y (boss voxels), so the veins lie on its front face
const depthAt = (y) => (12 + Math.min(7, Math.max(0, Math.floor(y / 1.8))) * 0.5) * 0.4;

// Twisted trunk: stacked bark layers drifting side to side, knots, a dark frame round the emerald and mossy shoulders
const TRUNK = [
  ...Array.from({ length: 8 }, (_, i) => {
    const w = 12 + i * 0.5;
    return [w, 1.8, w * 0.8, Math.round(Math.sin(i * 0.9) * 2) / 2, 0.9 + i * 1.8, 0, i % 2 ? BARK : BARK2];
  }),
  [2, 2, 1.5, 4, 3, 5.4, DARK],
  [2, 2, 1.5, -4.6, 11, 5.9, DARK],
  [2, 2, 1.5, 1.6, 6, -5.8, DARK],
  [6, 1, 1.2, 0, 10.75, 5.9, DARK],
  [6, 1, 1.2, 0, 5.25, 5.9, DARK],
  [1, 4.5, 1.2, 2.5, 8, 5.9, DARK],
  [1, 4.5, 1.2, -2.5, 8, 5.9, DARK],
  ...ellipsoid(3, 1.2, 3, 6, 14.6, 0, leaves),
  ...ellipsoid(3, 1.2, 3, -6, 14.6, 0, leaves),
];
const VEINS = [[-5, 12], [5, 11.5], [-5.5, 3.5], [5, 3], [0, 13.5]]
  .flatMap(([x, y]) => line([0, 8, 0], [x, y, 0], 0.8, LEAF))
  .map((b) => {
    b[5] = depthAt(b[4]) + 0.2;
    return b;
  });
const CANOPY = [
  ...ellipsoid(8, 4.5, 8, 0, 6, 0, leaves),
  ...ellipsoid(5, 3.4, 5, -6.4, 3, -1, leaves),
  ...ellipsoid(5, 3.4, 5, 6.6, 3.6, 0.6, leaves),
  ...ellipsoid(4.6, 3, 4.6, 0.6, 5, -5.5, leaves),
  ...[-1, 1].flatMap((s) => [...line([s * 2, 0, 0], [s * 7, 5, 0], 1.2, DARK), ...line([s * 1, 0, -1], [s * 4, 7, -3], 1, DARK)]),
];
const leg = (s) => [
  [6, 6, 6, 0, 8, 0, DARK],
  [7.5, 6, 7.5, 0, 3, 0, ROOT],
  ...[-1.2, -0.4, 0.4, 1.2].flatMap((a) => {
    const b = a + s * 0.6;
    return spike([Math.sin(b) * 3, 0.8, Math.cos(b) * 3], [Math.sin(b) * 7, 0.4, Math.cos(b) * 7], 1.8, DARK, 0.6);
  }),
];
const FOREARM = [
  [3.6, 8, 3.6, 0, -4, 0, BARK],
  [4, 1, 4, 0, -2, 0, BARK2],
  ...[-1.4, -0.5, 0.5, 1.4].flatMap((x) => spike([x * 0.6, -7.8, 0], [x * 2.4, -12.5, x * 0.6 + 1], 1.3, DARK, 0.5)),
];

// Emerald Guardian: massive voxel Ent-Golem of stacked bark, root feet, a leafy block canopy, sweeping root arms
// and an emerald set in its chest.
export function buildEmerald() {
  const { group } = bossRoot(2.1);
  const bark = voxMat({ roughness: 0.95, emissive: '#166534', emissiveIntensity: 0.3 });
  const coreMat = gem('#34d399');
  const vein = glowing('#34d399', 1.1);
  const eye = glowing('#6ee7b7', 2.6);

  [-1, 1].forEach((s) => group.add(node(s * 0.55, 0, 0, bvox(leg(s), bark))));

  const core = node(0, 1.0, 0.75, bvox([[3, 4.5, 3, 0, 0, 0, LEAF]], coreMat));
  const body = node(0, 1.35, 0, bvox(TRUNK, bark), bvox(VEINS, vein), core);

  const head = node(0, 1.85, 0.1, bvox([[8, 1.3, 2, 0, -0.2, 6.4, DARK], [3.4, 0.6, 1, 0, -4.2, 6.3, '#050203']], bark));
  hollowEyes(head, eye, 0.26, -0.18, 0.82, 0.13, 0.06);
  const canopy = node(0, 0.1, -0.1, bvox(CANOPY, bark));
  head.add(canopy);
  body.add(head);

  const arms = [-1, 1].map((s) => {
    const arm = shoulder(body, s * 1.05, 1.5, 0);
    const forearm = rot(node(s * 0.15, -1.15, 0.05, bvox([...FOREARM, ...spike([s * 1.6, -3, 0], [s * 4, -5, 0], 1, DARK, 0.3)], bark)), -0.25, 0, 0);
    arm.add(rot(bvox([[4, 9, 4, 0, -4.5, 0, DARK], [4.6, 2, 4.6, 0, -0.5, 0, LEAF]], bark), 0, 0, s * 0.12), forearm);
    return arm;
  });

  group.add(body);
  let t = 0;
  const animate = (engine, boss, dt) => {
    t += dt;
    canopy.rotation.z = Math.sin(t * 1.1) * 0.04;
    if (boss.dead) return;
    pulse(coreMat, 2.4, 0.7, t, 2);
    pulse(vein, 1.1, 0.5, t, 2);
    pulse(eye, 2.4, 0.5, t, 3);
  };
  return { group, height: 4.5, parts: { body, head, core, arms, bodyMat: bark, coreMat, animate } };
}