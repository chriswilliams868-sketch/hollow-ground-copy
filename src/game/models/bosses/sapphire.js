import { std, glowing, gem, node, pulse } from '../kit';
import { voxMat, mirror, spike, ellipsoid } from '../voxel';
import { bossRoot, shoulder, hover, bvox } from './rig';

const ICE = '#67e8f9';
const ICE2 = '#a5f3fc';
const DEEP = '#1e40af';
const DEEP2 = '#1e3a8a';
const frost = (i) => (i % 2 ? ICE : ICE2);

// Double-ended voxel crystal through [x, y, z]: a long stepped point along `dir` and a short one opposite.
const crystal = ([x, y, z], [dx, dy, dz], base, color) => [
  ...spike([x, y, z], [x + dx, y + dy, z + dz], base, color, base * 0.3),
  ...spike([x, y, z], [x - dx * 0.4, y - dy * 0.4, z - dz * 0.4], base, color, base * 0.3),
];
const cluster = (r, colors) => colors.flatMap((c, i) => crystal([(i - (colors.length - 1) / 2) * r * 0.9, 0, (i % 2) * r * 0.5], [(i - 1) * r * 0.5, r * 2.4, 0], r, c));

const TAIL = [
  ...spike([0, 11, 0], [0, -3, 0], 4, ICE, 0.6),
  ...spike([2.4, 11.5, 0.8], [3.6, -0.5, 1], 2.2, DEEP, 0.4),
  ...spike([-2.4, 11.5, -0.8], [-3.6, -0.5, -1], 2.2, DEEP, 0.4),
];
const BODY = [
  ...ellipsoid(7, 6, 5.5, 0, 2.8, 0, frost),
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const at = [Math.sin(a) * 5, 2.4 + (i % 3) * 1.2, Math.cos(a) * 4.4];
    return spike(at, [at[0] + Math.sin(a) * 3.5, at[1] + 4.5, at[2] + Math.cos(a) * 3.5], 1.3, i % 2 ? DEEP : ICE2, 0.4);
  }).flat(),
];
const CROWN = [[-2, 4], [-1, 5.2], [0, 6.8], [1, 5.2], [2, 4]].flatMap(([x, l]) => spike([x, 2.6, -0.4], [x * 1.5, 2.6 + l, -0.8], 1, ICE2, 0.3));
const ORBIT = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2;
  return crystal([Math.cos(a) * 11.2, Math.sin(i * 1.7) * 2, Math.sin(a) * 11.2], [0, 2.6, 0], 0.9, i % 3 ? ICE : DEEP);
}).flat();

// Sapphire Guardian: levitating voxel Ice Elemental of stepped cyan crystal clusters around a frozen sapphire heart.
export function buildSapphire() {
  const { group, shadow } = bossRoot(1.9);
  const ice = voxMat({ transparent: true, opacity: 0.82, roughness: 0.12, metalness: 0.1, emissive: '#3b82f6', emissiveIntensity: 0.3 });
  const deep = voxMat({ roughness: 0.25, metalness: 0.3, emissive: '#1d4ed8', emissiveIntensity: 0.5 });
  const shellMat = std('#e0f2fe', { transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false });
  const coreMat = gem('#60a5fa', 2.6);
  const eye = glowing('#e0f2fe', 2.8);

  const rig = node(0, 0.9, 0, bvox(TAIL, ice));
  const core = node(0, 0.4, 0.5, bvox([[3, 4.4, 3, 0, 0, 0, ICE]], coreMat));
  const body = node(0, 1.5, 0, bvox(BODY, ice), bvox([[5.6, 6.4, 5.6, 0, 0, 0, ICE2]], shellMat, 0, 0.4, 0.5), core);

  const spinners = [];
  [-1, 1].forEach((s) => {
    const pauldron = node(s * 0.95, 0.85, 0, bvox(cluster(1.6, [ICE, DEEP, ICE]), ice));
    spinners.push(pauldron);
    body.add(pauldron);
  });
  const head = node(0, 1.25, 0.05,
    bvox([[5, 5.5, 4.4, 0, 0, 0, DEEP], [5.6, 1, 5, 0, 2.2, 0, DEEP2], [3, 1, 4.6, 0, -3, 0, DEEP2]], deep),
    bvox(mirror([[1, 0.4, 0.4, 0.85, 0.3, 2.4, ICE]]), eye),
    bvox(CROWN, ice)
  );
  body.add(head);

  const arms = [-1, 1].map((s) => {
    const arm = shoulder(body, s * 1.0, 0.75, 0);
    const fist = node(0, -1.35, 0, bvox(cluster(2.2, [ICE, DEEP, ICE, DEEP]), ice));
    spinners.push(fist);
    arm.add(bvox([...spike([0, 0, 0], [0, -7, 0], 2.6, ICE, 1.8), ...spike([0, -6.6, 0.3], [0, -10, 0.3], 2.2, DEEP, 1.6)], ice), fist);
    return arm;
  });
  rig.add(body);

  const orbit = node(0, 1.4, 0, bvox(ORBIT, ice));
  rig.add(orbit);
  group.add(rig);

  let t = 0;
  const animate = (engine, boss, dt) => {
    t += dt;
    hover(rig, shadow, 0.9, t);
    orbit.rotation.y += dt * 0.9;
    spinners.forEach((spinner, i) => {
      spinner.rotation.y += dt * (i % 2 ? 1.4 : -1.1);
    });
    if (boss.dead) return;
    pulse(coreMat, 2.6, 0.8, t, 2);
    pulse(eye, 2.6, 0.5, t, 3);
  };
  return { group, height: 4.3, parts: { body, head, core, arms, bodyMat: ice, coreMat, animate } };
}