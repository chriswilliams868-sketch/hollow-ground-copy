import { glowing, node, pulse } from '../kit';
import { vox, voxMat, mirror, line, spike } from '../voxel';
import { creature, strikeArm, hangArm, hollowEyes, clock, finish, rootOf } from './rig';
import { walker } from './gaits';

const BARK = '#4a3524';
const BARK2 = '#3d2b1d';
const DARK = '#24170d';
const MOSS = '#4d7c0f';

const TORSO = [
  [4.5, 4, 3.5, 0, -3.6, 0, BARK2],
  [6, 4, 4.5, 0, 0, 0.2, BARK],
  [6.5, 3, 5, 0, 3.5, 0.4, BARK2],
  [7, 1, 5.5, 0, 1.5, 0.3, MOSS],
  ...mirror([[2.5, 1.5, 2.5, 3.2, 4.8, 0.8, '#65a30d']]),
  ...[0, 1, 2, 3].flatMap((i) => spike([0, -2 + i * 2.2, -2.2], [0, -1 + i * 2.2, -4.6], 1.1, DARK, 0.5)),
];
const HEAD = [[5, 4, 5, 0, 0, 0, BARK], [3, 2, 2, 0, -0.8, 3, BARK2], [5.5, 1, 1, 0, 1.6, 2.6, DARK]];
const ANTLERS = mirror([...line([1.5, 2, -0.5], [3.5, 6, -2], 1, DARK), ...line([2.5, 4, -1.2], [4.5, 5, -0.5], 0.8, DARK), ...line([3.5, 6, -2], [3, 8, -3], 0.8, DARK)]);

// Dark Forest voxel skirmisher: hunched briar-wood body with back thorns, branching antlers, thorn claws and hollow red eyes.
export default function forestStalker() {
  const group = creature(0.62, 0.3);
  const bark = voxMat({ roughness: 0.9, emissive: '#6b8e23', emissiveIntensity: 0.25 });
  const eye = glowing('#ff3b30', 2.6);

  // Digitigrade briar legs, jointed at hip and knee for the walk cycle
  const legs = [-1, 1].map((s) => {
    const knee = node(0, -0.42, 0.17, vox([...line([0, 0, 0], [0, -5.5, -1.2], 1.2, DARK), [1.6, 0.8, 2.6, 0, -6.3, 0.6, DARK]], bark));
    const hip = node(s * 0.15, 0.84, -0.12, vox(line([0, 0, 0], [0, -6.7, 2.7], 1.4, BARK2), bark), knee);
    group.add(hip);
    return { hip, knee };
  });

  const body = node(0, 1.05, 0, vox(TORSO, bark));
  body.rotation.x = 0.35;
  const head = node(0, 1.5, 0.18, vox([...HEAD, ...ANTLERS], bark));
  hollowEyes(head, eye, 0.07, 0.02, 0.17, 0.05, 0.022);

  const { arm, limb } = strikeArm(group, 0.24, 1.2, 0.12);
  limb.add(vox([
    ...line([0, 0, 0], [0, 0, 9.6], 1.2, DARK),
    ...[-1.8, 0, 1.8].flatMap((x) => spike([0, 0, 9.6], [x, 0, 13.8], 1, DARK, 0.5)),
  ], bark));
  const off = hangArm(group, -0.24, 1.2, 0.1, -0.25, 0.4);
  off.add(vox([
    ...line([0, 0, 0], [0, -9.6, 0], 1.1, DARK),
    ...[-1.2, 1.2].flatMap((z) => spike([0, -9.6, 0], [0, -12.6, z], 0.9, DARK, 0.5)),
  ], bark));

  group.add(body, head);
  const animate = clock((t) => {
    head.rotation.z = Math.sin(t * 2) * 0.06;
    pulse(eye, 2.4, 0.6, t, 3);
  });
  const walk = walker(rootOf(group), legs, { length: 0.84, swing: 0.42, cadence: 4.5, fold: 0.6 });
  return finish(group, { body, head, arm, bodyMat: bark, animate, walk });
}