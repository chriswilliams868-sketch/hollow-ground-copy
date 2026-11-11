import * as THREE from 'three';
import { surfaceHeight } from './terrain';

// Gold coins: burst out of a fallen foe, bounce, then magnetise to the player (always after a few seconds).
const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 14).rotateX(Math.PI / 2);
const tmp = new THREE.Vector3();
const MAGNET = 8;

export class Coins {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.material = new THREE.MeshStandardMaterial({ color: '#ffcf4d', emissive: '#b8860b', emissiveIntensity: 0.9, metalness: 0.9, roughness: 0.3 });
  }

  // total gold split across `count` coins (the first carries the remainder).
  spawn(position, total, count) {
    const each = Math.floor(total / count);
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.position.set(position.x, surfaceHeight(position.x, position.z) + 0.8, position.z);
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      const vel = new THREE.Vector3(Math.cos(angle) * speed, 3.5 + Math.random() * 2, Math.sin(angle) * speed);
      this.scene.add(mesh);
      this.items.push({ mesh, vel, age: 0, value: i === 0 ? total - each * (count - 1) : each });
    }
  }

  update(dt, target, onCollect) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      const mesh = item.mesh;
      item.age += dt;
      mesh.rotation.y += dt * 8;
      tmp.set(target.x, target.y + 0.9, target.z).sub(mesh.position);
      const distance = tmp.length();
      if (item.age > 0.6 && (distance < MAGNET || item.age > 2.5)) {
        if (distance < 0.5) {
          this.scene.remove(mesh);
          this.items.splice(i, 1);
          onCollect(item.value);
          continue;
        }
        mesh.position.addScaledVector(tmp.normalize(), Math.min(distance, (6 + item.age * 14) * dt));
        continue;
      }
      item.vel.y -= 14 * dt;
      mesh.position.addScaledVector(item.vel, dt);
      const floor = surfaceHeight(mesh.position.x, mesh.position.z) + 0.15;
      if (mesh.position.y < floor) {
        mesh.position.y = floor;
        item.vel.set(item.vel.x * 0.6, Math.abs(item.vel.y) * 0.35, item.vel.z * 0.6);
      }
    }
  }

  clear() {
    this.items.forEach((item) => this.scene.remove(item.mesh));
    this.items = [];
  }
}