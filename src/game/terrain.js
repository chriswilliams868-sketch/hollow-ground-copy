import * as THREE from 'three';
import { simplex2, fbm } from './noise';
import { smoothstep } from './math';
import { coastAt } from './coast';
import { WORLD, QUADRANTS } from './worldData';
import { perSeed, subSeed, seedVersion } from './seed';
import { EXTENT, COLS, CHUNK, CHUNKS, STEP, WATER } from './grid';

// Neighbouring land columns differ by at most one block, gentler than the camera's view angle.
const MAX_RISE = 0.48;
// Columns of context around a chunk for the slope cap, so chunks agree along their borders
const BORDER = 12;
const W = CHUNK + BORDER * 2;
// Half-width of the ramp that carries walkers smoothly over a block edge
const EDGE = 0.14;
const RIVER_BED = -1.6;

const fields = perSeed(() => ({
  hills: simplex2(subSeed(4242)),
  warp: simplex2(subSeed(5501)),
  highland: simplex2(subSeed(6607)),
  river: simplex2(subSeed(7717)),
  bed: simplex2(subSeed(8803)),
}));

const away = (x, z, cx, cz, inner, outer) => smoothstep(inner, outer, Math.hypot(x - cx, z - cz));

// Level ground kept free of hills and rivers: the hub, the cottage clearing, every guardian lair and the Hollow Gateway.
function shelter(x, z) {
  const { clearing, lairRadius, gateway } = WORLD;
  let k = away(x, z, 0, 0, 7.5, 16) * away(x, z, clearing.x, clearing.z, clearing.radius + 0.5, clearing.radius + 9);
  QUADRANTS.forEach(({ lair }) => {
    k *= away(x, z, lair.x, lair.z, lairRadius + 2.5, lairRadius + 12);
  });
  return k * away(x, z, gateway.x, gateway.z, gateway.radius + 1.5, gateway.radius + 10);
}

// Continuous height before the slope cap: rolling hills, highland plateaus, river valleys, shore dip and seabed.
function rawHeight(x, z, inland) {
  const f = fields();
  if (inland <= 0) return -1.9 + Math.max(-1.5, inland * 0.3) + f.bed(x * 0.21, z * 0.21) * 0.25;
  const keep = shelter(x, z);
  const roads = 0.55 + 0.45 * smoothstep(3, 9, Math.min(Math.abs(x), Math.abs(z)));
  const k = keep * smoothstep(1.5, 11, inland) * roads;
  const wx = x + f.warp(x * 0.02, z * 0.02) * 8;
  const wz = z + f.warp(x * 0.02 + 41.7, z * 0.02 - 13.2) * 8;
  const n = fbm(f.hills, wx * 0.026, wz * 0.026, 3);
  const highland = smoothstep(0.2, 0.75, fbm(f.highland, x * 0.011, z * 0.011, 2));
  let h = (0.5 * n + 2.6 * smoothstep(-0.4, 0.8, n) + 2.4 * highland) * k;
  // Rivers wind along the zero line of a broad noise field, in valleys that level the hills around them
  const r = Math.abs(fbm(f.river, x * 0.0085 + 17.3, z * 0.0085 - 5.1, 2));
  const valley = (1 - smoothstep(0.05, 0.26, r)) * keep;
  const channel = (1 - smoothstep(0.022, 0.058, r)) * keep;
  h *= 1 - valley;
  h += (RIVER_BED - h) * channel;
  return h - Math.max(0, 1 - inland / 2.5) * 0.35;
}

// Lazily filled, per-chunk caches over the whole grid (cleared when the seed changes).
const raw = new Float32Array(COLS * COLS);
const land = new Uint8Array(COLS * COLS);
const top = new Float32Array(COLS * COLS);
const rawReady = new Uint8Array(CHUNKS * CHUNKS);
const topReady = new Uint8Array(CHUNKS * CHUNKS);
const scratch = new Float32Array(W * W);
const mask = new Uint8Array(W * W);
let cacheAt = -1;

function fillRaw(ci, cj) {
  for (let lz = 0; lz < CHUNK; lz += 1) {
    for (let lx = 0; lx < CHUNK; lx += 1) {
      const ix = ci * CHUNK + lx;
      const iz = cj * CHUNK + lz;
      const x = ix - EXTENT + 0.5;
      const z = iz - EXTENT + 0.5;
      const inland = coastAt(x, z) - Math.hypot(x, z);
      const i = ix + iz * COLS;
      land[i] = inland > 0 ? 1 : 0;
      raw[i] = rawHeight(x, z, inland);
    }
  }
  rawReady[ci + cj * CHUNKS] = 1;
}

