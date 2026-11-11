import * as THREE from 'three';
import { V, vox } from './voxel';

// Cloth panel hanging from its top edge (capes, scarves, robe strips).
export function clothSheet(width, height, material, segX = 4, segY = 6) {
  const geometry = new THREE.PlaneGeometry(width, height, segX, segY).translate(0, -height / 2, 0);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.userData.rest = Float32Array.from(geometry.attributes.position.array);
  mesh.userData.height = height;
  return mesh;
}

// Voxel cloth hanging from its top edge: a grid of `cell`-voxel blocks one voxel thick that `flutter` ripples.
// `color(col, row)` paints each block (return null to leave a tattered gap).
export function voxCloth(cols, rows, cell, material, color) {
  const boxes = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      boxes.push([cell, cell, 1, (c - (cols - 1) / 2) * cell, -(r + 0.5) * cell, 0, typeof color === 'function' ? color(c, r) : color]);
    }
  }
  const mesh = vox(boxes, material);
  mesh.userData.rest = Float32Array.from(mesh.geometry.attributes.position.array);
  mesh.userData.height = rows * cell * V;
  return mesh;
}

// Ripples the panel, stronger toward its free (bottom) edge; negative `amount` billows forward.
export function flutter(mesh, time, amount = 0.08, speed = 5) {
  const p = mesh.geometry.attributes.position;
  const { rest, height } = mesh.userData;
  for (let i = 0; i < p.count; i += 1) {
    const x = rest[i * 3];
    const y = rest[i * 3 + 1];
    const depth = -y / height;
    p.setZ(i, rest[i * 3 + 2] - depth * depth * amount * (1.2 + Math.sin(time * speed + x * 4 + y * 5)));
  }
  p.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}