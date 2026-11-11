import { handPivot, startHero, finishHero, legs, fist } from './common';
import { glowing, node, rot } from '../models/kit';
import { V, vox, voxMat, mirror, line } from '../models/voxel';
import { voxCloth } from '../models/cloth';
import { tone } from '../models/palette';

const ST = '#c3cad4';
const DS = '#5b6370';
const PO = '#e6ebf1';
const LE = '#5b3a1e';
const LE2 = tone(LE, 0.1);
const CR = '#9f1239';
const CR2 = '#86102f';
const BR = '#c9a227';
const BR2 = tone(BR, -0.16);
const GA = '#8d96a3';

// Chainmail skirt as a checker of one-voxel columns
const MAIL = Array.from({ length: 30 }, (_, i) => {
  const c = i % 10;
  const r = Math.floor(i / 10);
  return [1, 1, 7, c - 4.5, -5.5 - r, 0, (c + r) % 2 ? '#4b5260' : '#5d6573'];
});
const CHEST = [
  [9, 2, 6, 0, -3, 0, DS],
  [10, 1, 7, 0, -4.5, 0, LE],
  [10, 6, 6.5, 0, 1, 0, ST],
  [10.2, 0.5, 6.8, 0, -1.25, 0, DS],
  [9.4, 0.5, 6.7, 0, 3.75, 0, PO],
  [9, 1, 6, 0, 4.5, 0, ST],
  [5, 1, 5, 0, 5.5, 0, ST],
  [6, 3, 0.5, 0, 2, 3.4, PO],
  [2, 1.5, 1, 0, -4.5, 3.75, BR],
  [1, 0.7, 0.3, 0, -4.5, 4.35, BR2],
  ...mirror([[0.7, 0.7, 0.4, 3.6, -4.5, 3.6, BR]]),
  [2, 2, 1.5, 4.5, -5.5, 2.2, LE],
  [1.5, 1.5, 1.2, -4.3, -5.5, 2.4, LE],
  ...line([-4, -3.5, 3.4], [3.5, 4, 3.4], 1, (t, i) => (i % 2 ? LE : LE2)),
  [1.2, 1.2, 1.2, 0, 0.5, 3.9, BR],
  ...MAIL,
];
const HELM = [
  [7, 6, 7, 0, 0.5, 0, ST],
  [5, 1, 5, 0, 4, 0, ST],
  [7, 3, 1, 0, 0, 3.5, DS],
  [1, 4, 1, 0, -0.5, 4.25, ST],
  [6, 2, 6, 0, -3.5, 0.5, ST],
  [7.2, 0.5, 7.2, 0, 2.25, 0, BR],
  ...mirror([[0.5, 0.5, 0.3, 1.6, -3.4, 3.6, DS], [0.5, 0.5, 0.3, 2.4, -3.4, 3.6, DS]]),
  [1.5, 2, 2, 0, 4.5, -0.5, CR],
  [1.5, 2, 2, 0, 5.5, -2, CR],
  [1.5, 2, 2, 0, 5.5, -3.5, CR2],
  [1.5, 1.5, 2, 0, 4.75, -5, tone(CR, 0.08)],
  [1.5, 1.5, 1.5, 0, 3.5, -6, tone(CR, 0.16)],
];
const PAULDRON = [
  [5, 2, 6, 0, 0.5, 0, ST],
  [5.2, 0.4, 6.2, 0, 1.5, 0, PO],
  [6, 1, 7, 0, -1, 0, CR],
  ...mirror([[0.6, 0.6, 0.4, 1.8, -1, 3.6, BR]]),
  [5, 1, 6, 0, -2, 0, DS],
  [4, 1, 5, 0, 2, 0, ST],
];
const crimson = (c, r) => ((c + r) % 2 ? CR : CR2);

// Steel voxel knight: polished breastplate with a dark lame seam over a checkered chainmail skirt, a leather belt
// with a framed brass buckle and rivets, pouches and a stitched baldric, crimson tabard, polished and riveted pauldrons,
// a brass-banded plumed visor sallet and a long trailing red cape. The free fist floats at the hip.
export function buildVanguard() {
  const group = startHero(0.7);
  const steel = voxMat({ roughness: 0.35, metalness: 0.35, emissive: '#ff4d1c', emissiveIntensity: 0.06 });
  const cloth = voxMat({ roughness: 0.8 });
  const visor = glowing('#ff9a5a', 2.2);
  const stride = legs(group, { x: 0.15, w: 3, mat: steel, leg: DS, boot: LE, knee: ST, cuff: LE });

  const tabard = voxCloth(2, 4, 2, cloth, (c, r) => (r === 3 ? BR : crimson(c, r)));
  tabard.position.set(0, -5 * V, 4.2 * V);
  const back = voxCloth(2, 4, 2, cloth, (c, r) => (r === 3 ? BR : crimson(c, r)));
  back.position.set(0, -5 * V, -4.2 * V);
  back.rotation.y = Math.PI;
  const freeHand = node(-0.47, -0.12, 0.1);
  fist(freeHand, GA);
  const body = node(0, 0.98, 0, vox(CHEST, steel), tabard, back, freeHand);
  [-1, 1].forEach((s) => body.add(rot(node(s * 0.37, 0.2, 0, vox(PAULDRON, steel)), 0, 0, -s * 0.2)));

  const head = node(0, 1.5, 0, vox(HELM, steel), vox(mirror([[2, 1, 0.6, 1.75, 0.5, 4.1, ST]]), visor));
  const cape = voxCloth(5, 9, 2, cloth, (c, r) => (r === 8 ? BR : r === 0 ? CR2 : crimson(c, r)));
  cape.position.set(0, 1.3, -0.27);
  cape.rotation.x = 0.16;
  group.add(body, head, cape);
  const weapon = handPivot(group, 0.47);
  return finishHero(group, {
    body, head, weapon, cape, bodyMat: steel, glowMat: visor, eyeMat: visor, handColor: GA, legs: stride,
    capeFlutter: 0.1,
    flaps: [[tabard, -0.03], [back, -0.03]],
  });
}