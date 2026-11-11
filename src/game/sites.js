import { QUADRANTS, WORLD } from './worldData';
import { coastRadius, coastAt } from './coast';
import { biomeWeights } from './biomes';
import { mulberry32 } from './random';
import { setWorldSeed, subSeed } from './seed';
import { EXTENT, CHUNK, CHUNKS } from './grid';

// Each guardian lair goes out toward its quadrant's cape, deep inside its own biome.
function placeLairs() {
  const rand = mulberry32(subSeed(1201));
  QUADRANTS.forEach((q, i) => {
    const cape = Math.atan2(q.sz, q.sx);
    let spot = null;
    for (let n = 0; n < 60 && !spot; n += 1) {
      const angle = cape + (rand() - 0.5) * 0.7;
      const r = coastRadius(angle) * (0.6 + rand() * 0.16);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      if (biomeWeights(x, z)[i] > 0.8) spot = { x, z };
    }
    q.lair = spot || { x: q.sx * 55, z: q.sz * 55 };
  });
}

// The Hollow Gateway Ruins: each world draws one of the four biomes, then the centre of one random chunk deep inside
// it, away from the hub, the shore and every guardian lair.
function placeGateway() {
  const rand = mulberry32(subSeed(1301));
  const home = Math.floor(rand() * QUADRANTS.length);
  const options = QUADRANTS.map(() => []);
  for (let cj = 0; cj < CHUNKS; cj += 1) {
    for (let ci = 0; ci < CHUNKS; ci += 1) {
      const x = -EXTENT + ci * CHUNK + CHUNK / 2;
      const z = -EXTENT + cj * CHUNK + CHUNK / 2;
      if (Math.hypot(x, z) < 30 || coastAt(x, z) - Math.hypot(x, z) < 18) continue;
      if (QUADRANTS.some(({ lair }) => Math.hypot(x - lair.x, z - lair.z) < WORLD.lairRadius + 18)) continue;
      const biome = biomeWeights(x, z).findIndex((w) => w >= 0.85);
      if (biome >= 0) options[biome].push({ x, z });
    }
  }
  // Should the drawn biome have no room, any other biome will do
  const pool = options[home].length ? options[home] : options.flat();
  Object.assign(WORLD.gateway, pool.length ? pool[Math.floor(rand() * pool.length)] : { x: 40, z: 40 });
}

// Switch the whole world to `seed`; the noise layers rebuild lazily, the sites are placed right away.
export function applyWorldSeed(seed) {
  setWorldSeed(seed);
  placeLairs();
  placeGateway();
}