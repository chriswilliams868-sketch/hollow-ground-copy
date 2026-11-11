import * as THREE from 'three';
import { RARITIES } from './items';
import { GEMS } from './worldData';
import { surfaceHeight } from './terrain';
import { slopeQuaternion } from './grounding';

const glow = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });

const flaskGeo = new THREE.SphereGeometry(0.2, 12, 10);
const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.16, 8);
const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 6, 1, true);
const gearGeo = new THREE.BoxGeometry(0.14, 0.14, 0.62);
const gemGeo = new THREE.OctahedronGeometry(0.42, 0);
const ringGeo = new THREE.RingGeometry(0.42, 0.55, 24).rotateX(-Math.PI / 2);

// World pickups (potions, gear, gemstones) collected by walking over them.
export class Loot {
  constructor(engine) {
    this.engine = engine;
    this.items = [];
    this.mats = {};
  }

  mat(key, make) {
    if (!this.mats[key]) this.mats[key] = make();
    return this.mats[key];
  }

  build(kind, data) {
    const group = new THREE.Group();
    const bob = new THREE.Group();
    group.add(bob);
    let color = '#ef4444';
    if (kind === 'potion') {
      const flask = new THREE.Mesh(flaskGeo, this.mat('potion', () => new THREE.MeshStandardMaterial({ color, emissive: '#dc2626', emissiveIntensity: 1.2, roughness: 0.3 })));
      flask.position.y = 0.5;
      const neck = new THREE.Mesh(neckGeo, this.mat('glass', () => new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.2, metalness: 0.4 })));
      neck.position.y = 0.74;
      bob.add(flask, neck);
    } else {
      const key = kind === 'gear' ? data.rarity : data;
      color = kind === 'gear' ? RARITIES[data.rarity].color : GEMS[data].color;
      const solid = this.mat(`solid-${key}`, () => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: kind === 'gem' ? 2.4 : 1.4, flatShading: true }));
      const mesh = new THREE.Mesh(kind === 'gear' ? gearGeo : gemGeo, solid);
      mesh.position.y = kind === 'gear' ? 0.6 : 1.2;
      if (kind === 'gear') mesh.rotation.z = 0.6;
      else mesh.scale.y = 1.4;
      const beam = new THREE.Mesh(beamGeo, this.mat(`beam-${key}`, () => glow(color, 0.45)));
      beam.position.y = 1.5;
      if (kind === 'gem') beam.scale.set(3, 1.4, 3);
      bob.add(mesh);
      group.add(beam);
    }
    const ring = new THREE.Mesh(ringGeo, this.mat(`ring-${color}`, () => glow(color, 0.7)));
    group.add(ring);
    return { group, bob, ring };
  }

  spawn(kind, data, position, spread = 1.4) {
    const { group, bob, ring } = this.build(kind, data);
    const x = position.x + (Math.random() - 0.5) * spread;
    const z = position.z + (Math.random() - 0.5) * spread;
    group.position.set(x, surfaceHeight(x, z) + 0.05, z);
    slopeQuaternion(x, z, ring.quaternion);
    this.engine.scene.add(group);
    this.items.push({ kind, data, group, bob, age: 0 });
  }

  update(dt) {
    const player = this.engine.player;
    const pos = player.group.position;
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      item.age += dt;
      item.bob.position.y = Math.sin(item.age * 3) * 0.1;
      item.bob.rotation.y += dt * 1.8;
      if (item.age < 0.6 || player.dead) continue;
      if (Math.hypot(item.group.position.x - pos.x, item.group.position.z - pos.z) > 1.3) continue;
      if (this.engine.collectLoot(item)) {
        this.engine.scene.remove(item.group);
        this.items.splice(i, 1);
      }
    }
  }

  clear() {
    this.items.forEach((item) => this.engine.scene.remove(item.group));
    this.items = [];
  }
}