import * as THREE from 'three';
import { blockTop } from '../terrain';

// Points on the hero the camera should see: low, middle and high up its centre, and either side of its chest.
const POINTS = [[0, 0.3], [0, 0.9], [0, 1.5], [-0.32, 0.9], [0.32, 0.9]];
// Sight lines stop this short of the hero's centre, so its own bulk never counts
const BODY = 0.25;
// Above this no block column reaches
const TERRAIN_TOP = 7.5;
const STRIDE = 0.2;
const ndc = new THREE.Vector3();
const side = new THREE.Vector3();

// Sight lines from the isometric camera to the hero: one ray per point, cast from the camera along its view through
// that point's spot on screen and ending just short of the hero.
export function sightRays(raycaster, camera, feet, out) {
  side.setFromMatrixColumn(camera.matrixWorld, 0);
  POINTS.forEach(([offset, lift], i) => {
    const sight = out[i] || (out[i] = { ray: new THREE.Ray(), far: 0, point: new THREE.Vector3() });
    sight.point.copy(feet).addScaledVector(side, offset);
    sight.point.y += lift;
    raycaster.setFromCamera(ndc.copy(sight.point).project(camera), camera);
    sight.ray.copy(raycaster.ray);
    sight.far = raycaster.ray.origin.distanceTo(sight.point) - BODY;
  });
  return out;
}

// Walks a sight line back from the hero toward the camera over the block columns: the point where a column top first
// rises above it, or null once the line is clear of the highest ground.
export function terrainBlock({ ray, point, far }, out) {
  const d = ray.direction;
  for (let s = BODY; s < far; s += STRIDE) {
    const y = point.y - d.y * s;
    if (y > TERRAIN_TOP) return null;
    const x = point.x - d.x * s;
    const z = point.z - d.z * s;
    if (blockTop(x, z) > y) return out.set(x, y, z);
  }
  return null;
}