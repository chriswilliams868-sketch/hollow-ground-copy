import { glowing, node, pulse } from '../kit';
import { vox, voxMat, mirror, spike, ellipsoid } from '../voxel';
import { creature, strikeArm, hangArm, clock, finish, rootOf } from './rig';
import { walker } from './gaits';

const ICE = '#7dd3fc';
const ICE2 = '#a5e3fd';
const DEEP = '#1e3a8a';
const DEEP2 = '#1e40af';
const frost = (i) => (i % 2 ? ICE : ICE2);
const depths = (i) => (i % 2 ? DEEP : DEEP2);

// Back shards [x, y, z] in body voxels, each leaning up and back
const SHARDS = [[-8.8, 8.8, -3.2], [8, 9.6, -4], [0, 9.6, -7.2], [-4.8, 4.8, -8.8], [4.8, 4, -8.8]].flatMap(([x, y, z]) =>
  spike([x, y, z], [x * 1.25, y + 5, z - 3], 2.2, ICE2, 0.6)
);

// Frost Tundra voxel brute: a stepped mass of translucent ice around a glowing core, deep-blue limbs and fists.
export default function glacialGolem() {
  const group = creature(1.0, 0.3);
  const ice = voxMat({ transparent: true, opacity: 0.82, roughness: 0.15, metalness: 0.1, emissive: '#0284c7', emissiveIntensity: 0.25 });
  const deep = voxMat({ roughness: 0.3, emissive: '#0c4a6e', emissiveIntensity: 0.3 });
  const coreMat = glowing('#38bdf8', 1.6);
  const eye = glowing('#f0f9ff', 2.6);

  const legs = [-1, 1].map((s) => {
    const hip = node(s * 0.36, 0.8, 0, vox(ellipsoid(5, 6.6, 5, 0, -6.1, 0, depths), deep));
    group.add(hip);
    return { hip };
  });
  const body = node(0, 1.4, 0, vox([...ellipsoid(12.3, 11.2, 10, 0, 0, 0, frost), ...SHARDS], ice), vox([[7, 7, 7, 0, 0.8, 0, ICE]], coreMat));
  const head = node(0, 2.12, 0.18,
    vox([[8, 7, 8, 0, 0, 0, DEEP], [7, 1, 7, 0, 4, 0, DEEP2]], deep),
    vox(mirror([[1.3, 0.7, 0.5, 1.45, 0.3, 4.2, ICE]]), eye),
    vox([-2, 0, 2].flatMap((x) => spike([x, 4, -0.8], [x * 1.4, 7.5, -1.6], 1.2, ICE2, 0.4)), ice)
  );

  const { arm, limb } = strikeArm(group, 0.85, 1.75, 0.05);
  limb.add(
    vox([[7, 7, 7, 0, 0, 4, ICE], [11.5, 11, 11, 0, 0, 15.2, ICE2]], ice),
    vox([[6.4, 6.4, 6.4, 0, 0, 8.8, DEEP], ...[-3, 0, 3].flatMap((x) => spike([x, 0, 20], [x * 1.5, -1.5, 24], 1.6, DEEP2, 0.6))], deep)
  );
  const off = hangArm(group, -0.85, 1.75, 0, -0.3);
  off.add(vox([[7, 7, 7, 0, -4.8, 0, ICE], [10.8, 10.8, 10.8, 0, -15.2, 0, ICE2]], ice), vox([[6.4, 6.4, 6.4, 0, -9.6, 0, DEEP]], deep));

  group.add(body, head);
  const animate = clock((t) => {
    pulse(coreMat, 1.6, 0.6, t, 2);
    pulse(eye, 2.4, 0.5, t, 3);
  });
  const walk = walker(rootOf(group), legs, { length: 0.8, swing: 0.32, cadence: 6.2, roll: 0.05 });
  return finish(group, { body, head, arm, bodyMat: ice, animate, walk });
}