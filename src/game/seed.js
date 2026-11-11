// The world seed: every procedural layer (coast, biomes, terrain, rivers, sites, props, camps) derives from it.
const KEY = 'hollow-ground-world-v1';
let seed = 20261106;
let version = 0;

export const worldSeed = () => seed;
export const seedVersion = () => version;

export function setWorldSeed(value) {
  seed = value >>> 0;
  version += 1;
}

// Stable sub-seed for one layer of the world; `salt` keeps the layers independent of each other.
export function subSeed(salt) {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(salt, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return h >>> 0;
}

// Memoises `build` for the current seed and re-runs it after the seed changes.
export function perSeed(build) {
  let at = -1;
  let value;
  return () => {
    if (at !== version) {
      at = version;
      value = build();
    }
    return value;
  };
}

export const randomSeed = () => 100000000 + Math.floor(Math.random() * 900000000);

// Seed and discoveries live under their own key beside the hero save, so the save format is untouched.
export function loadWorldRecord() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    return data && Number.isFinite(data.seed) ? data : null;
  } catch {
    return null;
  }
}

export function storeWorldRecord(record) {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // Storage blocked (private mode): the world simply isn't remembered
  }
}