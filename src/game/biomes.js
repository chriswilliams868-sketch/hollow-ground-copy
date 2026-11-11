import { simplex2, fbm } from './noise';
import { smoothstep } from './math';
import { QUADRANTS } from './worldData';
import { perSeed, subSeed } from './seed';

const noise = perSeed(() => ({ drift: simplex2(subSeed(3131)), fray: simplex2(subSeed(9191)) }));
const BAND = 9;

// How much of each biome shows at (x, z), in QUADRANTS order (weights sum to 1). The quadrant borders
// are pushed around by broad noise so they meander, torn into fingers and stray islets by finer noise,
// then softened across a wide band so one biome bleeds into the next. Near the hub they stay put.
export function biomeWeights(x, z) {
  const { drift, fray } = noise();
  const r = Math.hypot(x, z);
  const reach = 6 + 26 * smoothstep(8, 40, r);
  const tear = 7 * smoothstep(10, 30, r);
  const wx = x + fbm(drift, x * 0.016, z * 0.016, 3) * reach + fray(x * 0.075, z * 0.075) * tear;
  const wz = z + fbm(drift, x * 0.016 + 31.7, z * 0.016 - 12.4, 3) * reach + fray(x * 0.075 - 21.3, z * 0.075 + 8.8) * tear;
  const ex = smoothstep(-BAND, BAND, wx);
  const ez = smoothstep(-BAND, BAND, wz);
  return QUADRANTS.map((q) => (q.sx > 0 ? ex : 1 - ex) * (q.sz > 0 ? ez : 1 - ez));
}

// The biome that dominates (x, z).
export function biomeAt(x, z) {
  const weights = biomeWeights(x, z);
  return QUADRANTS[weights.indexOf(Math.max(...weights))];
}

// Weighted mix of one colour per biome, written into `out`.
export function blendColors(weights, colors, out) {
  out.setRGB(0, 0, 0);
  weights.forEach((w, i) => {
    out.r += colors[i].r * w;
    out.g += colors[i].g * w;
    out.b += colors[i].b * w;
  });
  return out;
}