// No land column may rise more than MAX_RISE per metre above a land neighbour (two chamfer sweeps).
const STEPS = [[-1, 0, MAX_RISE], [-1, -1, MAX_RISE * Math.SQRT2], [0, -1, MAX_RISE], [1, -1, MAX_RISE * Math.SQRT2]];
function capSlopes() {
  const n = W * W;
  [1, -1].forEach((dir) => {
    for (let k = 0; k < n; k += 1) {
      const i = dir > 0 ? k : n - 1 - k;
      if (!mask[i]) continue;
      const ix = i % W;
      const iz = (i - ix) / W;
      for (let s = 0; s < 4; s += 1) {
        const [dx, dz, rise] = STEPS[s];
        const qx = ix + dx * dir;
        const qz = iz + dz * dir;
        if (qx < 0 || qz < 0 || qx >= W || qz >= W) continue;
        const q = qx + qz * W;
        if (mask[q] && scratch[q] + rise < scratch[i]) scratch[i] = scratch[q] + rise;
      }
    }
  });
}

// Block tops for one chunk: slope-capped over a window reaching into its neighbours, then snapped to whole blocks.
function fillTop(ci, cj) {
  for (let b = cj - 1; b <= cj + 1; b += 1) {
    for (let a = ci - 1; a <= ci + 1; a += 1) {
      if (a >= 0 && b >= 0 && a < CHUNKS && b < CHUNKS && !rawReady[a + b * CHUNKS]) fillRaw(a, b);
    }
  }
  const x0 = ci * CHUNK - BORDER;
  const z0 = cj * CHUNK - BORDER;
  for (let wz = 0; wz < W; wz += 1) {
    for (let wx = 0; wx < W; wx += 1) {
      const ix = x0 + wx;
      const iz = z0 + wz;
      const k = wx + wz * W;
      const inside = ix >= 0 && iz >= 0 && ix < COLS && iz < COLS;
      scratch[k] = inside ? raw[ix + iz * COLS] : 0;
      mask[k] = inside ? land[ix + iz * COLS] : 0;
    }
  }
  capSlopes();
  for (let lz = 0; lz < CHUNK; lz += 1) {
    for (let lx = 0; lx < CHUNK; lx += 1) {
      const h = scratch[lx + BORDER + (lz + BORDER) * W];
      top[ci * CHUNK + lx + (cj * CHUNK + lz) * COLS] = Math.round(h / STEP) * STEP;
    }
  }
  topReady[ci + cj * CHUNKS] = 1;
}

// Height of the block top in grid column (ix, iz); columns past the grid edge repeat the edge.
export function columnTop(ix, iz) {
  if (cacheAt !== seedVersion()) {
    cacheAt = seedVersion();
    rawReady.fill(0);
    topReady.fill(0);
  }
  const cx = ix < 0 ? 0 : ix >= COLS ? COLS - 1 : ix;
  const cz = iz < 0 ? 0 : iz >= COLS ? COLS - 1 : iz;
  const ci = Math.floor(cx / CHUNK);
  const cj = Math.floor(cz / CHUNK);
  if (!topReady[ci + cj * CHUNKS]) fillTop(ci, cj);
  return top[cx + cz * COLS];
}

// Exact block top under a world point.
export const blockTop = (x, z) => columnTop(Math.floor(x + EXTENT), Math.floor(z + EXTENT));
// Under water: the sea, or a river channel.
export const isWet = (x, z) => blockTop(x, z) < WATER;

const ramp = (t) => smoothstep(0.5 - EDGE, 0.5 + EDGE, t);

// Walking height anywhere: flat on each block top, with a short ramp across block edges so steps aren't a snap.
// Off the island grid (the Hollow King's lair) the floor is level at 0.
export function groundHeight(x, z) {
  const fx = x + EXTENT - 0.5;
  const fz = z + EXTENT - 0.5;
  if (!(fx > -1 && fz > -1 && fx < COLS && fz < COLS)) return 0;
  const ix = Math.floor(fx);
  const iz = Math.floor(fz);
  const u = ramp(fx - ix);
  const v = ramp(fz - iz);
  const a = columnTop(ix, iz);
  const b = columnTop(ix + 1, iz);
  const c = columnTop(ix, iz + 1);
  const d = columnTop(ix + 1, iz + 1);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}

// Ground or water surface, whichever is higher: where dropped items and decals rest.
export const surfaceHeight = (x, z) => Math.max(groundHeight(x, z), WATER);

// Block tops are level, so decals and contact shadows lie flat.
export function groundNormal(x, z, out = new THREE.Vector3()) {
  return out.set(0, 1, 0);
}