import * as THREE from 'three';
import { EXTENT, COLS, CHUNK, CHUNKS } from '../grid';
import { columnTop } from '../terrain';
import { subSeed } from '../seed';
import { columnColors } from './groundColor';

// A chunk starts building this far outside the view, and is unloaded once it drifts past the keep margin.
const LOAD_MARGIN = 6;
const KEEP_MARGIN = 32;
const BUILDS_PER_FRAME = 2;
const MIN_Y = -4;
//default value for MAX_Y = 7
const MAX_Y = 20;
const UP = [0, 1, 0];
// The camera always looks from the south-east, so only east and south walls are ever seen.
const WALLS = [
  { dx: 1, dz: 0, normal: [1, 0, 0], corners: (x0, x1, z0, z1, lo, hi) => [[x1, lo, z0], [x1, hi, z0], [x1, hi, z1], [x1, lo, z1]] },
  { dx: 0, dz: 1, normal: [0, 0, 1], corners: (x0, x1, z0, z1, lo, hi) => [[x1, lo, z1], [x1, hi, z1], [x0, hi, z1], [x0, lo, z1]] },
];

const viewProj = new THREE.Matrix4();
const frusta = [new THREE.Frustum(), new THREE.Frustum(), new THREE.Frustum()];
const box = new THREE.Box3();
const topColor = new THREE.Color();
const sideColor = new THREE.Color();
const shade = new THREE.Color();

function hash(ix, iz, salt) {
  let h = Math.imul(ix, 73856093) ^ Math.imul(iz, 19349663) ^ salt;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// One chunk's voxel mesh: a top face per column plus the walls down to any lower neighbour.
function chunkGeometry(ci, cj) {
  const salt = subSeed(9001);
  const position = [];
  const normal = [];
  const color = [];
  const index = [];
  const quad = (corners, n, upper, lower) => {
    const base = position.length / 3;
    corners.forEach((c, i) => {
      const tint = i === 1 || i === 2 ? upper : lower;
      position.push(c[0], c[1], c[2]);
      normal.push(n[0], n[1], n[2]);
      color.push(tint.r, tint.g, tint.b);
    });
    index.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  for (let lz = 0; lz < CHUNK; lz += 1) {
    for (let lx = 0; lx < CHUNK; lx += 1) {
      const ix = ci * CHUNK + lx;
      const iz = cj * CHUNK + lz;
      const h = columnTop(ix, iz);
      const x0 = ix - EXTENT;
      const z0 = iz - EXTENT;
      columnColors(x0 + 0.5, z0 + 0.5, h, hash(ix, iz, salt), topColor, sideColor);
      quad([[x0, h, z0], [x0, h, z0 + 1], [x0 + 1, h, z0 + 1], [x0 + 1, h, z0]], UP, topColor, topColor);
      shade.copy(sideColor).multiplyScalar(0.62);
      WALLS.forEach((wall) => {
        const nx = ix + wall.dx;
        const nz = iz + wall.dz;
        if (nx >= COLS || nz >= COLS) return;
        const low = columnTop(nx, nz);
        if (low < h) quad(wall.corners(x0, x0 + 1, z0, z0 + 1, low, h), wall.normal, sideColor, shade);
      });
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  geometry.setIndex(index);
  return geometry;
}

// Streams terrain chunks in and out around the camera view; `onChange` gets the loaded chunk ids.
export class ChunkStreamer {
  constructor(group, onChange) {
    this.group = group;
    this.onChange = onChange;
    this.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.02 });
    this.meshes = new Map();
  }

  update(camera) {
    camera.updateMatrixWorld();
    viewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    [0, LOAD_MARGIN, KEEP_MARGIN].forEach((margin, i) => {
      frusta[i].setFromProjectionMatrix(viewProj);
      frusta[i].planes.forEach((plane) => {
        plane.constant += margin;
      });
    });
    let budget = BUILDS_PER_FRAME;
    let changed = false;
    for (let c = 0; c < CHUNKS * CHUNKS; c += 1) {
      const ci = c % CHUNKS;
      const cj = (c - ci) / CHUNKS;
      box.min.set(ci * CHUNK - EXTENT, MIN_Y, cj * CHUNK - EXTENT);
      box.max.set(box.min.x + CHUNK, MAX_Y, box.min.z + CHUNK);
      const mesh = this.meshes.get(c);
      if (mesh) {
        if (!frusta[2].intersectsBox(box)) {
          this.unload(c, mesh);
          changed = true;
        }
        continue;
      }
      // Chunks already on screen build at once; ones just outside trickle in a couple per frame
      const visible = frusta[0].intersectsBox(box);
      if (visible || (budget > 0 && frusta[1].intersectsBox(box))) {
        if (!visible) budget -= 1;
        this.load(c, ci, cj);
        changed = true;
      }
    }
    if (changed) this.onChange([...this.meshes.keys()]);
  }

  // The loaded chunk mesh under a world point, if any.
  meshAt(x, z) {
    return this.meshes.get(Math.floor((x + EXTENT) / CHUNK) + Math.floor((z + EXTENT) / CHUNK) * CHUNKS) || null;
  }

  load(c, ci, cj) {
    const mesh = new THREE.Mesh(chunkGeometry(ci, cj), this.material);
    mesh.receiveShadow = true;
    this.group.add(mesh);
    this.meshes.set(c, mesh);
  }

  unload(c, mesh) {
    this.group.remove(mesh);
    mesh.geometry.dispose();
    this.meshes.delete(c);
  }

  dispose() {
    this.meshes.forEach((mesh, c) => this.unload(c, mesh));
    this.material.dispose();
  }
}