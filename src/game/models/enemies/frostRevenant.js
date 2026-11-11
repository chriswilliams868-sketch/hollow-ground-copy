import { std, glowing, node, pulse } from '../kit';
import { vox, voxMat, mirror, spike } from '../voxel';
import { voxCloth, flutter } from '../cloth';
import { legs } from '../../heroes/common';
import { creature, strikeArm, hangArm, clock, finish, rootOf } from './rig';
import { walker } from './gaits';

const PL = '#94a3b8';
const PL2 = '#7c8aa0';
const DK = '#1e293b';
const ICE = '#bae6fd';

const TORSO = [[8, 7, 5, 0, 0.5, 0, PL], [7, 2, 4.6, 0, -3.5, 0, PL2], [8.6, 1, 5.6, 0, -4, 0, DK], [6, 1, 4, 0, 4.5, 0, PL2]];
const PAULDRONS = mirror([
  ...spike([4.5, 4.5, 0], [6.5, 7.2, 0], 1.6, ICE, 0.6),
  ...spike([4.5, 4.5, -1.3], [6, 6.5, -2.6], 1.3, ICE, 0.5),
  ...spike([4.5, 4.5, 1.3], [6.4, 5.8, 2.2], 1.3, ICE, 0.5),
]);
const CROWN = [
  ...[-0.9, -0.45, 0, 0.45, 0.9].flatMap((a, i) => {
    const x = Math.sin(a) * 2.6;
    const z = Math.cos(a) * 2.6;
    return spike([x, 3, z], [x * 1.1, i === 2 ? 8 : 6, z], 1.1, ICE, 0.4);
  }),
  ...[-1.3, -0.5, 0.5, 1.3].map((x) => [0.6, 1.4, 0.6, x, -3.4, 2.4, ICE]),
];

// Frost Tundra voxel skirmisher: frozen undead knight in stepped plate, ice-spike crown and pauldrons,
// a pale glowing gaze, cloak strips and a long tapering icicle blade.
export default function frostRevenant() {
  const group = creature(0.62, 0.3);
  const plate = voxMat({ roughness: 0.35, metalness: 0.3, emissive: '#3b82f6', emissiveIntensity: 0.25 });
  const ice = std(ICE, { transparent: true, opacity: 0.8, roughness: 0.1, emissive: '#38bdf8', emissiveIntensity: 0.9 });
  const eye = glowing('#e0f2fe', 2.8);
  const stride = legs(group, { x: 0.14, w: 2.6, mat: plate, leg: DK, boot: DK, knee: ICE });

  const body = node(0, 0.97, 0, vox(TORSO, plate), vox([[1.2, 2.4, 1, 0, 0.8, 2.9, ICE], ...PAULDRONS], ice));
  const strips = [-1, 1].map((s) => {
    const strip = voxCloth(2, 7, 1.8, plate, (c, r) => (r === 6 ? ICE : (c + r) % 2 ? '#1e3a5f' : '#173152'));
    strip.position.set(s * 0.1, 1.27, -0.24);
    strip.rotation.x = 0.18;
    group.add(strip);
    return strip;
  });

  const head = node(0, 1.5, 0,
    vox([[6, 6, 6, 0, 0, 0, DK], [6.4, 1, 6.4, 0, 1.8, 0, '#334155']], plate),
    vox(mirror([[1, 0.8, 0.5, 1.1, 0.3, 3.2, ICE]]), eye),
    vox(CROWN, ice)
  );

  const { arm, limb } = strikeArm(group, 0.3, 1.2, 0.06);
  limb.add(vox([[2.2, 2.2, 5.6, 0, 0, 2.8, PL], [2, 2, 2, 0, 0, 6.1, DK], [5, 1, 1, 0, 0, 6.9, DK]], plate), vox(spike([0, 0, 7.6], [0, 0, 24], 1.5, ICE, 0.4), ice));
  const off = hangArm(group, -0.3, 1.2, 0, -0.25);
  off.add(vox([[2.2, 7.2, 2.2, 0, -3.6, 0, PL], [2, 2, 2, 0, -7.5, 0, DK]], plate));

  group.add(body, head);
  const animate = clock((t) => {
    strips.forEach((strip, i) => flutter(strip, t + i * 1.7, 0.09, 4));
    pulse(ice, 0.9, 0.35, t, 2.2);
    pulse(eye, 2.6, 0.5, t, 3);
  });
  const walk = walker(rootOf(group), stride, { length: 0.68, swing: 0.5, cadence: 4.8, fold: 0.8 });
  return finish(group, { body, head, arm, bodyMat: plate, animate, walk });
}