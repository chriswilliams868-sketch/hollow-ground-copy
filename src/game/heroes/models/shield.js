import { addSprite, weaponMats } from './sprite';
import { tone } from '../../models/palette';

const SHIELD = [
  '.rrrrrrrrr.', 'rvfffffffvr', 'rffffgffffr', 'rfpppgpppfr', 'rfpRRgRRpfr', 'rfgggggggfr', 'rfpRRgRRpfr', 'rfpppgpppfr',
  'rfpppgpppfr', 'rfpppgpppfr', 'rfpppgpppfr', 'rffffgffffr', 'rvfffffffvr', '.rfffffffr.', '..rrrrrrr..',
];

// Voxel tower shield facing +Z: metal rim with raised corner rivets, a steel face and raised inner plate both graded
// down from the top, and a glowing cross emblem (rare and legendary ring the crossing).
export function towerShield(pivot, tier) {
  const [face, emblem, intensity, scale, trim] = {
    common: ['#3a3f4b', '#ffcf6b', 1.3, 1, '#c0c7d1'],
    rare: ['#64748b', '#60a5fa', 1.6, 1.06, '#e2e8f0'],
    legendary: ['#7c5a12', '#fbbf24', 2.4, 1.12, '#d4a017'],
  }[tier];
  const mats = weaponMats(emblem, intensity, 0.45);
  const plate = [['#596072', '#3f4552'], 2, 'base', 0.4];
  addSprite(pivot, SHIELD, {
    r: [trim, 3], v: [tone(trim, 0.12), 3.6], f: [[tone(face, 0.06), tone(face, -0.1)], 2], p: plate, g: [emblem, 1, 'glow', 1.5],
    R: tier === 'common' ? plate : [emblem, 1, 'glow', 1.5],
  }, mats, { unit: 0.06 * scale, plane: 'face', grip: 7, z: 0.11 });
  return {};
}