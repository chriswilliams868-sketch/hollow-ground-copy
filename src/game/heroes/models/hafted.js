import { addSprite, weaponMats, rep, sym } from './sprite';
import { tone } from '../../models/palette';

const SPEAR = [
  '..x..', '..w..', '.wcw.', '.wcw.', 'wwcww', 'xwcwx', 'wwcww', '.wcw.', '.wcw.', '..c..', '..c..', '..d..',
  '.kgk.', '.kgk.', ...rep('..s..', 6), '..b..', ...rep('..s..', 6), '..b..', ...rep('..s..', 6), '..b..', ...rep('..s..', 5), '..l..', '..l..',
  '..H..', '..l..', '..l..', ...rep('..s..', 8), '.kdk.', '..d..',
];
const AXE_HEAD = [
  's..........', 's..........', 's.........w', 'ss.......ww', 'dd......eew', 'dsm....eeew',
  'dsmmmmeeeew', 'dgmmmmeeeew', 'dsmmmmeeeew', 'dsm....eeew', 'dd......eew', 'd........ww', 'h.........w',
].map(sym);
const AXE = [
  ...AXE_HEAD, ...rep(sym('h..........'), 6),
  ...['l', 'h', 'l', 'h', 'l', 'h', 'l', 'h'].map((c) => sym(`${c}..........`)), sym('H..........'),
  ...['l', 'h', 'l'].map((c) => sym(`${c}..........`)), sym('d..........'),
];
const HAMMER = [
  '.dddddgddddd.', 'LdmmmmgmmmmdL', '.dmmmmgmmmmd.', 'LdmmmmgmmmmdL', '.dmmmmgmmmmd.', 'LdmmmmgmmmmdL', '.dddddgddddd.',
  '.....kkk.....', ...rep('......s......', 5), '......b......', ...rep('......s......', 5), '......b......', ...rep('......s......', 3),
  '......l......', '......l......', '......H......', '......l......', '......s......', '.....kkk.....',
];
const SHAFT = ['#7a4f2a', '#5a3818'];

// Voxel spear: long wooden shaft with brass bands and a leather-wrapped grip, a leaf-shaped steel head graded from
// its glowing tip, glowing edge accents round a glowing core and a glowing collar.
export function spear(pivot, tier) {
  const t = { common: ['#e7e5e4', '#ffb37a', '#ff8a4c', 1.1, 1], rare: ['#e0ecff', '#93c5fd', '#3b82f6', 1.5, 1.06], legendary: ['#fff7ed', '#fde047', '#f59e0b', 2.2, 1.12] }[tier];
  const mats = weaponMats(t[2], t[3]);
  addSprite(pivot, SPEAR, {
    w: [[t[0], tone(t[0], -0.22)]], x: [t[1], 1, 'glow'], c: [t[1], 1, 'glow'], g: [t[1], 1.6, 'glow'], d: ['#3f3f46', 1.4], k: ['#52525b', 1.6],
    s: [SHAFT, 1.2], b: ['#c9a227', 1.5], l: ['#3b2414', 1.5], H: ['#4a2f1b', 1.4],
  }, mats, { unit: 0.05 * t[4] });
  return { glow: mats.glow };
}

// Voxel double-bit battle axe, head stood upright in line with the haft: crescent blades graded down from their
// crowns with glowing cutting edges, a two-tone socket with a gem, spiked top and wrapped haft.
export function battleAxe(pivot, tier) {
  const t = { common: ['#cbd5e1', '#ffe3a3', '#ffcf6b', 1.2, 1], rare: ['#e2e8f0', '#93c5fd', '#60a5fa', 1.6, 1.08], legendary: ['#fde68a', '#fda4af', '#f43f5e', 2.4, 1.16] }[tier];
  const mats = weaponMats(t[2], t[3]);
  addSprite(pivot, AXE, {
    w: [t[1], 1, 'glow'], g: [t[1], 2, 'glow'], e: [[tone(t[0], 0.08), tone(t[0], -0.16)]], m: [['#7c8aa0', '#475569'], 1.4], d: ['#334155', 2],
    s: [['#cbd5e1', '#64748b'], 1.4], h: ['#5b3a1e', 1.4], H: ['#3b2414', 1.6], l: ['#3b2414', 1.6],
  }, mats, { unit: 0.05 * t[4], plane: 'edge' });
  return { glow: mats.glow };
}

// Voxel war hammer seen in profile: a heavy block head graded down its faces and split by a glowing band, a banded
// haft with a leather grip; legendary studs the striking faces.
export function warHammer(pivot, tier) {
  const t = { common: ['#7d8492', '#5b616e', '#ffcf6b', 1.3, 1], rare: ['#94a3b8', '#64748b', '#60a5fa', 1.6, 1.1], legendary: ['#d4a017', '#b8860b', '#fbbf24', 2.4, 1.2] }[tier];
  const mats = weaponMats(t[2], t[3], 0.45);
  addSprite(pivot, HAMMER, {
    m: [[tone(t[0], 0.08), tone(t[0], -0.1)], 6], d: [t[1], 6], g: [t[2], 7, 'glow'], k: ['#262a33', 3], s: ['#3a3f4b', 2], b: ['#8d96a3', 2.4],
    l: ['#3b2414', 2.4], H: ['#3b2414', 2.4], L: tier === 'legendary' ? [t[2], 2, 'glow'] : null,
  }, mats, { unit: 0.05 * t[4], plane: 'edge' });
  return { glow: mats.glow };
}