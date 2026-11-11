import { mirror, line, spike } from '../voxel';

// Hollow King voxel armour block lists (1 voxel = 6.25 cm before the boss scale).
export const IR = '#2b2d36';
export const IR2 = '#353844';
export const DK = '#17181f';
export const TR = '#6b5a3a';

export const THIGH = [[4.6, 8, 4.6, 0, -4, 0, DK], [5.2, 2, 5.2, 0, -1, 0, IR]];
export const SHIN = [
  [4.4, 3.6, 2, 0, 0, 1.6, IR], [1.4, 1.4, 2, 0, 0, 3.2, TR], [4.2, 8, 4.2, 0, -4.4, 0, IR2],
  [4.4, 1, 4.4, 0, -7.6, 0, TR], [4.4, 2, 6.6, 0, -9.4, 1, IR], [3, 1.4, 2, 0, -9.7, 5, DK],
];
export const TASSET = [[4.5, 5, 1, 0, 0, 0, IR], [4.5, 1, 1.2, 0, -2.6, 0, TR]];

// Belted waist widening in plate layers to a broad chest, gold trim and gorget
export const TORSO = [
  [9.6, 1.6, 8, 0, 0.8, 0, DK],
  [10.4, 1.6, 8.6, 0, 2.4, 0, DK],
  [2.4, 1.8, 1, 0, 2.4, 4.6, TR],
  ...Array.from({ length: 6 }, (_, i) => [11 + i, 1.6, (11 + i) * 0.72, 0, 4 + i * 1.6, 0, i % 2 ? IR : IR2]),
  [16.6, 0.8, 12.4, 0, 12.8, 0, TR],
  [8, 2.2, 8, 0, 14, 0, DK],
];
export const EMBLEM = [[3, 1, 1, 0, 10.4, 5.6, '#ffffff'], [2, 1, 1, 0, 9.4, 5.4, '#ffffff'], [1, 1, 1, 0, 8.4, 5.2, '#ffffff']];

export const pauldron = (s) => [
  [8.8, 1, 9.6, 0, -0.4, 0, DK],
  [8, 2, 8.8, 0, 1, 0, IR],
  [6.4, 1.6, 7.2, 0, 2.8, 0, IR2],
  [4.4, 1.2, 5, 0, 4.2, 0, IR],
  [8, 1, 8.8, 0, -1.6, 0, IR],
  ...[-2, 0.8, 3.2].flatMap((z, i) => spike([s * 1.6, 4, z], [s * 3.4, 9 - i, z], 1.4, DK, 0.4)),
];

export const HELM = [[6.4, 5.4, 6.4, 0, 0, 0, DK], [5.2, 4.2, 1, 0, -0.2, 3.4, IR], [0.6, 1.8, 0.4, 0, -1.2, 4.05, '#050208'], [6.8, 1, 6.8, 0, -2.6, 0, IR]];
export const VISOR = mirror([[1.6, 0.5, 0.4, 1.1, 0.6, 4.05, '#ffffff']]);

// Gold band with seven spikes round the front and two great swept-back iron horns
export const CROWN = [
  [7.6, 1.3, 7.6, 0, 0, 0, TR],
  ...Array.from({ length: 7 }, (_, i) => {
    const a = (i - 3) * 0.55;
    const x = Math.sin(a) * 3.5;
    const z = Math.cos(a) * 3.5;
    return spike([x, 0.6, z], [x * 1.15, i === 3 ? 4.6 : 3.6 - Math.abs(i - 3) * 0.3, z * 1.15], 1, TR, 0.4);
  }).flat(),
  ...mirror([...spike([3.4, 0, -0.3], [6.4, 2.6, -0.6], 1.8, DK, 1.2), ...spike([6.4, 2.6, -0.6], [7.4, 7, -1.2], 1.2, DK, 0.4)]),
];

// Both arms reaching from the shoulders to the sword grip (rig frame, shoulder line at the origin)
export const ARMS = [-1, 1].flatMap((s) => {
  const elbow = [s * 6.7, -7.2, 3.5];
  const hand = [s * 0.8, -9.6 - s * 0.96, 9.9 + s * 1.6];
  return [...line([s * 8.8, 0, 0], elbow, 2.6, DK), [3.4, 3.4, 3.4, ...elbow, IR], ...line(elbow, hand, 2.4, IR2), [2.8, 2.8, 3, ...hand, IR]];
});