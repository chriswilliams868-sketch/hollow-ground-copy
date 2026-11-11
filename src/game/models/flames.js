import * as THREE from 'three';
import { softDot } from './textures';

const HOT = new THREE.Color('#ff6a1f');
const DARK = new THREE.Color('#5c0a0a');

// Pooled additive flame sprites in world space (Hollow King phase II aura and sword trails).
export class Flames {
  constructor(scene, count = 110) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.items = [];
    this.next = 0;
    for (let i = 0; i < count; i += 1) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: softDot(), color: '#ff4d1f', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      sprite.visible = false;
      this.group.add(sprite);
      this.items.push({ sprite, life: 0, max: 1, size: 1, vel: new THREE.Vector3() });
    }
    scene.add(this.group);
  }

  emit(position, { size = 0.5, life = 0.8, rise = 2, spread = 0.5 } = {}) {
    const p = this.items[this.next];
    this.next = (this.next + 1) % this.items.length;
    p.sprite.position.copy(position);
    p.vel.set((Math.random() - 0.5) * spread, rise * (0.7 + Math.random() * 0.6), (Math.random() - 0.5) * spread);
    p.max = life * (0.7 + Math.random() * 0.6);
    p.life = p.max;
    p.size = size * (0.7 + Math.random() * 0.6);
    p.sprite.visible = true;
  }

  update(dt) {
    this.items.forEach((p) => {
      if (p.life <= 0) return;
      p.life -= dt;
      if (p.life <= 0) {
        p.sprite.visible = false;
        return;
      }
      const k = 1 - p.life / p.max;
      p.sprite.position.addScaledVector(p.vel, dt);
      p.sprite.scale.setScalar(p.size * (1 - k * 0.55) * Math.min(1, k * 7));
      p.sprite.material.color.lerpColors(HOT, DARK, k);
      p.sprite.material.opacity = 1 - k;
    });
  }

  dispose() {
    this.scene.remove(this.group);
    this.items.forEach((p) => p.sprite.material.dispose());
  }
}