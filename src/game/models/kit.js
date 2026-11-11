import * as THREE from 'three';

// PBR material with tuned defaults.
export const std = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2, ...options });

// Emissive glow channel (eyes, gems, runes) on a dark base.
export const glowing = (color, intensity = 1.6) =>
  new THREE.MeshStandardMaterial({ color: '#1b1220', emissive: color, emissiveIntensity: intensity, roughness: 0.35 });

export const metal = (color, roughness = 0.35, options = {}) => std(color, { metalness: 0.85, roughness, ...options });

// Glowing gem: coloured body that also emits.
export const gem = (color, intensity = 2.4) => std(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.12, metalness: 0.35, flatShading: true });

export function part(geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

export function node(x = 0, y = 0, z = 0, ...children) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  if (children.length) group.add(...children);
  return group;
}

export function rot(object, x = 0, y = 0, z = 0) {
  object.rotation.set(x, y, z);
  return object;
}

export function scl(object, x, y = x, z = x) {
  object.scale.set(x, y, z);
  return object;
}

// Limb running from the origin along +Z (base radius at the root).
export const limbZ = (base, tip, length, seg = 8, turns = 0) =>
  twist(new THREE.CylinderGeometry(tip, base, length, seg, turns ? 3 : 1), turns).rotateX(Math.PI / 2).translate(0, 0, length / 2);

// Limb hanging from the origin down along -Y.
export const limbDown = (base, tip, length, seg = 8, turns = 0) =>
  twist(new THREE.CylinderGeometry(base, tip, length, seg, turns ? 3 : 1), turns).translate(0, -length / 2, 0);

// Cone with its base at the origin, tip along +Z / -Y.
export const coneZ = (r, h, seg = 5) => new THREE.ConeGeometry(r, h, seg).rotateX(Math.PI / 2).translate(0, 0, h / 2);
export const coneDown = (r, h, seg = 5) => new THREE.ConeGeometry(r, h, seg).rotateX(Math.PI).translate(0, -h / 2, 0);

// Half dome (shoulder plates, helm tops).
export const dome = (r, seg = 12) => new THREE.SphereGeometry(r, seg, Math.max(4, seg / 2), 0, Math.PI * 2, 0, Math.PI / 2);

// Hood shell open at the front (+Z).
export const hood = (r) => new THREE.SphereGeometry(r, 16, 12, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0, Math.PI * 0.72);

// Cylinder between two points [x, y, z].
export function between(a, b, r1, r2, material, seg = 8) {
  const from = new THREE.Vector3(...a);
  const dir = new THREE.Vector3(...b).sub(from);
  const length = dir.length();
  const mesh = part(new THREE.CylinderGeometry(r2, r1, length, seg).translate(0, length / 2, 0), material, from.x, from.y, from.z);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

// Twists a geometry around Y by `perUnit` radians per unit of height (bark, roots).
export function twist(geometry, perUnit) {
  if (!perUnit) return geometry;
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const a = p.getY(i) * perUnit;
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), p.getY(i), x * Math.sin(a) + z * Math.cos(a));
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Deterministic radial jitter for jagged ice, rock and bark (shared vertices move together).
export function jag(geometry, amount) {
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    const k = 1 + ((h - Math.floor(h) - 0.5) * 2 * amount) / (Math.hypot(x, y, z) || 1);
    p.setXYZ(i, x * k, y * k, z * k);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Curved horn / antler: tapered segments, each bent by `bend` around `axis`.
export function horn(material, segments, bend, axis = 'z') {
  const root = new THREE.Group();
  let parent = root;
  let offset = 0;
  segments.forEach(([r, length], i) => {
    const seg = node(0, offset, 0);
    if (i) seg.rotation[axis] = bend;
    const geo = i === segments.length - 1 ? new THREE.ConeGeometry(r, length, 6) : new THREE.CylinderGeometry(r * 0.78, r, length, 6);
    seg.add(part(geo.translate(0, length / 2, 0), material));
    parent.add(seg);
    parent = seg;
    offset = length;
  });
  return root;
}

// Breathing glow for eyes, gems and runes.
export function pulse(material, base, amount, t, speed = 3) {
  material.emissiveIntensity = base + Math.sin(t * speed) * amount;
}