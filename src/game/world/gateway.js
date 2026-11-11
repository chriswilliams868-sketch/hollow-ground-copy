import * as THREE from 'three';
import { GEMS, GEM_ORDER, WORLD } from '../worldData';
import { std, part, node } from '../models/kit';
import { blocks } from '../models/voxel';
import { mulberry32 } from '../random';
import { subSeed } from '../seed';
import { occluder } from '../occlusion/occluder';

const TURN = Math.PI / 4; // the arch faces the south-east camera
const RING = 5.4;
const SEALED = new THREE.Color('#4c1d95');
const OPEN = new THREE.Color('#5eead4');

// The Hollow Gateway Ruins: a crumbling flagstone dais ringed by broken pillars, with a block arch whose
// veil stays sealed until all four gemstone sockets in its lintel are lit.
export function buildGateway(group) {
  const { x, z } = WORLD.gateway;
  const rand = mulberry32(subSeed(4401));
  const stone = std('#2c2740', { roughness: 0.9, metalness: 0.05 });
  const worn = std('#3b3354', { roughness: 0.95, metalness: 0.05 });
  const root = node(x, 0, z);
  const colliders = [];

  const tiles = [];
  for (let i = -4; i <= 4; i += 1) {
    for (let j = -4; j <= 4; j += 1) {
      if (Math.hypot(i, j) <= 4.6 && rand() > 0.12) tiles.push([0.94, 0.12, 0.94, i, 0.02 - rand() * 0.04, j]);
    }
  }
  const dais = part(blocks(tiles), worn);
  dais.castShadow = false;
  dais.receiveShadow = true;

  // Broken pillars, shorter on the camera side so they never hide the hero
  const ruins = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const px = Math.cos(a) * RING;
    const pz = Math.sin(a) * RING;
    const facing = Math.max(0, Math.cos(a - Math.PI / 4));
    const height = Math.max(1, Math.round((1 + rand() * 3) * (1 - 0.7 * facing)));
    for (let b = 0; b < height; b += 1) ruins.push([0.9, 0.9, 0.9, px + (rand() - 0.5) * 0.14, 0.45 + b * 0.9, pz + (rand() - 0.5) * 0.14]);
    if (rand() < 0.6) ruins.push([0.9, 0.9, 0.9, px + Math.cos(a) * 1.3 + (rand() - 0.5), 0.3, pz + Math.sin(a) * 1.3 + (rand() - 0.5)]);
    colliders.push({ x: x + px, z: z + pz, r: 0.6 });
  }

  const arch = node();
  arch.rotation.y = TURN;
  const archBlocks = [[5.2, 0.9, 1, 0, 5.45, 0], [1.4, 0.6, 1.1, -1.7, 6.2, 0], [0.8, 0.5, 1.1, 1.2, 6.15, 0]];
  [-2, 2].forEach((side) => {
    for (let b = 0; b < 5; b += 1) archBlocks.push([1, 1, 1, side + (b % 2 ? 0.05 : -0.05), 0.5 + b, 0]);
    colliders.push({ x: x + side * Math.cos(TURN), z: z - side * Math.sin(TURN), r: 0.75 });
  });

  const veilMat = new THREE.MeshBasicMaterial({ color: SEALED, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.9), veilMat);
  veil.position.y = 2.5;
  const rune = new THREE.MeshBasicMaterial({ color: '#ff6b35', transparent: true, opacity: 0.6 });
  const seal = new THREE.Mesh(blocks([[0.12, 2.4, 0.06], [2.4, 0.12, 0.06], [1.2, 1.2, 0.04]]), rune);
  seal.rotation.z = Math.PI / 4;
  seal.position.set(0, 2.5, 0.06);

  // Portal swirl: glowing blocks orbiting inside the arch once it opens
  const glow = new THREE.MeshBasicMaterial({ color: '#a5f3fc', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const swirl = node(0, 2.5, 0.08);
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), glow);
    cube.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.9, 0);
    swirl.add(cube);
  }

  const sockets = {};
  GEM_ORDER.forEach((id, i) => {
    const gemMat = std('#2a2438', { emissive: GEMS[id].color, emissiveIntensity: 0.05, roughness: 0.25, metalness: 0.3 });
    const gem = part(new THREE.BoxGeometry(0.34, 0.34, 0.34), gemMat, -1.5 + i, 5.45, 0.58);
    gem.rotation.z = Math.PI / 4;
    arch.add(gem);
    sockets[id] = { gem, gemMat };
  });
  arch.add(part(blocks(archBlocks), stone), veil, seal, swirl);

  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: '#5eead4', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  pool.position.y = 0.1;
  root.add(dais, occluder(part(blocks(ruins), stone)), occluder(arch), pool);
  group.add(root);

  let progress = 0;
  return {
    colliders,
    open: false,
    setGems(gems) {
      Object.entries(sockets).forEach(([id, { gemMat }]) => {
        const lit = gems.includes(id);
        gemMat.color.set(lit ? GEMS[id].color : '#2a2438');
        gemMat.emissiveIntensity = lit ? 1.8 : 0.05;
      });
    },
    setOpen(open, instant = false) {
      this.open = open;
      if (instant) progress = open ? 1 : 0;
    },
    update(time, dt) {
      const target = this.open ? 1 : 0;
      progress += Math.sign(target - progress) * Math.min(Math.abs(target - progress), dt * 0.6);
      veilMat.color.lerpColors(SEALED, OPEN, progress);
      veilMat.opacity = 0.35 + progress * 0.3 + Math.sin(time * 2.4) * 0.08;
      rune.opacity = (1 - progress) * (0.45 + Math.sin(time * 2) * 0.2);
      seal.visible = progress < 0.98;
      swirl.visible = progress > 0.02;
      swirl.rotation.z = time * 1.6;
      swirl.scale.setScalar(Math.max(0.01, progress));
      pool.material.opacity = progress * (0.4 + Math.sin(time * 3) * 0.1);
      Object.values(sockets).forEach(({ gem }, i) => {
        gem.rotation.y = time * 1.2 + i;
      });
    },
  };
}