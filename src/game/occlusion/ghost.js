import * as THREE from 'three';
import { approach } from './fades';

const GLOW = '#7ef5e0';
const STRENGTH = 0.5;
// The x-ray copy sits this much nearer the camera (no change on screen with the orthographic view), so floors the
// hero's boots barely dip into don't light it up
const LIFT = 0.1;

function ghostMesh(material, renderOrder, group) {
  const mesh = new THREE.Mesh(undefined, material);
  Object.assign(mesh, { renderOrder, matrixAutoUpdate: false, matrixWorldAutoUpdate: false, frustumCulled: false });
  group.add(mesh);
  return mesh;
}

// The hero's x-ray silhouette while scenery stands between it and the camera: a soft pulsing glow over every part of
// the hero something solid hides, and over the parts seen through faded scenery. Each hero mesh gets a pair of
// stand-ins that copy its shape and pose every frame.
export class HeroGhost {
  constructor(scene) {
    const glow = { color: GLOW, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 };
    // Drawn after the scenery but before the hero (which renders last), so it only lands where scenery is nearer
    this.hidden = new THREE.MeshBasicMaterial({ ...glow, depthFunc: THREE.GreaterDepth });
    // Drawn after faded scenery, on the hero's own surface wherever that scenery marked the stencil
    this.veiled = new THREE.MeshBasicMaterial({
      ...glow,
      transparent: true,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.EqualStencilFunc,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.group = new THREE.Group();
    this.group.visible = false;
    scene.add(this.group);
    this.pairs = [];
    this.strength = 0;
    this.time = 0;
  }

  // `toward`: unit vector from the scene toward the camera.
  update(player, occluded, toward, dt) {
    this.strength = approach(this.strength, occluded ? 1 : 0, dt * 1.5);
    this.group.visible = this.strength > 0.01;
    if (!this.group.visible) return;
    this.time += dt;
    const opacity = this.strength * STRENGTH * (0.85 + Math.sin(this.time * 4) * 0.15);
    this.hidden.opacity = opacity;
    this.veiled.opacity = opacity * 0.7;
    player.group.updateMatrixWorld(true);
    let n = 0;
    player.group.traverseVisible((part) => {
      if (!part.isMesh || part.material.transparent) return;
      part.renderOrder = 2;
      if (!this.pairs[n]) this.pairs[n] = [ghostMesh(this.hidden, 1, this.group), ghostMesh(this.veiled, 6, this.group)];
      this.pairs[n].forEach((ghost) => {
        ghost.geometry = part.geometry;
        ghost.matrixWorld.copy(part.matrixWorld);
        ghost.visible = true;
      });
      const m = this.pairs[n][0].matrixWorld.elements;
      m[12] += toward.x * LIFT;
      m[13] += toward.y * LIFT;
      m[14] += toward.z * LIFT;
      n += 1;
    });
    for (let i = n; i < this.pairs.length; i += 1) {
      this.pairs[i].forEach((ghost) => {
        ghost.visible = false;
      });
    }
  }
}