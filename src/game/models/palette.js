import * as THREE from 'three';

const color = new THREE.Color();
const other = new THREE.Color();
const hsl = { h: 0, s: 0, l: 0 };
const WARM = 0.12; // highlights drift toward gold
const COOL = 0.7; // shadows drift toward violet-blue
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Hue-shifted shade of a colour, pixel-art style: `amount` > 0 lightens it while drifting warm and a touch paler,
// < 0 darkens it while drifting cool and a touch richer. Greys only pick up a faint cast.
export function tone(hex, amount) {
  color.set(hex).getHSL(hsl, THREE.SRGBColorSpace);
  const target = amount > 0 ? WARM : COOL;
  const grey = hsl.s < 0.06;
  let dh = target - hsl.h;
  dh -= Math.round(dh);
  const h = grey ? target : hsl.h + Math.sign(dh) * Math.min(Math.abs(dh), Math.abs(amount) * 0.25);
  const s = grey ? hsl.s + Math.abs(amount) * 0.12 : hsl.s - amount * (amount > 0 ? 0.3 : 0.6);
  color.setHSL((h + 1) % 1, clamp01(s), clamp01(hsl.l + amount), THREE.SRGBColorSpace);
  return `#${color.getHexString()}`;
}

export const mixHex = (a, b, t) => `#${color.set(a).lerp(other.set(b), t).getHexString()}`;

// Stepped gradient (a few hard bands, like hand-placed voxels) from `from` to `to` over t = 0..1: pass it as the
// colour of a line, spike or graded sprite key.
export const grade = (from, to, steps = 4) => (t) => mixHex(from, to, Math.round(t * steps) / steps);