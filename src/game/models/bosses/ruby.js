import { glowing, gem, node, rot, pulse } from '../kit';
import { voxMat, mirror, line, spike, ellipsoid } from '../voxel';
import { bossRoot, shoulder, bvox } from './rig';

const SAND = '#c8a26b';
const SAND2 = '#b8915a';
const DUSK = '#7a5a35';
const BRASS = '#c9a227';
const plates = (i) => (i % 2 ? SAND : SAND2);

// Brass band hugging the shell's top arc at depth z (shell-centred ellipsoid 10 x 6 x 13 at y 3, z -1)
const band = (z) => {
  const k = Math.sqrt(1 - ((z + 1) / 13) ** 2);
  return Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [1.3, 1.3, 1.3, Math.cos(a) * 10 * k, 3 + Math.sin(a) * 6 * k, z, BRASS];
  });
};
const SHELL = [...ellipsoid(10, 6, 13, 0, 3, -1, plates), [1.2, 1.2, 24, 0, 9.3, -1, BRASS], ...band(-6), ...band(-1), ...band(4)];
const HEAD = [
  [8, 5, 6, 0, 0, 0, DUSK],
  [9, 1.4, 6.4, 0, 2.4, -0.2, SAND],
  [6, 1, 1, 0, -2.4, 3, DUSK],
  ...spike([0, 2.8, 1.5], [0, 6, 4], 2.2, BRASS, 1.2),
  ...spike([0, 6, 4], [0, 9, 3.2], 1.2, BRASS, 0.4),
  ...mirror(spike([2.2, -1.8, 2.6], [1, -2.4, 7], 1.3, BRASS, 0.5)),
];
const TAIL = [[0, 0, 0.3], [0.35, -0.15, 0.27], [0.7, -0.2, 0.24], [1.05, -0.15, 0.21], [1.35, 0, 0.19], [1.55, 0.25, 0.17]].map(([y, z, r], i) => [r * 16, r * 16, r * 16, 0, y * 8, z * 8, i % 2 ? BRASS : SAND]);
// Brass cage round the ruby (core at tail voxels y 14.24, z 3.6)
const CAGE = [
  ...[[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]].map(([x, z]) => [0.8, 6, 0.8, x, 14.24, 3.6 + z, BRASS]),
  [6, 0.8, 6, 0, 17.24, 3.6, BRASS],
  [6, 0.8, 6, 0, 11.24, 3.6, BRASS],
];

// Ruby Guardian: colossal voxel Scarab-Construct of stacked sandstone plates banded with brass, a caged ruby
// burning in its raised tail.
export function buildRuby() {
  const { group } = bossRoot(2.3);
  const stone = voxMat({ roughness: 0.9, emissive: '#7f1d1d', emissiveIntensity: 0.3 });
  const coreMat = gem('#f43f5e');
  const eye = glowing('#fb7185', 2.6);

  [-1, 1].forEach((s) => [-0.85, 0, 0.85].forEach((z) => {
    group.add(rot(node(s * 1.0, 1.0, z, bvox([
      ...line([0, 0, 0], [s * 6, 3, 0], 1.6, DUSK),
      [1.8, 1.8, 1.8, s * 6, 3, 0, BRASS],
      ...line([s * 6, 3, 0], [s * 7.6, -6, 0], 1.4, SAND),
      ...spike([s * 7.6, -6, 0], [s * 7.8, -8, 0], 1.2, BRASS, 0.4),
    ], stone)), 0, s * z * 0.35, 0));
  }));

  const body = node(0, 1.35, 0, bvox(SHELL, stone));
  const head = node(0, 0.2, 1.45, bvox(HEAD, stone), bvox(mirror([[1.3, 1.3, 0.6, 2.6, 0.9, 3.2, '#ffffff']]), eye));
  body.add(head);

  const arms = [-1, 1].map((s) => {
    const arm = shoulder(body, s * 0.75, 0, 1.2);
    arm.add(bvox([
      ...line([0, 0, 0], [0, -6, 3.4], 1.8, DUSK),
      [2, 2, 2, 0, -6.3, 3.4, BRASS],
      ...spike([0, -6.3, 3.6], [s * 1, -5.6, 7.6], 1.4, BRASS, 0.5),
      ...spike([0, -6.8, 3.6], [-s * 0.6, -8.4, 6.6], 1.1, BRASS, 0.4),
    ], stone));
    return arm;
  });

  const core = node(0, 1.78, 0.45, bvox([[3.2, 4.4, 3.2, 0, 0, 0, SAND]], coreMat));
  const tail = node(0, 0.5, -1.5, bvox([...TAIL, ...CAGE], stone), core);
  body.add(tail);

  group.add(body);
  let t = 0;
  const animate = (engine, boss, dt) => {
    t += dt;
    tail.rotation.x = Math.sin(t * 1.2) * 0.08;
    if (boss.dead) return;
    pulse(coreMat, 2.4, 0.8, t, 2.4);
    pulse(eye, 2.4, 0.5, t, 3);
  };
  return { group, height: 4.0, parts: { body, head, core, arms, bodyMat: stone, coreMat, animate } };
}