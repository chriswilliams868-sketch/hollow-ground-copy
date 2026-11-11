import * as THREE from 'three';
import { groundHeight } from './terrain';

// Spent brass: casings flick out of the gun toward `out`, tumble end over end, bounce off the ground and fade.
export function ejectShells(effects, origin, out, count) {
  const group = new THREE.Group();
  group.position.copy(origin);
  const floor = groundHeight(origin.x, origin.z) + 0.02 - origin.y;
  const geometry = new THREE.BoxGeometry(0.035, 0.035, 0.085);
  const material = new THREE.MeshStandardMaterial({ color: '#e0b43a', metalness: 0.7, roughness: 0.3, emissive: '#7a4e00', emissiveIntensity: 0.5, transparent: true });
  const velocities = [];
  for (let i = 0; i < count; i += 1) {
    const speed = 1.4 + Math.random() * 1.6;
    velocities.push(new THREE.Vector3(out.x * speed + (Math.random() - 0.5), 2 + Math.random() * 2, out.z * speed + (Math.random() - 0.5)));
    group.add(new THREE.Mesh(geometry, material));
  }
  effects.add(group, 1, (obj, p, dt) => {
    obj.children.forEach((shell, i) => {
      const v = velocities[i];
      v.y -= 15 * dt;
      shell.position.addScaledVector(v, dt);
      if (shell.position.y < floor) {
        shell.position.y = floor;
        v.set(v.x * 0.45, Math.abs(v.y) * 0.3, v.z * 0.45);
      }
      // Tumbling slows as the casing comes to rest
      const spin = v.length() * dt * 5;
      shell.rotation.x += spin;
      shell.rotation.z += spin * 0.7;
    });
    material.opacity = p > 0.7 ? (1 - p) / 0.3 : 1;
  });
}