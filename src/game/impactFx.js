import * as THREE from 'three';
import { groundHeight } from './terrain';
import { above, settle } from './grounding';

// Ground-shattering slam: jagged cracks race out across the ground and slabs of earth heave up, tumble and fall back.
export function groundShatter(effects, point, facing) {
  const cracks = new THREE.Group();
  const crackMat = new THREE.MeshBasicMaterial({ color: '#1c130c', transparent: true, opacity: 0.8, depthWrite: false });
  for (let i = 0; i < 7; i += 1) {
    const length = 0.9 + Math.random() * 1.5;
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, length).translate(0, 0, length / 2), crackMat);
    crack.rotation.y = facing + (i / 7) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    cracks.add(crack);
  }
  settle(cracks, point.x, point.z, 0.03);
  effects.add(cracks, 1.2, (obj, p) => {
    obj.children.forEach((crack) => crack.scale.set(1, 1, Math.min(1, p * 9)));
    crackMat.opacity = p < 0.7 ? 0.8 : (0.8 * (1 - p)) / 0.3;
  });

  const slabs = new THREE.Group();
  slabs.position.set(point.x, groundHeight(point.x, point.z), point.z);
  const slabMat = new THREE.MeshStandardMaterial({ color: '#6f5a44', roughness: 1, flatShading: true, transparent: true });
  const velocities = [];
  for (let i = 0; i < 9; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.3 + Math.random() * 1.1;
    const out = 0.8 + Math.random() * 1.6;
    const size = 0.16 + Math.random() * 0.2;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.7, size), slabMat);
    slab.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    velocities.push(new THREE.Vector3(Math.cos(angle) * out, 3.2 + Math.random() * 3, Math.sin(angle) * out));
    slabs.add(slab);
  }
  effects.add(slabs, 0.9, (obj, p, dt) => {
    obj.children.forEach((slab, i) => {
      const v = velocities[i];
      v.y -= 17 * dt;
      slab.position.addScaledVector(v, dt);
      if (slab.position.y < 0) {
        slab.position.y = 0;
        v.set(v.x * 0.3, Math.abs(v.y) * 0.2, v.z * 0.3);
      }
      slab.rotation.x += v.length() * dt * 1.5;
      slab.rotation.z += v.length() * dt;
    });
    slabMat.opacity = p > 0.65 ? (1 - p) / 0.35 : 1;
  });
}

// Ground slam: dirt clods kicked up with gravity and bounce, a dust ring, smoke and a spark flash.
export function dirtBurst(effects, point) {
  const group = new THREE.Group();
  group.position.set(point.x, groundHeight(point.x, point.z) + 0.1, point.z);
  const material = new THREE.MeshStandardMaterial({ color: '#5b4630', roughness: 1, flatShading: true, transparent: true });
  const geometry = new THREE.DodecahedronGeometry(0.09, 0);
  const velocities = [];
  for (let i = 0; i < 14; i += 1) {
    const mesh = new THREE.Mesh(geometry, material);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.6 + Math.random() * 3.4;
    mesh.scale.setScalar(0.6 + Math.random());
    velocities.push(new THREE.Vector3(Math.cos(angle) * speed, 3 + Math.random() * 3.5, Math.sin(angle) * speed));
    group.add(mesh);
  }
  effects.add(group, 0.75, (obj, p, dt) => {
    obj.children.forEach((child, i) => {
      const v = velocities[i];
      v.y -= 16 * dt;
      child.position.addScaledVector(v, dt);
      if (child.position.y < 0) {
        child.position.y = 0;
        v.multiplyScalar(0.3);
      }
      child.rotation.x += dt * 8;
    });
    material.opacity = p > 0.6 ? (1 - p) / 0.4 : 1;
  });
  for (let i = 0; i < 4; i += 1) effects.smoke(point);
  effects.ring(point, 2.2, '#c9a27a', 0.35);
  effects.spark(above(point, 0.3), '#ffd27a');
}