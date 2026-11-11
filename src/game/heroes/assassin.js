import { handPivot, startHero, finishHero, legs } from './common';
import { glowing, node, rot } from '../models/kit';
import { V, vox, voxMat, mirror, line } from '../models/voxel';
import { voxCloth } from '../models/cloth';
import { tone } from '../models/palette';

const CL = '#2e1065';
const CL2 = '#26094f';
const DK = '#1a0b33';
const LE = '#3b2414';
const LE2 = tone(LE, 0.1);
const SA = '#6d28d9';
const SA2 = tone(SA, 0.1);
const SA3 = tone(SA, -0.06);
const BU = '#9ca3af';
const SK = '#c8916c';
const strap = (t, i) => (i % 2 ? LE : LE2);
const silk = (c, r) => (r % 2 ? SA : SA3);

const TORSO = [
  [7, 8, 4.5, 0, 0, 0, CL],
  [8, 2, 5.5, 0, 4.5, 0, DK],
  [6, 1, 5, 0, 6, 0, DK],
  [7.5, 1, 5, 0, -3, 0, SA],
  [1.6, 1.6, 1, -2.7, -3, 2.6, SA2],
  // Crossed, stitched knife harness with a framed buckle at the crossing and a sheath on the right strap
  ...line([-3, 3, 2.5], [3, -2, 2.5], 1, strap),
  ...line([3, 3, 2.5], [-3, -2, 2.5], 1, strap),
  [1.5, 1.5, 0.6, 0, 0.5, 3.1, BU],
  [0.7, 0.7, 0.3, 0, 0.5, 3.5, '#4b5563'],
  [1, 2.5, 1, 2.2, 2, 3.2, LE],
  [0.6, 0.6, 0.4, 2.2, 3, 3.8, BU],
];
const HOOD = [
  [8, 7, 8, 0, 0.5, -0.5, DK],
  [8, 1.5, 1.5, 0, 3.25, 3.75, DK],
  ...mirror([[1, 6, 1.5, 3.5, 0, 3.75, DK]]),
  [6, 4.5, 0.5, 0, 0.25, 3.75, '#05020a'],
  // Skin showing round the eyes between the cowl's shadow and the face mask
  [4.6, 1, 0.3, 0, 0.6, 4.05, SK],
  [4.6, 0.3, 0.3, 0, 1.25, 4.05, tone(SK, -0.14)],
  [6, 2, 0.6, 0, -1.5, 4.1, DK],
  [5, 3, 3, 0, 2, -5.5, DK],
  [3, 2, 3, 0, 2.5, -8, DK],
  [2, 2, 2, 0, 2, -10, DK],
];
const PAULDRON = [[3, 2, 4, 0, 0, 0, LE], [3.4, 0.5, 4.4, 0, -1, 0, BU], [2.6, 0.4, 3.6, 0, 1.2, 0, LE2]];

// Lean voxel rogue in a forward-leaning stalk: deep pointed cowl over a shadowed face with skin round the eyes,
// stitched crossed knife harness, violet sash knotted at the hip with banded silk tails, wrapped limbs, a single leather
// pauldron and an off-centre tattered cloak.
export function buildAssassin() {
  const group = startHero(0.6);
  const cloth = voxMat({ roughness: 0.75, emissive: '#7c3aed', emissiveIntensity: 0.14 });
  const eyes = glowing('#c084fc', 2.8);
  const stride = legs(group, { x: 0.12, w: 2.5, mat: cloth, leg: '#160b2a', boot: LE, knee: LE, wraps: DK, toe: LE });

  const tail = voxCloth(1, 5, 1.5, cloth, silk);
  tail.position.set(-2.7 * V, -3.5 * V, 2.4 * V);
  tail.rotation.y = -0.6;
  const loin = voxCloth(2, 3, 1.5, cloth, (c, r) => (r === 2 ? CL : DK));
  loin.position.set(0, -3.8 * V, 2.7 * V);
  const body = node(0, 0.9, 0, vox(TORSO, cloth), tail, loin, rot(node(-0.27, 0.2, 0, vox(PAULDRON, cloth)), 0, 0, 0.3));
  body.rotation.x = 0.16;

  const head = node(0, 1.4, 0.07, vox(HOOD, cloth), vox(mirror([[1, 1, 0.5, 1.5, 0.75, 4.2, CL]]), eyes));
  head.rotation.x = 0.12;
  const cape = voxCloth(3, 6, 2, cloth, (c, r) => ((r === 5 && c !== 1) || (r === 4 && c === 2) ? null : (c + r) % 2 ? CL : CL2));
  cape.position.set(-0.08, 1.28, -0.24);
  cape.rotation.x = 0.3;
  const scarves = [0.04, 0.12].map((x, i) => {
    const scarf = voxCloth(1, 5 - i, 1.5, cloth, silk);
    scarf.position.set(x, 1.32, -0.22);
    scarf.rotation.set(0.35, 0.15, 0);
    group.add(scarf);
    return scarf;
  });
  group.add(body, head, cape);
  const weapon = handPivot(group, 0.42);
  const offhand = handPivot(group, -0.42);
  return finishHero(group, {
    body, head, weapon, offhand, cape, bodyMat: cloth, glowMat: eyes, eyeMat: eyes, handColor: '#1a1024', legs: stride, riders: scarves,
    flaps: [[tail, 0.06], [loin, -0.03], ...scarves.map((scarf) => [scarf, 0.12])],
  });
}