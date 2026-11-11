import * as THREE from 'three';
import { WORLD, QUADRANTS } from '../worldData';
import { insideCoast } from '../coast';
import { biomeWeights } from '../biomes';
import { blockTop, isWet } from '../terrain';
import { EXTENT, CHUNK, CHUNKS } from '../grid';
import { blocks } from '../models/voxel';

const dummy = new THREE.Object3D();
const bounds = new THREE.Box3();
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
const chunkOf = (x, z) => Math.floor((x + EXTENT) / CHUNK) + Math.floor((z + EXTENT) / CHUNK) * CHUNKS;
const quarter = (rand) => Math.floor(rand() * 4) * (Math.PI / 2);

// Open ground: dry land off the roads, clear of the hub, the cottage clearing, every guardian lair and the gateway.
function open(x, z) {
  if (!insideCoast(x, z, 4) || Math.min(Math.abs(x), Math.abs(z)) < 4.5 || Math.hypot(x, z) < 8) return false;
  if (Math.hypot(x - WORLD.clearing.x, z - WORLD.clearing.z) < WORLD.clearing.radius) return false;
  if (Math.hypot(x - WORLD.gateway.x, z - WORLD.gateway.z) < WORLD.gateway.radius + 3) return false;
  return QUADRANTS.every(({ lair }) => Math.hypot(x - lair.x, z - lair.z) >= WORLD.lairRadius + 2.5) && !isWet(x, z);
}

// Spots for one biome's props, drawn across the whole island in proportion to that biome's share of the ground,
// each centred on a voxel column and standing on its block top.
function scatter(rand, biome, count, taken) {
  const spots = [];
  let attempts = 0;
  while (spots.length < count && attempts < count * 120) {
    attempts += 1;
    const x = Math.floor((rand() * 2 - 1) * 104) + 0.5;
    const z = Math.floor((rand() * 2 - 1) * 104) + 0.5;
    if (rand() > biomeWeights(x, z)[biome] || !open(x, z)) continue;
    if (taken.some((p) => Math.abs(p.x - x) < 2.2 && Math.abs(p.z - z) < 2.2)) continue;
    const spot = { x, z, base: blockTop(x, z), parts: [] };
    spots.push(spot);
    taken.push(spot);
  }
  return spots;
}

// One instanced prop layer; its instances are kept per chunk so only loaded chunks are drawn, and each is also recorded
// on its spot (the tree, cactus or rock it belongs to) so the occlusion pass can fade that spot on its own.
function layer(geometry, material, items) {
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, items.length));
  mesh.count = 0;
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  geometry.computeBoundingBox();
  const byChunk = new Map();
  items.forEach((item) => {
    const s = item.s || 1;
    dummy.position.set(item.x, item.base + (item.y || 0), item.z);
    dummy.rotation.set(item.rx || 0, item.ry || 0, item.rz || 0);
    dummy.scale.set(item.sx || s, item.sy || s, item.sx || s);
    dummy.updateMatrix();
    const part = { mesh, matrix: dummy.matrix.clone(), hidden: false };
    item.parts.push(part);
    const c = chunkOf(item.x, item.z);
    if (!byChunk.has(c)) byChunk.set(c, []);
    byChunk.get(c).push(part);
  });
  return { mesh, byChunk };
}

