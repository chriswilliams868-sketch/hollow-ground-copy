import { handPivot, startHero, finishHero, legs } from './common';
import { glowing, node, rot } from '../models/kit';
import { vox, voxMat, mirror, line } from '../models/voxel';
import { voxCloth } from '../models/cloth';
import { tone } from '../models/palette';

const CO = '#14532d';
const CO2 = '#166534';
const CD = '#0f2a1a';
const PIPE = tone(CO2, 0.12);
const LE = '#6b3f1d';
const LE2 = tone(LE, 0.1);
const HA = '#2b1d12';
const BR = '#c9a227';
const FE = '#b91c1c';
const SK = '#c99a74';
const SK2 = tone(SK, -0.1);
const HAIR = '#3b2a1e';

const COAT = [
  [9, 9, 6, 0, 0, 0, CO],
  [9, 2, 7, 0, 5, 0, CD],
  [3, 2, 0.4, 0, 3, 3.1, '#e8dcc4'],
  ...mirror([[1, 1, 0.5, 2.5, 3.5, 3.25, CD], [1, 1, 0.5, 1.5, 2.5, 3.25, CD], [1, 1, 0.5, 0.5, 1.5, 3.25, CD]]),
  [0.7, 0.7, 0.4, -2.2, 1, 3.2, BR],
  [0.7, 0.7, 0.4, -2.2, -1, 3.2, BR],
  [10, 1, 7, 0, -4, 0, LE],
  [2, 1, 0.5, 0, -4, 3.75, BR],
  [0.6, 0.6, 0.3, 0, -4, 4.1, LE],
  // Stitched bandolier strung with brass shells
  ...line([-3.5, 3.5, 3.4], [3.5, -3.5, 3.4], 1, (t, i) => (i % 2 ? LE : LE2)),
  ...[-2, -0.5, 1, 2.5].map((x) => [1, 1.4, 1, x, -x, 3.9, BR]),
  // Epaulettes, shoulders, the coat front / side panels below the belt and their piped hems
  ...mirror([
    [2, 1, 6, 4, 4.5, 0, LE], [1, 1, 1, 4, 5, 2.5, BR], [3, 3, 3, 4.8, 3.2, 0, CO], [4, 5, 1, 3, -7, 3.5, CD], [1, 5, 7, 5, -7, 0, CD],
    [4, 0.6, 1.2, 3, -9.2, 3.5, PIPE], [1.2, 0.6, 7.2, 5, -9.2, 0, PIPE],
  ]),
];
const HEAD = [
  [6, 6, 6, 0, 0, 0, SK],
  [1, 1.4, 0.7, 0, -0.5, 3.35, SK2],
  ...mirror([[0.8, 1.6, 1.2, 3.3, 0, 0.5, SK2], [0.6, 2, 1, 3.05, -0.5, 2, HAIR]]),
  [6, 2, 1, 0, -2, 3.25, '#7a4e2d'],
  [6, 3, 1, 0, 0.5, -3.25, HAIR],
  [3, 3, 0.5, 1.5, 0.5, 3.05, BR],
];
const HAT = [
  [13, 1, 13, 0, 3.5, 0, HA],
  [7, 3, 7, 0, 5.5, 0, HA],
  [5, 1, 5, 0, 7.5, 0, tone(HA, 0.05)],
  [7.4, 1, 7.4, 0, 4.5, 0, CD],
  [1.5, 1, 0.5, 0, 4.5, 3.8, BR],
  [1, 2, 1, 3.9, 5.5, -1, FE],
  [1, 2, 1, 4.4, 7, -1.5, tone(FE, 0.08)],
  [1, 1.5, 1, 4.9, 8.5, -2, tone(FE, 0.18)],
];

// Logan, the voxel gunslinger: long green duster with dark lapels, brass buttons, piped coat tails, a stitched
// brass-shelled bandolier and leather epaulettes; a weathered face with ears, nose and sideburns under a wide-brimmed
// hat with a graded feather, a glowing eye and a glowing monocle lens.
export function buildSharpshooter() {
  const group = startHero(0.68);
  const coat = voxMat({ roughness: 0.8, emissive: '#22c55e', emissiveIntensity: 0.05 });
  const lens = glowing('#a3e635', 2);
  const stride = legs(group, { x: 0.14, w: 3, mat: coat, leg: '#1f2937', boot: LE, cuff: LE2 });

  const body = node(0, 0.95, 0, vox(COAT, coat));
  const head = node(0, 1.48, 0,
    vox(HEAD, coat),
    rot(node(0, 0, 0, vox(HAT, coat)), 0.08),
    vox([[1, 1, 0.5, -1.5, 0.5, 3.3, CO], [2, 2, 0.5, 1.5, 0.5, 3.35, CO]], lens)
  );
  const cape = voxCloth(5, 5, 2, coat, (c, r) => (r === 4 ? CD : (c + r) % 2 ? CO : CO2));
  cape.position.set(0, 0.72, -0.21);
  cape.rotation.x = 0.15;
  group.add(body, head, cape);
  const weapon = handPivot(group, 0.44);
  const offhand = handPivot(group, -0.44);
  return finishHero(group, {
    body, head, weapon, offhand, cape, bodyMat: coat, glowMat: lens, eyeMat: lens, handColor: LE, legs: stride,
  });
}