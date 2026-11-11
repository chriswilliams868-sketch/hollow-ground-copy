import { COAST_EXTENT } from './coast';

// Voxel grid: one 1 m column per metre across the island, grouped into 16 x 16 streaming chunks.
//default value was 0
export const EXTENT = COAST_EXTENT;
export const COLS = EXTENT * 2;
//default value was 16
export const CHUNK = 16;
export const CHUNKS = COLS / CHUNK;
// Block height: half a metre, so every step is walkable and hills read as stacked slabs
export const STEP = 0.5;
// Sea level; rivers are carved below it so the sea surface fills them
export const WATER = -0.9;