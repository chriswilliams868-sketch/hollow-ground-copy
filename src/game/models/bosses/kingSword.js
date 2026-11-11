import { glowing, gem, node } from '../kit';
import { vox, voxMat, mirror, spike } from '../voxel';

const STEEL = '#141018';
const BLADE = [
  [4.5, 0.8, 35.2, 0, 0, 23.2, STEEL],
  [3.4, 0.8, 2, 0, 0, 41.8, STEEL],
  [2.2, 0.8, 2, 0, 0, 43.8, '#1a1420'],
  [1, 0.8, 1.6, 0, 0, 45.6, STEEL],
];
const HILT = [
  [1.4, 1.4, 8, 0, 0, 0, '#2a1a14'],
  ...[-2.4, 0, 2.4].map((z) => [1.8, 1.8, 0.6, 0, 0, z, '#3a2a20']),
  [12, 1.6, 1.6, 0, 0, 4.8, '#17181f'],
  [3, 2.2, 2.2, 0, 0, 4.8, '#23242d'],
  ...mirror(spike([6, 0, 4.8], [7.8, 0, 7.6], 1.4, '#17181f', 0.5)),
];

// Colossal two-handed voxel Void Greatsword built along +Z from the grip; tip/mid markers drive the fire trails.
export function buildKingSword() {
  const fuller = glowing('#a855f7', 1.8);
  const group = node(0, 0, 0,
    vox(BLADE, voxMat({ roughness: 0.2, metalness: 0.8, emissive: '#2a0a3a', emissiveIntensity: 0.6 })),
    vox(HILT, voxMat({ roughness: 0.45, metalness: 0.6 })),
    vox([[2.2, 2.2, 2.2, 0, 0, -5, '#ff2d55']], gem('#ff2d55', 2)),
    vox([[1.1, 1.1, 31.2, 0, 0, 22.4, '#a855f7'], [1.4, 2.6, 1.4, 0, 0, 4.8, '#a855f7']], fuller)
  );
  const tip = node(0, 0, 2.9);
  const mid = node(0, 0, 1.6);
  group.add(tip, mid);
  return { group, tip, mid, fuller };
}