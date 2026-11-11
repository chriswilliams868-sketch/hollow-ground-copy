import { std, glowing, node, pulse } from '../kit';
import { vox, voxMat, spike, ellipsoid } from '../voxel';
import { creature, strikeArm, hangArm, clock, finish, rootOf } from './rig';
import { walker } from './gaits';

const FL = '#1e1b2e';
const FL2 = '#25213a';
const HI = '#15121f';
const flesh = (i) => (i % 2 ? FL : FL2);

const SPIKES = [[-0.32, 1.95, -0.35], [0, 2.15, -0.4], [0.32, 1.95, -0.35], [-0.18, 1.7, -0.65], [0.18, 1.7, -0.65]].flatMap(([x, y, z]) => {
  const at = [x * 16, y * 16, z * 16];
  return spike(at, [at[0] * 1.3, at[1] + 8, at[2] - 4], 2, HI, 0.6);
});
const SMOKE = [0, 1, 2, 3].flatMap((i) => {
  const a = (i / 4) * Math.PI * 2 + 0.4;
  const x = Math.sin(a) * 7.2;
  const z = Math.cos(a) * 7.2;
  return spike([x, 9.6, z], [x, 2, z], 4, HI, 1.4);
});
const EYES = [[-0.12, 0.08, 0.05], [0.1, 0.1, 0.06], [0, 0.19, 0.035], [-0.2, -0.02, 0.03], [0.2, 0, 0.035]].map(([x, y, r]) => [r * 32, r * 32, 0.8, x * 16, y * 16, 4.3, HI]);

// Shadow Ruins voxel brute: hunched stepped mass of shadow with obsidian back spikes, a cluster of glowing pink eye
// cubes, a fanged maw, smoking tendrils and a taloned arm.
export default function shadowAbomination() {
  const group = creature(1.05, 0.36);
  const fleshMat = voxMat({ roughness: 0.7, emissive: '#6d28d9', emissiveIntensity: 0.25 });
  const obsidian = std('#0b0912', { roughness: 0.18, metalness: 0.55, emissive: '#a855f7', emissiveIntensity: 0.6 });
  const smoke = std('#120d1f', { transparent: true, opacity: 0.55, roughness: 1, depthWrite: false });
  const eye = glowing('#f472b6', 2.8);

  const legs = [-1, 1].map((s) => {
    const hip = node(s * 0.35, 0.72, 0, vox([[6.4, 6, 6.4, 0, -2.5, 0, HI], [7, 5.6, 7, 0, -8.7, 0, FL]], fleshMat));
    group.add(hip);
    return { hip };
  });
  group.add(vox(SMOKE, smoke), vox(ellipsoid(7.2, 4.5, 7.2, 0, 29.6, -4, HI), fleshMat), vox(SPIKES, obsidian));
  const body = vox(ellipsoid(13.2, 10.3, 11.5, 0, 0, 0, flesh), fleshMat, 0, 1.3, 0);

  const head = node(0, 1.62, 0.62,
    vox([[9, 8, 8, 0, 0, 0, HI], [5, 1, 1, 0, -2.1, 4.3, '#050208'], ...[-1.6, -0.5, 0.6, 1.7].map((x) => [0.5, 1, 0.5, x, -1.6, 4.5, '#e5e1ee'])], fleshMat),
    vox(EYES, eye)
  );

  const { arm, limb } = strikeArm(group, 0.82, 1.6, 0.1);
  limb.add(
    vox([[6.4, 6.4, 6.4, 0, 0, 4, FL], [5.4, 5.4, 5.4, 0, 0, 8.8, HI], [4.8, 4.8, 4.8, 0, 0, 12.8, FL]], fleshMat),
    vox([-2.4, 0, 2.4].flatMap((x) => spike([x * 0.5, 0, 14.4], [x * 1.4, -2, 21], 1.4, HI, 0.5)), obsidian)
  );
  const off = hangArm(group, -0.8, 1.55, 0, -0.35);
  off.add(vox([[5.1, 5.1, 5.1, 0, -4, 0, HI], [4.2, 4.2, 4.2, 0, -8, 0, FL], [3.2, 3.2, 3.2, 0, -11.5, 0, HI]], fleshMat));

  group.add(body, head);
  const animate = clock((t) => {
    body.scale.y = 0.95 + Math.sin(t * 2) * 0.03;
    pulse(eye, 2.6, 0.9, t, 5);
    pulse(obsidian, 0.6, 0.3, t, 2);
  });
  const walk = walker(rootOf(group), legs, { length: 0.72, swing: 0.38, cadence: 5.9, roll: 0.05 });
  return finish(group, { body, head, arm, bodyMat: fleshMat, animate, walk });
}