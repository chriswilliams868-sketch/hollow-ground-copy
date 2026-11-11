import { handPivot, startHero, finishHero, legs } from './common';
import { glowing, node, rot } from '../models/kit';
import { V, vox, voxMat, mirror } from '../models/voxel';
import { voxCloth } from '../models/cloth';
import { tone } from '../models/palette';

const DI = '#3a3f4b';
const IR = '#262a33';
const SI = '#dde3ea';
const LE = '#3b2414';
const LE2 = tone(LE, 0.1);
const IV = '#e8e1cf';
const BL = '#1e3a8a';
const BL2 = '#1a3378';
const GO = '#e8c35a';

const CHEST = [
  [10, 2, 7, 0, -4, 0, IR],
  [11, 1, 8, 0, -2.5, 0, LE],
  ...mirror([[0.8, 1.2, 0.3, 4, -2.5, 4.1, LE2]]),
  [12, 4, 8, 0, 0, 0, DI],
  [13.2, 0.5, 8.7, 0, 2, 0, SI],
  [13, 3, 8.5, 0, 3.5, 0, DI],
  [9, 1, 7, 0, 5.5, 0, SI],
  [7, 1, 6, 0, 6.5, 0, SI],
  [6, 5, 1, 0, 1.5, 4.5, SI],
  // Plate tassets around the hips with gold studs, the front centre left to the tabard
  ...mirror([
    [4, 4, 1, 3, -7, 4.5, IR], [1, 4, 6, 6, -7, 0, DI], [4, 4, 1, 3, -7, -4.5, IR],
    [0.6, 0.6, 0.4, 2, -5.6, 5.1, GO], [0.6, 0.6, 0.4, 4, -5.6, 5.1, GO],
  ]),
];
const EMBLEM = [[1, 5, 1, 0, 1.5, 5.5, GO], [5, 1, 1, 0, 2, 5.5, GO], [2, 2, 1, 0, -2.5, 4.5, GO]];
const HELM = [
  [8, 7, 8, 0, -0.5, 0, DI],
  [8.4, 0.6, 8.4, 0, -3.7, 0, SI],
  [7, 1, 7, 0, 3.5, 0, DI],
  [1, 1, 8, 0, 4.5, 0, SI],
  [6, 5, 1, 0, -1, 4.5, IR],
  [6, 1, 1, 0, 2, 4.8, SI],
  [1, 4, 1, 0, -2, 5.25, SI],
  // Horns weathering from ivory roots to darker tips
  ...mirror([
    [2, 2, 2, 5, 1, 0, IV], [2, 2, 2, 7, 2, 0, IV], [2, 2, 2, 8, 3.5, 0.5, tone(IV, -0.05)],
    [1.5, 2, 1.5, 8.5, 5.5, 1, tone(IV, -0.12)], [1, 1.5, 1, 8.5, 7.25, 1.5, tone(IV, -0.22)],
  ]),
];
const pauldron = (s) => [
  [6, 2, 8, 0, 1, 0, SI],
  [7, 1, 9, 0, -0.5, 0, DI],
  [6, 1, 8, 0, -1.5, 0, SI],
  [5, 1, 7, 0, -2.5, 0, DI],
  [1, 3, 6, -s * 2.5, 3.5, 0, SI],
];
const cross = (c, r) => ((c === 2 || c === 3) && r >= 1 && r <= 4) || (r === 2 && c >= 1 && c <= 4);

// Heavy voxel knight: barrel-chested dark-iron plate with a silver seam trim, layered silver pauldrons with upright
// neck guards, gold-studded plate tassets, a looped leather belt, gold sun emblem and a silver-rimmed horned great helm
// with cyan eye slits; the tower shield rides the off-hand arm.
export function buildPaladin() {
  const group = startHero(0.9);
  const plate = voxMat({ roughness: 0.42, metalness: 0.3, emissive: '#ffb84d', emissiveIntensity: 0.04 });
  const cloth = voxMat({ roughness: 0.95 });
  const gold = glowing('#ffcf6b', 1.1);
  const eyes = glowing('#5ee7ff', 2.8);
  const stride = legs(group, { x: 0.2, w: 4, mat: plate, leg: IR, boot: DI, knee: SI, thigh: DI, toe: DI, cuff: SI });

  const tabard = voxCloth(3, 5, 2, cloth, (c, r) => (r === 4 ? GO : c === 1 ? '#c9a227' : BL));
  tabard.position.set(0, -3 * V, 5.2 * V);
  const back = voxCloth(3, 4, 2, cloth, (c, r) => (r === 3 ? GO : BL2));
  back.position.set(0, -3 * V, -5.2 * V);
  back.rotation.y = Math.PI;
  const body = node(0, 1.0, 0, vox(CHEST, plate), vox(EMBLEM, gold), tabard, back);
  [-1, 1].forEach((s) => {
    body.add(rot(node(s * 0.5, 0.3, 0, vox(pauldron(s), plate), vox([[0.6, 1, 8.2, s * 3.2, 1, 0, GO]], gold)), 0, 0, -s * 0.28));
  });

  const head = node(0, 1.64, 0, vox(HELM, plate), vox([[9, 1, 9, 0, 2.5, 0, GO]], gold), vox(mirror([[2, 1, 1, 2, 0.5, 5, GO]]), eyes));
  const cape = voxCloth(6, 8, 2, cloth, (c, r) => (r === 7 ? '#c9a227' : cross(c, r) ? GO : (c + r) % 2 ? BL : BL2));
  cape.position.set(0, 1.38, -0.4);
  cape.rotation.x = 0.12;
  group.add(body, head, cape);
  const weapon = handPivot(group, 0.56);
  const offhand = handPivot(group, -0.56);
  return finishHero(group, {
    body, head, weapon, offhand, cape, bodyMat: plate, glowMat: gold, eyeMat: eyes, handColor: DI, legs: stride,
    flaps: [[tabard, -0.03], [back, -0.03]],
  });
}