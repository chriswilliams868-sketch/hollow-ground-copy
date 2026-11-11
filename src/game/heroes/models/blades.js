import { addSprite, weaponMats, rep } from './sprite';
import { tone } from '../../models/palette';

// `n` blade rows where every `every`-th turns its `edge` voxels into glowing edge runes ('x').
const runed = (row, n, every, edge = 'e') => Array.from({ length: n }, (_, i) => (i % every === 1 ? row.replaceAll(edge, 'x') : row));
const GRIP = '#3b2416';

const LONGSWORD = [
  '....x....', '...wcw...', ...runed('...wcw...', 20, 4, 'w'),
  '..wwcww..', 'LkkkgkkkL', '.K.....K.', '....h....', '....H....', '....j....', '...kgk...', '....k....',
];
const CLAYMORE = [
  '.....x.....', '....ewe....', '...ewcwe...', ...runed('...ewcwe...', 27, 5), '..eewcwee..',
  'kkkkkgkkkkk', '.K...h...K.', '.....h.....', '.....h.....', '.....H.....', '.....j.....', '.....h.....', '.....j.....', '.....h.....', '....kgk....', '.....k.....',
];
const GREATSWORD = [
  '......x......', '.....ewe.....', ...rep('....ewwwe....', 7), ...runed('....ewcwe....', 26, 5), '...eewcwee...',
  'LkkkkkgkkkkkL', '..K...h...K..', '......h......', '......h......', '......H......', '......j......', '......h......', '......j......', '......h......', '.....kgk.....', '......k......',
];
const KATANA = ['w....', ...rep('wc...', 4), ...rep('.wc..', 7), ...rep('..wc.', 8), '..gg.', 'gkkkg', '..r..', '..h..', '..H..', '..r..', '..h..', '..r..', '..k..'];
const KNIFE = ['..c..', '.ccc.', 'ccdcc', 'ccdcc', 'ccdcc', '.ccc.', '.cdc.', '..c..', '.kkk.', '..h..', '..w..', '..H..', '..w..', '.kkk.', '.k.k.', '.kkk.'];

// Long voxel blade, stood upright on edge in the grip: steel edges graded from a bright tip to the guard with glowing
// edge runes along them, a glowing core and tip, crossguard with a centre gem and a wrapped grip; legendary flares the guard.
export function longsword(pivot, tier) {
  const t = {
    common: ['#f2e3cf', '#ffb37a', '#ff8a4c', 1.1, '#3a2540', 1],
    rare: ['#e0ecff', '#93c5fd', '#3b82f6', 1.5, '#94a3b8', 1.12],
    legendary: ['#fff7ed', '#fdba74', '#f97316', 2.2, '#d4a017', 1.24],
  }[tier];
  const mats = weaponMats(t[2], t[3]);
  addSprite(pivot, LONGSWORD, {
    w: [[t[0], tone(t[0], -0.2)]], x: [t[1], 1, 'glow'], c: [t[1], 1, 'glow'], g: [t[1], 2, 'glow'], k: [t[4], 2], K: [tone(t[4], -0.12), 2],
    h: [GRIP, 1.4], H: [GRIP, 1.4], j: [tone(GRIP, 0.12), 1.6], L: tier === 'legendary' ? [t[4], 2] : null,
  }, mats, { unit: 0.05 * t[5], plane: 'edge' });
  return { glow: mats.glow };
}

// Two-handed voxel claymore: broad stepped blade (dark outer edge, bright bevel, glowing fuller and edge runes)
// graded toward the guard, a wide crossguard and a wrapped grip.
export function claymore(pivot, tier) {
  const t = {
    common: ['#9ca3af', '#f1f5f9', '#ffb37a', '#ff8a4c', 1.1, '#3f3f46', 1],
    rare: ['#94a3b8', '#e0f2fe', '#7dd3fc', '#0ea5e9', 1.5, '#64748b', 1.08],
    legendary: ['#b45309', '#fff7ed', '#fca5a5', '#ef4444', 2.2, '#d4a017', 1.16],
  }[tier];
  const mats = weaponMats(t[3], t[4]);
  addSprite(pivot, CLAYMORE, {
    e: [[tone(t[0], 0.08), tone(t[0], -0.14)]], w: [[t[1], tone(t[1], -0.16)]], x: [t[2], 1, 'glow'], c: [t[2], 1, 'glow'], g: [t[2], 2, 'glow'],
    k: [t[5], 2], K: [tone(t[5], -0.12), 2], h: ['#2a1a10', 1.4], H: ['#2a1a10', 1.4], j: [tone('#2a1a10', 0.12), 1.6],
  }, mats, { unit: 0.05 * t[6] });
  return { glow: mats.glow };
}

