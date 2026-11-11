import * as THREE from 'three';

// Opacity scenery fades to while it hides the hero, and how fast it fades either way (opacity per second).
export const SEE_THROUGH = 0.3;
const RATE = 3.2;

export const approach = (value, target, dt) => value + Math.sign(target - value) * Math.min(Math.abs(target - value), dt * RATE);

// See-through copies of scenery materials, pooled per source so their shader programs stay compiled between fades.
// They skip depth writes so whatever stands behind them still draws, and mark the stencil so the hero's silhouette
// can glow through them.
export class FadePool {
  constructor() {
    this.free = new Map();
    this.made = [];
  }

  acquire(source) {
    const spare = this.free.get(source)?.pop();
    if (spare) return spare;
    const material = source.clone();
    // Keep the source's shader patches (voxel surface shading)
    material.onBeforeCompile = source.onBeforeCompile;
    Object.assign(material, { transparent: true, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilZPass: THREE.ReplaceStencilOp });
    this.made.push(material);
    return material;
  }

  release(source, material) {
    if (!this.free.has(source)) this.free.set(source, []);
    this.free.get(source).push(material);
  }

  dispose() {
    this.made.forEach((material) => material.dispose());
    this.free.clear();
    this.made = [];
  }
}

// One faded object: its meshes draw with see-through copies of their materials (still following the source's live
// colour and glow, like the forge coals' flicker) until it is solid again, then get their own materials back.
export class Fade {
  constructor(meshes, pool, onRestore) {
    this.pool = pool;
    this.onRestore = onRestore;
    this.alpha = 1;
    this.copies = new Map();
    this.meshes = meshes.map((mesh) => {
      const source = mesh.material;
      if (!this.copies.has(source)) this.copies.set(source, pool.acquire(source));
      mesh.material = this.copies.get(source);
      return [mesh, source];
    });
  }

  // Eases toward see-through while `hiding`, back to solid otherwise; true once fully solid and restored.
  step(hiding, dt) {
    this.alpha = approach(this.alpha, hiding ? SEE_THROUGH : 1, dt);
    this.copies.forEach((copy, source) => {
      if (source.color) copy.color.copy(source.color);
      if (source.emissive) {
        copy.emissive.copy(source.emissive);
        copy.emissiveIntensity = source.emissiveIntensity;
      }
      copy.opacity = source.opacity * this.alpha;
    });
    if (hiding || this.alpha < 1) return false;
    this.meshes.forEach(([mesh, source]) => {
      mesh.material = source;
    });
    this.copies.forEach((copy, source) => this.pool.release(source, copy));
    this.onRestore?.();
    return true;
  }
}