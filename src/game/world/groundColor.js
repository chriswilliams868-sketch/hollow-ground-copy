import * as THREE from 'three';
import { WORLD, QUADRANTS } from '../worldData';
import { coastAt } from '../coast';
import { biomeWeights, blendColors } from '../biomes';
import { simplex2 } from '../noise';
import { smoothstep } from '../math';
import { perSeed, subSeed } from '../seed';

const ROAD = new THREE.Color('#2e2a40');
const SEABED = new THREE.Color('#0c0a16');
const MEADOW = new THREE.Color('#3f6a34');
const palette = (key) => QUADRANTS.map((q) => new THREE.Color(q[key]));
const GROUND = palette('ground');
const TINT = palette('tint');
const HIGH = palette('high');
const SHORE = palette('shore');
// Block walls: each biome's earth under its surface (dark loam, sandstone, frozen rock, void stone)
const SOIL = QUADRANTS.map((q) => new THREE.Color({ forest: '#3b2a1f', desert: '#7a5a36', tundra: '#5f7389', ruins: '#1c1530' }[q.id]));
const noise = perSeed(() => simplex2(subSeed(6203)));
const layers = QUADRANTS.map(() => new THREE.Color());
const shore = new THREE.Color();

// Ground vertex colour: blended biome palettes (patchy, paler on hilltops, darker in hollows), the cottage
// meadow, ragged stone roads to the hub, and a beach band in each biome's own shore colour.
export function groundColor(x, z, h, jitter, out) {
  const inland = coastAt(x, z) - Math.hypot(x, z);
  if (inland <= 0) return out.copy(SEABED);
  const weights = biomeWeights(x, z);
  const patches = noise();
  const t = (patches(x * 0.08, z * 0.08) * 0.3 + 0.35 + jitter * 0.35) * 0.6;
  const crest = smoothstep(0.6, 3, h) * 0.65;
  layers.forEach((layer, i) => layer.copy(GROUND[i]).lerp(TINT[i], t).lerp(HIGH[i], crest));
  blendColors(weights, layers, out).multiplyScalar(1 - smoothstep(0, -0.4, h) * 0.25);

  const meadow = WORLD.clearing.radius + 3 - Math.hypot(x - WORLD.clearing.x, z - WORLD.clearing.z);
  if (meadow > 0) out.lerp(MEADOW, Math.min(1, meadow / 5) * 0.75);
  const lane = Math.min(Math.abs(x), Math.abs(z)) + patches(x * 0.35 + 40, z * 0.35) * 0.6;
  const road = Math.max(1 - smoothstep(2.6, 3.6, lane), 1 - smoothstep(WORLD.hub.radius + 1.5, WORLD.hub.radius + 2.5, Math.hypot(x, z)));
  if (road > 0) out.lerp(ROAD, road * 0.85);
  if (inland < 2.5) out.lerp(blendColors(weights, SHORE, shore), 1 - inland / 2.5);
  return out;
}

// Voxel column colours: the surface for its top, the biome's earth (tinted by the surface) for its walls.
export function columnColors(x, z, h, jitter, top, side) {
  groundColor(x, z, h, jitter, top);
  if (coastAt(x, z) <= Math.hypot(x, z)) return side.copy(top).multiplyScalar(0.8);
  return blendColors(biomeWeights(x, z), SOIL, side).lerp(top, 0.35);
}