// Paladin greatsword: wide silver blade graded from a bright tip, a long glowing fuller and edge runes, gilded winged
// guard, wrapped grip and gem pommel.
export function greatsword(pivot, tier) {
  const t = {
    common: ['#cbd5e1', '#f8fafc', '#ffe3a3', '#ffcf6b', 1.2, '#c9a227', 1],
    rare: ['#94a3b8', '#e0f2fe', '#93c5fd', '#60a5fa', 1.6, '#e2e8f0', 1.06],
    legendary: ['#fde68a', '#fffbeb', '#fde047', '#fbbf24', 2.4, '#d4a017', 1.12],
  }[tier];
  const mats = weaponMats(t[3], t[4]);
  addSprite(pivot, GREATSWORD, {
    e: [[tone(t[0], 0.08), tone(t[0], -0.14)]], w: [[t[1], tone(t[1], -0.16)]], x: [t[2], 1, 'glow'], c: [t[2], 1, 'glow'], g: [t[2], 2, 'glow'],
    k: [t[5], 2], K: [tone(t[5], -0.12), 2], h: ['#3b2414', 1.4], H: ['#3b2414', 1.4], j: [tone('#3b2414', 0.12), 1.6],
    L: tier === 'legendary' ? [t[5], 2] : null,
  }, mats, { unit: 0.05 * t[6] });
  return { glow: mats.glow };
}

// Curved voxel katana seen in profile: a glowing cutting edge over a polished steel back graded toward the hilt, gold
// collar, gold-tipped square tsuba and a wrapped grip.
export function katana(pivot, tier) {
  const t = { common: ['#f5e1ff', '#c4b5fd', '#c084fc', 1.2, 1], rare: ['#e0fbff', '#a5f3fc', '#67e8f9', 1.5, 1.06], legendary: ['#ffe4e6', '#fda4af', '#f43f5e', 2.2, 1.12] }[tier];
  const mats = weaponMats(t[2], t[3]);
  addSprite(pivot, KATANA, {
    w: [t[0], 1, 'glow'], c: [[tone(t[1], 0.06), tone(t[1], -0.3)]], g: ['#d4a017', 1.4], k: ['#1f1726', 3], r: ['#7f1d1d', 1.4], h: ['#160b2a', 1.4], H: ['#160b2a', 1.4],
  }, mats, { unit: 0.045 * t[4], plane: 'edge' });
  return { glow: mats.glow };
}

// Voxel dagger (one per hand), blade stood upright in the grip: glowing edges round a dark core that brightens toward
// the tip; the legendary blade grows a hook near its tip.
export function dagger(pivot, tier) {
  const [edge, intensity, length] = { common: ['#c084fc', 1.8, 0.5], rare: ['#67e8f9', 2, 0.56], legendary: ['#f43f5e', 2.6, 0.64] }[tier];
  const n = Math.round(length / 0.04);
  const blade = ['..c..', ...rep('.cdc.', n - 1)];
  if (tier === 'legendary') blade.splice(2, 2, '.cdcc', '.cdcc');
  const mats = weaponMats(edge, intensity);
  addSprite(pivot, [...blade, 'kkkkk', '..h..', '..H..', '..j..', '.kgk.'], {
    c: [edge, 1, 'glow'], g: [edge, 1.5, 'glow'], d: [['#4c2a73', '#1f1030'], 1], k: ['#160b2a', 2], h: ['#2b1b3f', 1.4], H: ['#2b1b3f', 1.4],
    j: [tone('#2b1b3f', 0.12), 1.6],
  }, mats, { unit: 0.04, plane: 'edge' });
  return { glow: mats.glow };
}

// Voxel kunai, blade stood upright in the grip: glowing diamond blade round a graded dark core, banded grip and a
// polished ring pommel.
export function throwingKnife(pivot, tier) {
  const [edge, intensity, scale] = { common: ['#c084fc', 1.8, 1], rare: ['#67e8f9', 2.1, 1.08], legendary: ['#f43f5e', 2.6, 1.16] }[tier];
  const mats = weaponMats(edge, intensity);
  addSprite(pivot, KNIFE, {
    c: [edge, 1, 'glow'], d: [['#4c2a73', '#1f1030'], 1.2], k: [['#d1d5db', '#6b7280'], 1.2], h: ['#160b2a', 1.4], H: ['#160b2a', 1.4], w: ['#6d28d9', 1.4],
  }, mats, { unit: 0.035 * scale, plane: 'edge' });
  return { glow: mats.glow };
}