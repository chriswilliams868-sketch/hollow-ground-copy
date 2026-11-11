import * as THREE from 'three';
import { QUADRANTS } from '@/game/worldData';
import { biomeWeights, blendColors } from '@/game/biomes';
import { blockTop } from '@/game/terrain';
import { seedVersion } from '@/game/seed';
import { WATER } from '@/game/grid';

const RES = 160;
const TINTS = QUADRANTS.map((q) => new THREE.Color(q.tint));
const RIVER = new THREE.Color('#1d4e6b');
let cached = null;
let cachedAt = -1;

// Top-down picture of the current world: blended biomes, shaded by elevation, with its rivers. Redrawn per seed.
export function biomeMapImage(extent) {
  if (cached && cachedAt === seedVersion()) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = RES;
  canvas.height = RES;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(RES, RES);
  const color = new THREE.Color();
  for (let py = 0; py < RES; py += 1) {
    for (let px = 0; px < RES; px += 1) {
      const x = ((px + 0.5) / RES * 2 - 1) * extent;
      const z = ((py + 0.5) / RES * 2 - 1) * extent;
      const h = blockTop(x, z);
      if (h < WATER) color.copy(RIVER);
      else blendColors(biomeWeights(x, z), TINTS, color).multiplyScalar(0.82 + Math.min(h, 5) * 0.07);
      const i = (px + py * RES) * 4;
      image.data[i] = Math.min(255, color.r * 255);
      image.data[i + 1] = Math.min(255, color.g * 255);
      image.data[i + 2] = Math.min(255, color.b * 255);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  cached = canvas.toDataURL();
  cachedAt = seedVersion();
  return cached;
}