// Per-biome voxel props: [main count, minor count, builder]
const RECIPES = {
  forest: [150, 56, (rand, main, minor) => {
    const trees = main.map((p) => ({ ...p, s: 0.8 + rand() * 0.6 }));
    return [
      layer(blocks([[0.4, 1.4, 0.4, 0, 0.7, 0]]), std('#4a3220'), trees),
      layer(blocks([[1.8, 1.2, 1.8, 0, 1.9, 0]]), std('#173d26'), trees),
      layer(blocks([[1.1, 0.9, 1.1, 0, 2.95, 0]]), std('#1f4d31'), trees),
      layer(blocks([[0.24, 0.24, 0.24, 0, 0.12, 0]]), std('#5eead4', { emissive: '#14b8a6', emissiveIntensity: 1.4 }), minor.map((p) => ({ ...p, s: 0.7 + rand() * 0.8 }))),
    ];
  }],
  desert: [64, 86, (rand, main, minor) => [
    layer(
      blocks([[0.5, 1.7, 0.5, 0, 0.85, 0], [0.4, 0.3, 0.3, 0.42, 0.85, 0], [0.28, 0.6, 0.28, 0.52, 1.25, 0], [0.35, 0.28, 0.3, -0.38, 0.6, 0], [0.26, 0.45, 0.26, -0.46, 0.95, 0]]),
      std('#4d6b2a'),
      main.map((p) => ({ ...p, s: 0.8 + rand() * 0.5, ry: quarter(rand) }))
    ),
    layer(
      blocks([[1.2, 0.7, 1, 0, 0.35, 0], [0.7, 0.45, 0.6, 0.15, 0.9, 0.1]]),
      std('#a07a4a'),
      minor.map((p) => ({ ...p, s: 0.6 + rand() * 0.8, ry: quarter(rand) }))
    ),
  ]],
  tundra: [104, 56, (rand, main, minor) => [
    layer(
      blocks([[0.8, 1, 0.8, 0, 0.5, 0], [0.55, 1, 0.55, 0, 1.5, 0], [0.3, 0.9, 0.3, 0, 2.45, 0]]),
      std('#bfe3ff', { emissive: '#38bdf8', emissiveIntensity: 0.3 }),
      main.map((p) => ({ ...p, s: 0.6 + rand() * 0.8 }))
    ),
    layer(
      blocks([[1, 0.8, 1, 0, 0.4, 0], [0.6, 0.4, 0.6, -0.1, 0.95, 0.1]]),
      std('#e2e8f0'),
      minor.map((p) => ({ ...p, s: 0.6 + rand() * 0.8, ry: quarter(rand) }))
    ),
  ]],
  ruins: [76, 64, (rand, main, minor) => [
    layer(blocks([[0.9, 1, 0.9, 0, 0.5, 0]]), std('#2a2440'), main.map((p) => ({ ...p, sx: 1, sy: 1 + Math.floor(rand() * 4) }))),
    layer(
      blocks([[0.5, 0.5, 0.5]]),
      std('#a855f7', { emissive: '#7c3aed', emissiveIntensity: 1.1 }),
      minor.map((p) => ({ ...p, y: 0.75, s: 0.7 + rand() * 0.8, rx: Math.PI / 4, rz: Math.PI / 4 }))
    ),
  ]],
};

export function buildProps(rand) {
  const group = new THREE.Group();
  const taken = [];
  const layers = [];
  const spots = [];
  QUADRANTS.forEach((q, biome) => {
    const [mainCount, minorCount, build] = RECIPES[q.id];
    const main = scatter(rand, biome, mainCount, taken);
    const minor = scatter(rand, biome, minorCount, taken);
    spots.push(...main, ...minor);
    build(rand, main, minor).forEach((entry) => {
      layers.push(entry);
      group.add(entry.mesh);
    });
  });
  // Each spot's world bounds, for the occlusion pass's quick sight-line test
  spots.forEach((spot) => {
    spot.box = new THREE.Box3();
    spot.parts.forEach(({ mesh, matrix }) => spot.box.union(bounds.copy(mesh.geometry.boundingBox).applyMatrix4(matrix)));
  });

  // Draw only the props standing in the loaded chunks, minus any spot currently drawn faded instead.
  let loaded = [];
  const pack = () => {
    layers.forEach(({ mesh, byChunk }) => {
      let n = 0;
      loaded.forEach((c) => byChunk.get(c)?.forEach((part) => {
        if (!part.hidden) mesh.setMatrixAt(n++, part.matrix);
      }));
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
    });
  };
  return {
    group,
    spots,
    show(chunks) {
      loaded = chunks;
      pack();
    },
    setHidden(spot, hidden) {
      spot.parts.forEach((part) => {
        part.hidden = hidden;
      });
      pack();
    },
  };
}