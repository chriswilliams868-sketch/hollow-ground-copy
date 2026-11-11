import * as THREE from 'three';
import { addSprite, weaponMats, rep } from './sprite';
import { voxGeometry, voxMesh } from '../../models/voxel';
import { tone } from '../../models/palette';

// Side profiles (columns run bottom to top), the muzzle on the first row; 'x' marks glowing muzzle and vent voxels.
const HAND_CANNON = ['fxxxxxf', '.eeeee.', '.RRRRR.', ...rep('..bbb..', 7), '.mnmmmk', '.mmmmm.', 'ggmmmm.', 'gHmmm..', 'gg.....', 'gg.....', '.g.....'];
const SNIPER = [
  '..kxxxk..', '..kkkkk..', '...xxx...', '..kkkkk..', ...rep('...bbb...', 28), '...bbbggg', ...rep('...bbbsss', 8),
  '..mmmmsss', '..mnnm...', '.wwmHm...', ...rep('wwwwmm...', 2), ...rep('wwwww....', 6), 'wwwwww...',
];
const STOCK = ['#7a4a22', '#4a2a12'];
const BRASS = '#c9a227';

const muzzleAt = (z, y = 0.02) => {
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, y, z);
  return muzzle;
};

const AXIS = 2.5; // blunderbuss barrel axis, in voxels above the fist's centre
const WOOD = '#7c4a1e';
const IRON = '#2b2b2b';
const BORE = '#0b0806';

// Square voxel tube along Z round the barrel axis: four walls about an open hole (`outer`/`inner` widths in voxels).
function tube(outer, inner, z0, z1, color) {
  const t = (outer - inner) / 2;
  const c = (outer + inner) / 4;
  const d = z1 - z0;
  const z = (z0 + z1) / 2;
  return [[outer, t, d, 0, AXIS + c, z, color], [outer, t, d, 0, AXIS - c, z, color], [t, inner, d, c, AXIS, z, color], [t, inner, d, -c, AXIS, z, color]];
}

// Blunderbuss blocks in voxels (muzzle toward +Z): a brass barrel brightening toward its hollow trumpet bell (stepped
// rings narrowing into a dark bore), barrel bands and sight bead, flintlock breech, two-tone forestock and pistol grip.
const blunderbussBody = (metal, trim) => [
  [4, 4, 6.4, 0, AXIS, 3.2, tone(metal, -0.08)],
  [4, 4, 6.3, 0, AXIS, 9.55, metal],
  [4, 4, 6.3, 0, AXIS, 15.85, tone(metal, 0.06)],
  [3, 3, 0.3, 0, AXIS, 19.15, BORE],
  ...tube(5, 3, 19, 21, trim),
  ...tube(8, 6, 23, 24.5, metal),
  [5, 7, 1, 0, AXIS - 1, 6, trim],
  [5, 5, 1, 0, AXIS, 15.5, trim],
  [1, 1, 1.5, 0, AXIS + 2.5, 17.5, tone(trim, 0.15)],
  [5, 5, 4, 0, AXIS, -1, trim],
  [1, 3, 1, 0, AXIS + 3.5, -2.5, IRON],
  [1, 1, 2, 0, AXIS + 5, -2, tone(IRON, 0.12)],
  [1, 2, 1, 0, AXIS + 3, 0.5, IRON],
  [3, 2, 14, 0, AXIS - 3, 5, WOOD],
  [3.4, 2.4, 1, 0, AXIS - 3, 12.5, metal],
  [3, 3, 3.5, 0, -0.5, -3.25, tone(WOOD, -0.04)],
  [3, 3, 3, 0, -3, -4.5, tone(WOOD, -0.08)],
  [3, 2.5, 3, 0, -5.25, -5.5, tone(WOOD, -0.12)],
  [3.6, 1.6, 3.6, 0, -7, -6, metal],
  [1, 1, 6.5, 0, -3, 0.25, trim],
  [1, 2, 1, 0, -2, 3.5, trim],
];

function addBlocks(pivot, list, material, unit) {
  pivot.add(voxMesh(voxGeometry(list, unit), material));
}

// Voxel blunderbuss (one per hand) with a hollow flared muzzle whose lip glows; rare and legendary also light the
// bell's middle ring.
export function blunderbuss(pivot, tier) {
  const [metal, trim, ring, lip, scale] = {
    common: ['#c9a227', '#8a6a1a', null, '#ff9a3c', 1],
    rare: ['#cbd5e1', '#64748b', '#60a5fa', '#60a5fa', 1.06],
    legendary: ['#fbbf24', '#b45309', '#4ade80', '#4ade80', 1.14],
  }[tier];
  const mats = weaponMats(lip, 2, 0.5);
  const unit = 0.035 * scale;
  const band = tube(6, 4, 21, 23, ring || metal);
  const glowLip = tube(6, 5, 23.6, 24.5, lip);
  addBlocks(pivot, ring ? blunderbussBody(metal, trim) : [...blunderbussBody(metal, trim), ...band], mats.base, unit);
  addBlocks(pivot, ring ? [...band, ...glowLip] : glowLip, mats.glow, unit);
  const muzzle = muzzleAt(0.92 * scale, AXIS * unit);
  pivot.add(muzzle);
  return { muzzle, glow: ring ? mats.glow : null };
}

// Stubby voxel hand cannon (one per hand): glowing muzzle lip, a barrel darkening toward the chunky receiver (with a
// brass pin) and an angled wooden grip.
export function handCannon(pivot, tier) {
  const [metal, ring, scale] = { common: ['#57534e', '#ff8a4c', 1], rare: ['#94a3b8', '#60a5fa', 1.06], legendary: ['#d4a017', '#f43f5e', 1.12] }[tier];
  const mats = weaponMats(ring, 2, 0.5);
  addSprite(pivot, HAND_CANNON, {
    f: [tone(metal, 0.08), 6], x: [ring, 4.5, 'glow'], e: [metal, 4.5], R: [ring, 5, 'glow'], b: [[tone(metal, 0.06), tone(metal, -0.1)], 3.4],
    m: ['#3f3f46', 3], n: [BRASS, 3.2], k: ['#18181b', 2], g: [STOCK, 2.4], H: ['#6b3f1d', 2.4],
  }, mats, { unit: 0.04 * scale, plane: 'edge' });
  const muzzle = muzzleAt(0.62 * scale, 0.03);
  pivot.add(muzzle);
  return { muzzle, glow: mats.glow };
}

// Two-handed voxel sniper cannon: long graded barrel, boxy muzzle brake with a glowing bore and vent, receiver with
// brass fittings, stock and a scope with a glowing lens.
export function sniperCannon(pivot, tier) {
  const [metal, lens, scale] = { common: ['#4b5563', '#a3e635', 1], rare: ['#94a3b8', '#60a5fa', 1.04], legendary: ['#d4a017', '#f43f5e', 1.08] }[tier];
  const mats = weaponMats(lens, 2.2, 0.5);
  addSprite(pivot, SNIPER, {
    k: ['#27272a', 4], x: [lens, 2.6, 'glow'], b: [[tone(metal, 0.08), tone(metal, -0.1)], 2.6], g: [lens, 2.6, 'glow'],
    s: [['#334155', '#1f2937'], 2.6], m: ['#3f3f46', 3], n: [BRASS, 3.2], w: [STOCK, 2.4], H: ['#3f3f46', 3],
  }, mats, { unit: 0.04 * scale, plane: 'edge' });
  const muzzle = muzzleAt(0.15 + 1.6 * scale);
  pivot.add(muzzle);
  return { muzzle, glow: mats.glow };
}