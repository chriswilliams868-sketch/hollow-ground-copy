// North is -Z, east is +X. The crossroads hub sits at the origin.
// Guardian lairs and the Hollow Gateway are re-placed from the world seed (see sites.js).
export const WORLD = {
  half: 85,
  // Starting hub: Hearthwood Cottage in a green clearing at the edge of the Dark Forest
  spawn: { x: -8.5, z: -8.5 },
  clearing: { x: -11.5, z: -11.5, radius: 9.5 },
  cottage: { x: -14.5, z: -13.5 },
  forge: { x: -9.6, z: -15.4 },
  gerald: { x: -10.4, z: -13, facing: 0.9 },
  hub: { x: 0, z: 0, radius: 5 },
  lairRadius: 9,
  // Hollow Gateway Ruins: the way down to the Hollow King, hidden in one chunk of a biome drawn for each world
  gateway: { x: 40, z: 40, radius: 6 },
  // Far out past the sea, so the island never shows from the underground lair
  lair: { x: 0, z: 220, floor: 13, arrive: { x: 0, z: 230 } },
};

export const GEMS = {
  emerald: { name: 'Emerald Gemstone', color: '#34d399' },
  ruby: { name: 'Ruby Gemstone', color: '#f43f5e' },
  sapphire: { name: 'Sapphire Gemstone', color: '#60a5fa' },
  obsidian: { name: 'Obsidian Gemstone', color: '#a78bfa' },
};
export const GEM_ORDER = ['emerald', 'ruby', 'sapphire', 'obsidian'];

export const QUADRANTS = [
  {
    id: 'forest', name: 'Dark Forest', dir: 'North-West', sx: -1, sz: -1, levels: [1, 10],
    enemies: ['forest_stalker', 'wooden_treant'], ground: '#1c3324', tint: '#2f5a3c', gem: 'emerald',
    high: '#4f7a45', shore: '#2d3a30', fog: '#060e0b', sky: '#7f9df0',
    guardian: { name: 'Emerald Guardian', body: '#065f46', glow: '#10b981', core: '#34d399' },
  },
  {
    id: 'desert', name: 'Desert Wastes', dir: 'North-East', sx: 1, sz: -1, levels: [10, 20],
    enemies: ['sand_marauder', 'dune_crawler'], ground: '#6b5434', tint: '#8a6d43', gem: 'ruby',
    high: '#b8956a', shore: '#a08458', fog: '#120b07', sky: '#d0a088',
    guardian: { name: 'Ruby Guardian', body: '#7f1d1d', glow: '#e11d48', core: '#f43f5e' },
  },
  {
    id: 'tundra', name: 'Frost Tundra', dir: 'South-West', sx: -1, sz: 1, levels: [20, 30],
    enemies: ['frost_revenant', 'glacial_golem'], ground: '#7d93ab', tint: '#a9bdd1', gem: 'sapphire',
    high: '#e4edf6', shore: '#b7c7d8', fog: '#09101a', sky: '#a3c4ff',
    guardian: { name: 'Sapphire Guardian', body: '#1e3a8a', glow: '#3b82f6', core: '#60a5fa' },
  },
  {
    id: 'ruins', name: 'Shadow Ruins', dir: 'South-East', sx: 1, sz: 1, levels: [30, 40],
    enemies: ['void_cultist', 'shadow_abomination'], ground: '#241c36', tint: '#33284d', gem: 'obsidian',
    high: '#4c3f6b', shore: '#2b2340', fog: '#0c0716', sky: '#9a74ff',
    guardian: { name: 'Obsidian Guardian', body: '#1c1528', glow: '#7c3aed', core: '#a78bfa' },
  },
];

// Guardian lair in the far corner of each quadrant.
QUADRANTS.forEach((q) => {
  q.lair = { x: q.sx * 55, z: q.sz * 55 };
});