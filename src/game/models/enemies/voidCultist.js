import { glowing, metal, node, pulse } from '../kit';
import { vox, voxMat, mirror } from '../voxel';
import { creature, strikeArm, hangArm, clock, finish, joint, rootOf } from './rig';
import { glide } from './gaits';

const RO = '#3b0764';
const RO2 = '#4c0a80';
const DK = '#1e0b36';
const SK = '#a8a2b8';

// Robe skirt widening in steps to a ragged hem (voxels below the waist pivot)
const SKIRT = [
  ...Array.from({ length: 9 }, (_, i) => {
    const w = 7.7 + i * 0.8;
    return [w, 1.87, w * 0.8, 0, -0.94 - i * 1.87, 0, i % 2 ? DK : '#2a1048'];
  }),
  ...Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    return [1.6, 1.6, 1.6, Math.sin(a) * 6.6, -16.6, Math.cos(a) * 5.4, DK];
  }),
];
const ROBE = [[8, 8, 5.5, 0, 0, 0, RO], [9, 3.5, 7, 0, 3.2, 0, DK], [7, 1, 6, 0, 5.2, 0, DK]];
const RUNES = [[8.4, 1, 5.9, 0, -3.2, 0, RO], [0.8, 2.6, 0.4, 0, 0.8, 2.9, RO], [2.4, 0.8, 0.4, 0, 1.2, 2.9, RO]];
const HOOD = [
  [7, 6.5, 7, 0, 0.5, -0.5, DK],
  [7, 1.2, 1.2, 0, 3.1, 3.4, DK],
  ...mirror([[1, 5, 1.2, 3, 0, 3.4, DK]]),
  [5, 4, 0.5, 0, 0, 3.3, '#030106'],
  [4, 3, 3, 0, 1.5, -5, DK],
  [2.5, 2, 2.5, 0, 1.6, -7.2, DK],
];
const CROWN = [
  ...Array.from({ length: 16 }, (_, i) => [0.6, 0.6, 0.6, Math.cos((i / 16) * Math.PI * 2) * 2.6, 0, Math.sin((i / 16) * Math.PI * 2) * 2.6, RO]),
  ...Array.from({ length: 6 }, (_, i) => [0.8, 2, 0.8, Math.cos((i / 6) * Math.PI * 2) * 2.6, 1, Math.sin((i / 6) * Math.PI * 2) * 2.6, RO]),
];
// Sickle: an arc of cubes in the arm's vertical plane
const SICKLE = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 8) * Math.PI * 0.9;
  return [0.6, 0.9, 0.9, 0, 1.9 + Math.sin(a) * 2.6, 11.8 + Math.cos(a) * 2.6, RO];
});

// Shadow Ruins voxel caster: stepped hooded robes, a void face with glowing eyes, ritual sickle,
// glowing runes and a floating ring crown of violet cubes.
export default function voidCultist() {
  const group = creature(0.62, 0.3);
  const robe = voxMat({ roughness: 0.85, emissive: '#7e22ce', emissiveIntensity: 0.25 });
  const eye = glowing('#e879f9', 2.8);
  const rune = glowing('#a855f7', 1.6);
  const crownMat = glowing('#c026d3', 2);

  // Robe skirt and ragged hem hang from a waist pivot so they can swish as the cultist glides
  const skirt = joint(group, [0, 1.05, 0], vox(SKIRT, robe, 0, 1.05, 0));
  const body = node(0, 1.25, 0, vox(ROBE, robe), vox(RUNES, rune));
  const head = node(0, 1.62, 0, vox(HOOD, robe), vox(mirror([[1, 0.8, 0.4, 1, 0.2, 3.65, RO]]), eye));
  const crown = node(0, 1.98, 0, vox(CROWN, crownMat));

  const { arm, limb } = strikeArm(group, 0.28, 1.3, 0.05);
  limb.add(
    vox([[2.4, 2.4, 4, 0, 0, 2, RO], [3.4, 3.4, 2.4, 0, 0, 5.2, RO2], [1.6, 1.6, 1.6, 0, 0, 7, SK], [0.6, 0.6, 5, 0, 0, 9.5, '#2e1a47']], robe),
    vox(SICKLE, metal('#2e1a47', 0.3, { emissive: '#a855f7', emissiveIntensity: 0.7 }))
  );
  const off = hangArm(group, -0.28, 1.3, 0.05, 0.1, 0.9);
  off.add(vox([[2.6, 6.4, 2.6, 0, -3.2, 0, RO], [3.2, 1, 3.2, 0, -6, 0, RO2], [1.6, 1.6, 1.6, 0, -7, 0, SK]], robe));
  const orb = vox([[2.2, 2.2, 2.2, 0, 0, 0, RO]], crownMat, -0.3, 1.25, 0.42);

  group.add(body, head, crown, orb);
  const animate = clock((t, dt) => {
    crown.rotation.y += dt * 1.2;
    crown.position.y = 1.98 + Math.sin(t * 2) * 0.04;
    orb.position.y = 1.25 + Math.sin(t * 3) * 0.05;
    orb.rotation.y += dt * 1.5;
    pulse(crownMat, 2, 0.6, t, 3);
    pulse(eye, 2.6, 0.6, t, 2.4);
  });
  return finish(group, { body, head, arm, bodyMat: robe, animate, walk: glide(rootOf(group), skirt, { cadence: 4.5 }) });
}