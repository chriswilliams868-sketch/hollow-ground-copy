import { mulberry32 } from './random';
import { perSeed, subSeed } from './seed';

// Organic continent outline: capes on the diagonals (guardian lairs), bays where the roads meet the sea,
// and layered sine noise (phases from the world seed) for a jagged, asymmetric shoreline.
const SHAPE = [[1, 1.8], [2, 2.2], [3, 1.6], [5, 1.8], [7, 1.2], [11, 0.8], [17, 0.5], [29, 0.3]];
const waves = perSeed(() => {
  const rand = mulberry32(subSeed(777));
  return SHAPE.map(([k, amp]) => ({ k, amp, phase: rand() * Math.PI * 2 }));
});

export const COAST_EXTENT = 120;
// Linear scale of the island (≈ double the original area)
const SCALE = 1.42;
export const SHORE_MARGIN = 2.4;

export function coastRadius(angle) {
  const lobes = Math.cos(4 * angle);
  let noise = 0;
  waves().forEach(({ k, amp, phase }) => {
    noise += amp * Math.sin(k * angle + phase);
  });
  return SCALE * (60 - 11 * lobes + noise * (0.6 + 0.4 * lobes));
}

export const coastAt = (x, z) => coastRadius(Math.atan2(z, x));
export const insideCoast = (x, z, margin = 0) => Math.hypot(x, z) < coastAt(x, z) - margin;

export function coastOutline(steps) {
  return Array.from({ length: steps }, (_, i) => {
    const angle = (i / steps) * Math.PI * 2;
    const r = coastRadius(angle);
    return [Math.cos(angle) * r, Math.sin(angle) * r];
  });
}