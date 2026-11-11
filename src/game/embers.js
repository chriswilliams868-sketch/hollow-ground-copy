import * as THREE from 'three';
import { surfaceHeight } from './terrain';

// Glowing XP orbs: burst out of a fallen enemy, then home in on the player carrying their XP value.
const geometry = new THREE.OctahedronGeometry(0.16, 0);
const tmp = new THREE.Vector3();

export class Embers {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.material = new THREE.MeshBasicMaterial({
      color: '#5eead4',
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  spawn(position, count, value = 0) {
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.position.set(position.x, surfaceHeight(position.x, position.z) + 1, position.z);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 5, 3 + Math.random() * 2, (Math.random() - 0.5) * 5);
      this.scene.add(mesh);
      this.items.push({ mesh, vel, age: 0, value });
    }
  }

  update(dt, target, onCollect) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      const mesh = item.mesh;
      item.age += dt;
      if (item.age < 0.55) {
        item.vel.y -= 12 * dt;
        mesh.position.addScaledVector(item.vel, dt);
        const floor = surfaceHeight(mesh.position.x, mesh.position.z) + 0.4;
        if (mesh.position.y < floor) {
          mesh.position.y = floor;
          item.vel.y = Math.abs(item.vel.y) * 0.4;
        }
      } else {
        tmp.set(target.x, target.y + 1, target.z).sub(mesh.position);
        const distance = tmp.length();
        if (distance < 0.5) {
          this.scene.remove(mesh);
          this.items.splice(i, 1);
          onCollect(item.value);
          continue;
        }
        mesh.position.addScaledVector(tmp.normalize(), Math.min(distance, (4 + item.age * 12) * dt));
      }
      mesh.rotation.y += dt * 6;
      mesh.scale.setScalar(0.8 + Math.sin(item.age * 12) * 0.2);
    }
  }

  clear() {
    this.items.forEach((item) => this.scene.remove(item.mesh));
    this.items = [];
  }
}