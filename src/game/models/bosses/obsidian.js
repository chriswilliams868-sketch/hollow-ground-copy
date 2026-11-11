import { std, glowing, gem, node, rot, pulse } from '../kit';
import { voxMat, mirror, spike, ellipsoid } from '../voxel';
import { voxCloth, flutter } from '../cloth';
import { bossRoot, shoulder, hover, bvox } from './rig';

const SH = '#1c1528';
const SH2 = '#241a35';
const DK = '#0d0a14';
const DK2 = '#140f1e';
const VOID = '#020104';

// Robe widening in steps to the hem (rig voxels)
const ROBE = Array.from({ length: 9 }, (_, i) => {
  const w = 9 + i * 0.9;
  return [w, 1.6, w * 0.85, 0, 13.6 - i * 1.6, 0, i % 2 ? DK : DK2];
});
const SMOKE = [0, 2.1, 4.2].flatMap((a) => spike([Math.sin(a) * 3.2, 2, Math.cos(a) * 3.2], [Math.sin(a) * 3.2, -5, Math.cos(a) * 3.2], 3, DK, 0.8));
const HOOD = [
  [7, 6.5, 7, 0, 0.5, -0.5, DK],
  [7, 1.2, 1.2, 0, 3.1, 3.4, DK],
  ...mirror([[1, 5, 1.2, 3, 0, 3.4, DK]]),
  [5, 4, 0.5, 0, 0, 3.3, VOID],
  [4, 3, 3, 0, 1.5, -5, DK],
  [2.5, 2, 2.5, 0, 1.6, -7.2, DK],
];
const RING = [[5, 1, 1.2, 0, 2.8, 6, DK], [5, 1, 1.2, 0, -2, 6, DK], ...mirror([[1, 3.8, 1.2, 2.4, 0.4, 6, DK]])];
const SLEEVE = [[3, 2, 3, 0, -1, 0, SH], [3.6, 2, 3.6, 0, -3, 0, SH2], [4.2, 2, 4.2, 0, -5, 0, SH], [4.8, 1.6, 4.8, 0, -6.8, 0, SH2]];
const TALONS = [[1.2, 4.4, 1.2, 0, -9.2, 0.4, DK], ...[-1.4, -0.5, 0.5, 1.4].flatMap((x) => spike([x * 0.6, -11.4, 0.4], [x * 1.6, -15, 1], 0.8, DK, 0.3))];
const SHARD = [...spike([0, 0, 0], [0, 3, 0], 1.4, DK, 0.3), ...spike([0, 0, 0], [0, -2, 0], 1.4, DK, 0.3)];

// Obsidian Guardian: hovering voxel Shadow-Wraith in stepped robes and a deep hood, a pulsing obsidian core and a
// storm of floating obsidian shards.
export function buildObsidian() {
  const { group, shadow } = bossRoot(1.9);
  const shroud = voxMat({ roughness: 0.85, emissive: '#7c3aed', emissiveIntensity: 0.3 });
  const obsidian = std('#0b0912', { roughness: 0.12, metalness: 0.6, emissive: '#7c3aed', emissiveIntensity: 0.5 });
  const smoke = std('#120d1f', { transparent: true, opacity: 0.5, roughness: 1, depthWrite: false });
  const coreMat = gem('#a78bfa');
  const eye = glowing('#c084fc', 3);

  const rig = node(0, 0.6, 0, bvox(ROBE, shroud), bvox(SMOKE, smoke));
  const strips = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const rows = 4 + (i % 3);
    const strip = voxCloth(2, rows, 2, shroud, (c, r) => (r === rows - 1 && c === i % 2 ? null : (c + r) % 2 ? DK : DK2));
    strip.position.set(Math.sin(a) * 0.98, 0.15, Math.cos(a) * 0.98);
    strip.rotation.y = a;
    rig.add(strip);
    return strip;
  });

  const core = node(0, 0.05, 0.74, bvox([[2.6, 2.6, 2.6, 0, 0, 0, SH]], coreMat));
  const body = node(0, 1.8, 0, bvox(ellipsoid(8, 4.5, 6.4, 0, 0.8, -0.4, (i) => (i % 2 ? SH : SH2)), shroud), bvox(RING, obsidian), core);
  const head = node(0, 0.75, 0.15, bvox(HOOD, shroud), bvox(mirror([[0.9, 0.7, 0.4, 1, 0.2, 3.7, '#ffffff']]), eye));
  body.add(head);

  const arms = [-1, 1].map((s) => {
    const arm = shoulder(body, s * 0.95, 0.3, 0.05);
    arm.add(bvox(SLEEVE, shroud), bvox(TALONS, obsidian));
    return arm;
  });
  rig.add(body);
  group.add(rig);

  const shards = node(0, 0, 0);
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    const r = 1.6 + (i % 3) * 0.25;
    shards.add(rot(bvox(SHARD, obsidian, Math.cos(a) * r, 0.9 + (i % 4) * 0.7, Math.sin(a) * r), 0.3, 0, a));
  }
  group.add(shards);

  let t = 0;
  const animate = (engine, boss, dt) => {
    t += dt;
    hover(rig, shadow, 0.6, t, 0.18);
    shards.rotation.y += dt * 0.6;
    shards.children.forEach((shard, i) => {
      shard.rotation.y += dt * (1 + (i % 3) * 0.5);
    });
    strips.forEach((strip, i) => flutter(strip, t + i, -0.12, 4));
    if (boss.dead) return;
    pulse(coreMat, 2.4, 1.2, t, 3.2);
    pulse(obsidian, 0.5, 0.3, t, 3.2);
    pulse(eye, 2.8, 0.6, t, 2);
  };
  return { group, height: 3.9, parts: { body, head, core, arms, bodyMat: shroud, coreMat, animate } };
}