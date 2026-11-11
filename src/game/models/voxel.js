import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { tone } from './palette';
import { shadeVoxels } from './voxelShade';

// One voxel: the grid every character, enemy and weapon is stacked from.
export const V = 0.0625;

// One geometry from many boxes, each [width, height, depth, x, y, z].
export function blocks(list) {
  return mergeGeometries(list.map(([w, h, d, x = 0, y = 0, z = 0]) => new THREE.BoxGeometry(w, h, d).translate(x, y, z)));
}

// Cube faces: outward normal plus four corners (counter-clockwise seen from outside).
const FACES = [
  [[1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]],
  [[-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]],
  [[0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]],
  [[0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]]],
  [[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]],
  [[0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]],
];

// Hue-shifted tones each block colour is painted from: warm crest, base, cool shade and deep underside.
const RAMPS = new Map();
function rampOf(hex) {
  let ramp = RAMPS.get(hex);
  if (!ramp) {
    ramp = {
      crest: new THREE.Color(tone(hex, 0.06)),
      side: new THREE.Color(hex),
      shade: new THREE.Color(tone(hex, -0.07)),
      deep: new THREE.Color(tone(hex, -0.12)),
    };
    RAMPS.set(hex, ramp);
  }
  return ramp;
}

// Vertex-coloured voxel geometry from boxes [w, h, d, x, y, z, colour] in voxel units (x, y, z = box centre); boxes
// without a colour are skipped. Blocks are painted from a hue-shifted ramp of their colour: 'solid' blocks catch a
// warm crest on top and cool into shade toward and under their base; 'sprite' plates (weapons) keep both flat faces
// at the base colour and rim their outline with the crest as an edge highlight. Every vertex also carries the voxel
// cell it belongs to (aligned to its block's corner), so the voxel shader can shade each cube on its own.
export function voxGeometry(list, unit = V, style = 'solid') {
  const position = [];
  const normal = [];
  const color = [];
  const cell = [];
  const index = [];
  const sprite = style === 'sprite';
  list.forEach(([w, h, d, x, y, z, hex]) => {
    if (!hex) return;
    const ramp = rampOf(hex);
    const lo = [x - w / 2, y - h / 2, z - d / 2];
    const phase = lo.map((v) => v - Math.floor(v));
    FACES.forEach(([n, corners]) => {
      const base = position.length / 3;
      corners.forEach(([cx, cy, cz]) => {
        const p = [x + (cx * w) / 2, y + (cy * h) / 2, z + (cz * d) / 2];
        position.push(p[0] * unit, p[1] * unit, p[2] * unit);
        normal.push(n[0], n[1], n[2]);
        cell.push(p[0] - n[0] * 0.5 - phase[0], p[1] - n[1] * 0.5 - phase[1], p[2] - n[2] * 0.5 - phase[2]);
        let c;
        if (sprite) c = n[1] ? ramp.side : ramp.crest;
        else if (n[1]) c = n[1] > 0 ? ramp.crest : ramp.deep;
        else c = cy > 0 ? ramp.side : ramp.shade;
        color.push(c.r, c.g, c.b);
      });
      index.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  geometry.setAttribute('voxCell', new THREE.Float32BufferAttribute(cell, 3));
  geometry.setIndex(index);
  return geometry;
}

// Finish over the block colours baked into a voxel geometry; `etch` / `veins` add procedural cracks, ridges and
// glowing veins over its voxels (see shadeVoxels).
export const voxMat = ({ etch, veins, ...options } = {}) =>
  shadeVoxels(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.05, emissiveIntensity: 0, ...options }), { etch, veins });

// Shadow-casting mesh of voxel geometry; its material picks up the per-voxel surface shading.
export function voxMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, shadeVoxels(material));
  mesh.castShadow = true;
  return mesh;
}

// Voxel mesh at (x, y, z) metres; its block list is in voxel units.
export function vox(list, material, x = 0, y = 0, z = 0, unit = V) {
  const mesh = voxMesh(voxGeometry(list, unit), material);
  mesh.position.set(x, y, z);
  return mesh;
}

// Both sides of a symmetric model: every off-centre box plus its mirror across x = 0.
export const mirror = (list) => list.flatMap((b) => (b[3] === 0 ? [b] : [b, [b[0], b[1], b[2], -b[3], b[4], b[5], b[6]]]));

// A colour, or a function of the position along a run (t = 0 at its start, 1 at its end) for graded runs.
const paint = (color, t, i) => (typeof color === 'function' ? color(t, i) : color);

// A staircase of cubes from `a` to `b` (voxel units): straps, horns, antlers, limbs.
export function line([ax, ay, az], [bx, by, bz], size, color) {
  const steps = Math.max(1, Math.round(Math.max(Math.abs(bx - ax), Math.abs(by - ay), Math.abs(bz - az)) / size));
  const snap = (v) => Math.round(v / size) * size;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return [size, size, size, ax + snap((bx - ax) * t), ay + snap((by - ay) * t), az + snap((bz - az) * t), paint(color, t, i)];
  });
}

// Tapering spike of cubes from `a` to `b`, shrinking from `base` to `tip` voxels across.
export function spike([ax, ay, az], [bx, by, bz], base, color, tip = 0.6) {
  const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay, bz - az) / ((base + tip) / 2)) + 1);
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const s = base + (tip - base) * t;
    return [s, s, s, ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t, paint(color, t, i)];
  });
}

// Stepped voxel ellipsoid: one octagonal layer per `step` voxels; `color` may be a function of the layer index.
export function ellipsoid(rx, ry, rz, cx, cy, cz, color, step = 1) {
  const out = [];
  let i = 0;
  for (let y = -ry + step / 2; y < ry; y += step, i += 1) {
    const k = Math.sqrt(Math.max(0, 1 - (y / ry) ** 2));
    const w = Math.max(1, Math.round(2 * rx * k));
    const d = Math.max(1, Math.round(2 * rz * k));
    const c = typeof color === 'function' ? color(i) : color;
    out.push([w, step, Math.max(1, Math.round(d * 0.72)), cx, cy + y, cz, c], [Math.max(1, Math.round(w * 0.72)), step, d, cx, cy + y, cz, c]);
  }
  return out;
}