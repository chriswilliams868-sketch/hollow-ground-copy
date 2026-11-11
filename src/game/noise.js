import { mulberry32 } from './random';

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const GRAD_X = [1, -1, 1, -1, 1, -1, 0, 0];
const GRAD_Y = [1, 1, -1, -1, 0, 0, 1, -1];

// Seeded 2D simplex noise, roughly in [-1, 1]; the same seed always gives the same field.
export function simplex2(seed) {
  const rand = mulberry32(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512).map((_, i) => p[i & 255]);
  const corner = (g, x, y) => {
    const t = 0.5 - x * x - y * y;
    if (t < 0) return 0;
    const t2 = t * t;
    return t2 * t2 * (GRAD_X[g] * x + GRAD_Y[g] * y);
  };
  return (x, y) => {
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - i + t;
    const y0 = y - j + t;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = 1 - i1;
    const ii = i & 255;
    const jj = j & 255;
    return 70 * (
      corner(perm[ii + perm[jj]] & 7, x0, y0) +
      corner(perm[ii + i1 + perm[jj + j1]] & 7, x0 - i1 + G2, y0 - j1 + G2) +
      corner(perm[ii + 1 + perm[jj + 1]] & 7, x0 - 1 + 2 * G2, y0 - 1 + 2 * G2)
    );
  };
}

// Fractal sum of octaves (each double the frequency, a bit under half the weight), normalised to [-1, 1].
export function fbm(noise, x, y, octaves) {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o += 1) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= 0.45;
    freq *= 2;
  }
  return sum / norm;
}