import { glowing, node, rot } from '../kit';
import { vox, voxMat, line, spike, ellipsoid } from '../voxel';
import { creature, clock, finish } from './rig';
import { scuttle } from './gaits';

const CH = '#b7791f';
const CH2 = '#a16207';
const DK = '#422006';
const plates = (i) => (i % 2 ? CH : CH2);

const SHELL = [
  ...ellipsoid(8.4, 4, 5.6, 0, 0, 6, plates),
  ...ellipsoid(7.4, 3.6, 4.9, 0, 0.3, 0, DK),
  ...ellipsoid(6.7, 3.3, 4.5, 0, 0.6, -6, plates),
  [2, 1, 16, 0, 4, 0, CH2],
];
const EYES = [[-1.3, 1.3], [1.3, 1.3], [-2.4, 0.8], [2.4, 0.8]].map(([x, y]) => [0.8, 0.8, 0.6, x, y, 2.6, CH]);
const TAIL = [[4, 4, 4, 0, 1.9, -1.3, CH], [3.6, 3.6, 3.6, 0, 5.1, -1.6, DK], [3.2, 3.2, 3.2, 0, 8.3, -0.6, CH], [2.8, 2.8, 2.8, 0, 10.9, 1, DK]];

// Desert Wastes voxel crawler: giant sand scorpion with layered chitin plates, snapping block pincers,
// four glowing eyes and a segmented tail ending in a glowing venom stinger.
export default function duneCrawler() {
  const group = creature(0.95, 0.3);
  const chitin = voxMat({ roughness: 0.45, metalness: 0.1, emissive: '#713f12', emissiveIntensity: 0.25 });
  const eye = glowing('#facc15', 2.4);
  const venom = glowing('#fb923c', 2.2);

  const body = node(0, 0.5, 0, vox(SHELL, chitin));
  const head = node(0, 0.52, 0.72, vox([[7, 3, 5, 0, 0, 0, DK], [6, 1, 4, 0, 2, -0.5, CH]], chitin), vox(EYES, eye));

  const jaws = [];
  [-1, 1].forEach((s) => {
    const pincer = rot(node(s * 0.3, 0.5, 0.8), 0, -s * 0.3, 0);
    const jaw = node(0, -0.02, 0.32, vox(spike([0, 0, 0], [0, 0, 4.4], 1.3, DK, 0.6), chitin));
    pincer.add(vox([[2.2, 2.2, 4.8, 0, 0, 2.4, CH], [3, 2.4, 4, 0, 0.6, 6.6, DK], ...spike([0, 0.6, 8.6], [0, 0.6, 10.8], 1.6, DK, 0.7)], chitin), jaw);
    jaws.push(jaw);
    group.add(pincer);
  });

  const legs = [];
  [-1, 1].forEach((s) => {
    [0.35, 0, -0.35].forEach((z) => {
      const leg = node(s * 0.42, 0.45, z, vox([...line([0, 0, 0], [s * 5.5, 3, 0], 1.1, DK), ...line([s * 5.5, 3, 0], [s * 8.5, -7, 0], 1, CH)], chitin));
      legs.push(leg);
      group.add(leg);
    });
  });

  const arm = node(0, 0.62, -0.55, vox(TAIL, chitin), vox([[2.6, 2.6, 2.6, 0, 11.8, 1.6, CH], ...spike([0, 11.4, 3], [0, 10, 5.6], 1.2, CH, 0.4)], venom));

  group.add(body, head, arm);
  const animate = clock((t) => {
    jaws.forEach((jaw, i) => {
      jaw.rotation.x = 0.15 + Math.sin(t * 4 + i) * 0.15;
    });
    legs.forEach((leg, i) => {
      leg.rotation.y = Math.sin(t * 6 + i * 1.3) * 0.08;
    });
    venom.emissiveIntensity = 2 + Math.sin(t * 3) * 0.5;
  });
  return finish(group, { body, head, arm, bodyMat: chitin, animate, walk: scuttle(legs, { swing: 0.45, lift: 0.3, cadence: 7 }) });
}