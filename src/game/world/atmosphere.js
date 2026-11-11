import * as THREE from 'three';
import { QUADRANTS } from '../worldData';
import { biomeWeights, blendColors } from '../biomes';

const FOG = QUADRANTS.map((q) => new THREE.Color(q.fog));
const SKY = QUADRANTS.map((q) => new THREE.Color(q.sky));
const LAIR_FOG = new THREE.Color('#08060f');
const LAIR_SKY = new THREE.Color('#8f7bff');
const fog = new THREE.Color();
const sky = new THREE.Color();

// Fog and sky light drift toward the biome mix under the camera, so crossing a border never snaps.
export function updateAtmosphere(scene, hemi, focus, zone, dt) {
  if (zone === 'lair') {
    fog.copy(LAIR_FOG);
    sky.copy(LAIR_SKY);
  } else {
    const weights = biomeWeights(focus.x, focus.z);
    blendColors(weights, FOG, fog);
    blendColors(weights, SKY, sky);
  }
  const k = 1 - Math.exp(-1.6 * dt);
  scene.fog.color.lerp(fog, k);
  scene.background.lerp(fog, k);
  hemi.color.lerp(sky, k);
}