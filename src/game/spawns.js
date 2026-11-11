import { mulberry32 } from './random';
import { insideCoast } from './coast';
import { biomeAt } from './biomes';
import { isWet } from './terrain';
import { perSeed, subSeed } from './seed';
import { WORLD, QUADRANTS } from './worldData';

const PER_BIOME = 14;

// Enemy camps on dry ground inside each biome's own (irregular) territory, re-rolled for every world seed.
// Level rises with distance from the hub, topping out just below the guardian.
export const enemySpawns = perSeed(() => {
  const rand = mulberry32(subSeed(4044));
  const taken = [];
  const { clearing, gateway, lairRadius } = WORLD;
  return QUADRANTS.flatMap((q) => {
    const spots = [];
    let attempts = 0;
    while (spots.length < PER_BIOME && attempts < 2000) {
      attempts += 1;
      const x = q.sx * (4 + rand() * 96);
      const z = q.sz * (4 + rand() * 96);
      if (Math.hypot(x, z) < 14 || !insideCoast(x, z, 6) || biomeAt(x, z) !== q) continue;
      if (Math.hypot(x - q.lair.x, z - q.lair.z) < lairRadius + 4) continue;
      if (Math.hypot(x - clearing.x, z - clearing.z) < clearing.radius + 6) continue;
      if (Math.hypot(x - gateway.x, z - gateway.z) < gateway.radius + 8) continue;
      if (taken.some((s) => Math.hypot(s.x - x, s.z - z) < 9) || isWet(x, z)) continue;
      const t = Math.min(1, Math.hypot(x, z) / 99);
      const [lo, hi] = q.levels;
      const spot = { x, z, level: Math.min(hi - 1, lo + Math.floor(t * (hi - lo))), type: q.enemies[spots.length % 2] };
      spots.push(spot);
      taken.push(spot);
    }
    return spots;
  });
});