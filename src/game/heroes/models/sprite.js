import { voxGeometry, voxMat, voxMesh } from '../../models/voxel';
import { mixHex } from '../../models/palette';

// Sprite planes: drawn with columns across X and rows along Z (first row = far tip), extruded along Y.
const TURNS = {
  flat: (g) => g, // flat faces ±Y
  edge: (g) => g.rotateZ(Math.PI / 2), // columns run along Y (side profile), extruded along X
  face: (g) => g.rotateX(-Math.PI / 2).rotateY(Math.PI), // rows run up Y, extruded toward +Z (shields)
};

export const rep = (row, n) => Array(n).fill(row);
// Mirror a half row (first character = centre column) into a full symmetric row.
export const sym = (half) => half.slice(1).split('').reverse().join('') + half;

// Weapon finishes: `base` carries metal, wood and leather blocks; `glow` the edges, fullers and gems.
export function weaponMats(glow, intensity, metalness = 0.35) {
  return {
    base: voxMat({ roughness: 0.42, metalness }),
    glow: voxMat({ roughness: 0.3, metalness: 0.2, emissive: glow, emissiveIntensity: intensity }),
  };
}

// First and last row each palette key appears on (graded keys blend across that span).
function spans(rows) {
  const out = {};
  rows.forEach((row, r) => {
    for (const key of row) {
      if (!out[key]) out[key] = [r, r];
      out[key][1] = r;
    }
  });
  return out;
}

// Graded key colour [tip, base] at row r: a few hard bands from the first row it appears on to the last.
function graded([tip, base], [first, last], r) {
  const t = last > first ? (r - first) / (last - first) : 0;
  return mixHex(tip, base, Math.round(t * 5) / 5);
}

// Voxel-art weapon: each character of `rows` is a palette key [colour, depth, group = 'base', offset = 0]
// (unknown keys and null entries are empty); a colour given as [tip, base] grades along the rows (metal sheen).
// The row holding 'H' (or `grip`) sits on the hand; runs merge into blocks, rimmed with an edge highlight.
export function addSprite(pivot, rows, palette, mats, { unit, plane = 'flat', grip, z = 0 }) {
  const hand = grip ?? rows.findIndex((row) => row.includes('H'));
  const width = Math.max(...rows.map((row) => row.length));
  const span = spans(rows);
  const groups = {};
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; ) {
      let end = c;
      while (end + 1 < row.length && row[end + 1] === row[c]) end += 1;
      const entry = palette[row[c]];
      if (entry && entry[0]) {
        const [paint, depth = 1, group = 'base', offset = 0] = entry;
        const color = Array.isArray(paint) ? graded(paint, span[row[c]], r) : paint;
        (groups[group] = groups[group] || []).push([end - c + 1, depth, 1, (c + end + 1) / 2 - width / 2, offset, hand - r, color]);
      }
      c = end + 1;
    }
  });
  Object.entries(groups).forEach(([key, list]) => {
    const mesh = voxMesh(TURNS[plane](voxGeometry(list, unit, 'sprite')), mats[key]);
    mesh.position.z = z;
    pivot.add(mesh);
  });
}