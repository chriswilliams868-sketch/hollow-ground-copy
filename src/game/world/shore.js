import * as THREE from 'three';
import { QUADRANTS } from '../worldData';
import { coastRadius } from '../coast';
import { biomeWeights, blendColors } from '../biomes';
import { WATER } from '../grid';

const ROCK = { forest: '#24302a', desert: '#5a4630', tundra: '#8fa3b8', ruins: '#2a2140' };
const ROCK_COLORS = QUADRANTS.map((q) => new THREE.Color(ROCK[q.id]));
const TAU = Math.PI * 2;

// Blocky sea stacks along the shoreline, snapped to the voxel grid; lower on the camera-facing shores
// so they never hide the hero.
function rocks(rand) {
  const count = 420;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.92 }), count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * TAU + (rand() - 0.5) * 0.02;
    const r = coastRadius(angle) - 0.4 - rand() * 1.6;
    const x = Math.round(Math.cos(angle) * r);
    const z = Math.round(Math.sin(angle) * r);
    const facing = Math.max(0, Math.cos(angle - Math.PI / 4));
    const peak = Math.round((1.2 + rand() * 3.4) * (1 - 0.72 * facing) * 2) / 2;
    const w = 1 + Math.floor(rand() * 2);
    dummy.position.set(x, (peak - 2.5) / 2, z);
    dummy.scale.set(w, peak + 2.5, w);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    // Rock colour shades from one biome's stone into the next along the coast
    mesh.setColorAt(i, blendColors(biomeWeights(x, z), ROCK_COLORS, color).multiplyScalar(0.75 + rand() * 0.5));
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Breaking surf: a thin ribbon hugging the coastline at water level.
function foam() {
  const steps = 340;
  const positions = [];
  const indices = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * TAU;
    const r = coastRadius(angle);
    const outer = r + 1.3 + Math.sin(angle * 23) * 0.3;
    positions.push(Math.cos(angle) * (r + 0.1), -0.86, Math.sin(angle) * (r + 0.1));
    positions.push(Math.cos(angle) * outer, -0.86, Math.sin(angle) * outer);
    if (i < steps) indices.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: '#9ee7ff', transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
}

export function buildShore(rand) {
  const group = new THREE.Group();
  const sea = new THREE.Mesh(
    new THREE.CircleGeometry(160, 80),
    new THREE.MeshStandardMaterial({ color: '#0a1424', emissive: '#06263a', emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.55 })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = WATER;
  const surf = foam();
  group.add(rocks(rand), sea, surf);
  return {
    group,
    update(time) {
      surf.material.opacity = 0.16 + Math.sin(time * 1.4) * 0.06;
    },
  };
}