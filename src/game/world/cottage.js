import * as THREE from 'three';
import { WORLD } from '../worldData';
import { std, glowing, metal, part, node, rot } from '../models/kit';
import { occluder } from '../occlusion/occluder';

const HOUSE_TURN = Math.PI / 4; // door faces south-east, toward the camera

const log = (length, material, x, y, z, alongZ) => {
  const mesh = part(new THREE.CylinderGeometry(0.17, 0.17, length, 8), material, x, y, z);
  mesh.rotation[alongZ ? 'x' : 'z'] = Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
};

// Rustic log cabin: stone footing, stacked log walls, plank roof with gables, chimney, lit windows.
function house(m) {
  const g = node(WORLD.cottage.x, 0, WORLD.cottage.z);
  g.rotation.y = HOUSE_TURN;
  g.add(part(new THREE.BoxGeometry(5.6, 0.3, 4.6), m.stone, 0, 0.15, 0), part(new THREE.BoxGeometry(4.8, 2.1, 3.8), m.dark, 0, 1.3, 0));
  for (let i = 0; i < 6; i += 1) {
    const y = 0.45 + i * 0.33;
    g.add(log(5.3, m.wood, 0, y, 2, false), log(5.3, m.wood, 0, y, -2, false), log(4.4, m.wood, 2.5, y, 0, true), log(4.4, m.wood, -2.5, y, 0, true));
  }
  const gable = part(new THREE.CylinderGeometry(1, 1, 4.9, 3).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2), m.wood, 0, 2.72, 0);
  gable.scale.set(1, 0.75, 2.3);
  g.add(
    gable,
    rot(part(new THREE.BoxGeometry(5.8, 0.14, 2.8), m.roof, 0, 2.93, 1.175), 0.49),
    rot(part(new THREE.BoxGeometry(5.8, 0.14, 2.8), m.roof, 0, 2.93, -1.175), -0.49),
    log(6, m.dark, 0, 3.55, 0, false),
    part(new THREE.BoxGeometry(0.6, 1.7, 0.6), m.stone, 1.5, 3.3, -0.9),
    part(new THREE.BoxGeometry(1, 1.7, 0.1), m.door, 0, 1.0, 2.2),
    part(new THREE.SphereGeometry(0.05, 6, 5), m.lamp, 0.35, 1.0, 2.27),
    part(new THREE.BoxGeometry(0.75, 0.6, 0.08), m.window, -1.55, 1.45, 2.2),
    part(new THREE.BoxGeometry(0.75, 0.6, 0.08), m.window, 1.55, 1.45, 2.2),
    part(new THREE.BoxGeometry(0.8, 0.05, 0.1), m.dark, -1.55, 1.45, 2.25),
    part(new THREE.BoxGeometry(0.8, 0.05, 0.1), m.dark, 1.55, 1.45, 2.25),
    part(new THREE.BoxGeometry(0.08, 0.6, 0.06), m.window, -2.55, 1.45, 0),
    part(new THREE.SphereGeometry(0.09, 8, 6), m.lamp, 0.85, 1.95, 2.35)
  );
  [0.3, 0.62, 0.94].forEach((y, i) => [-0.5, 0, 0.5].slice(i % 2).forEach((z) => g.add(log(1.1, m.wood, -3.05, y * 0.7, z + 0.6, false))));
  return g;
}

// Stone forge with a glowing coal bed under an iron hood, bellows and a quench barrel.
function forge(m) {
  const g = node(WORLD.forge.x, 0, WORLD.forge.z);
  g.rotation.y = 0.9;
  g.add(
    part(new THREE.BoxGeometry(1.9, 0.95, 1.4), m.stone, 0, 0.475, 0),
    part(new THREE.BoxGeometry(1.3, 0.1, 0.85), m.coals, 0, 0.99, 0.05),
    rot(part(new THREE.ConeGeometry(1.15, 0.8, 4), m.iron, 0, 2.45, 0), 0, Math.PI / 4, 0),
    part(new THREE.CylinderGeometry(0.14, 0.14, 1.3, 8), m.iron, 0, 3.4, 0),
    part(new THREE.BoxGeometry(0.5, 0.25, 0.7), m.door, 1.2, 0.75, 0),
    part(new THREE.CylinderGeometry(0.32, 0.3, 0.7, 12), m.wood, -1.35, 0.35, 0.3)
  );
  [[-0.85, -0.6], [0.85, -0.6], [-0.85, 0.6], [0.85, 0.6]].forEach(([x, z]) => g.add(part(new THREE.BoxGeometry(0.08, 1.2, 0.08), m.iron, x, 1.55, z)));
  return g;
}

// Anvil one stride in front of Gerald, its long axis across his swing.
function anvil(m) {
  const { x, z, facing } = WORLD.gerald;
  const g = node(x + Math.sin(facing), 0, z + Math.cos(facing));
  g.rotation.y = facing;
  g.add(
    part(new THREE.BoxGeometry(0.5, 0.22, 0.4), m.iron, 0, 0.11, 0),
    part(new THREE.BoxGeometry(0.24, 0.38, 0.24), m.iron, 0, 0.41, 0),
    part(new THREE.BoxGeometry(0.78, 0.17, 0.32), m.iron, 0, 0.68, 0),
    rot(part(new THREE.ConeGeometry(0.12, 0.34, 8), m.iron, 0.55, 0.69, 0), 0, 0, -Math.PI / 2)
  );
  return g;
}

// The starting hub: Hearthwood Cottage, Gerald's forge and anvil in the green valley by the Dark Forest.
export function buildCottage(group) {
  const m = {
    wood: std('#7a5232', { roughness: 0.9 }),
    dark: std('#2b1d14', { roughness: 1 }),
    stone: std('#5a5560', { roughness: 0.95, flatShading: true }),
    roof: std('#3a2a20', { roughness: 0.95 }),
    door: std('#4a2f1b', { roughness: 0.85 }),
    iron: metal('#4b505a', 0.5),
    window: glowing('#ffb347', 1.6),
    lamp: glowing('#ffd27a', 2.2),
    coals: glowing('#ff5a1f', 2.2),
  };
  group.add(occluder(house(m)), occluder(forge(m)), occluder(anvil(m)));
  const light = new THREE.PointLight('#ff7a2a', 6, 10, 1);
  light.position.set(WORLD.forge.x, 1.7, WORLD.forge.z);
  group.add(light);

  const { cottage, forge: f, gerald } = WORLD;
  const colliders = [
    ...[-1.5, 1.5].map((lx) => ({ x: cottage.x + lx * Math.cos(HOUSE_TURN), z: cottage.z - lx * Math.sin(HOUSE_TURN), r: 1.9 })),
    { x: f.x, z: f.z, r: 1 },
    { x: gerald.x, z: gerald.z, r: 0.4 },
    { x: gerald.x + Math.sin(gerald.facing), z: gerald.z + Math.cos(gerald.facing), r: 0.35 },
  ];

  return {
    colliders,
    update(time) {
      m.coals.emissiveIntensity = 2 + Math.sin(time * 7) * 0.35 + Math.sin(time * 13) * 0.2;
      light.intensity = 5.5 + Math.sin(time * 9) * 0.8;
    },
  };
}