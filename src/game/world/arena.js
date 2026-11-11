import * as THREE from 'three';
import { ARENA } from '../constants';
import { WORLD } from '../worldData';
import { occluder } from '../occlusion/occluder';

// The Hollow King's underground lair: a floating floor with the sealed arena at its centre.
export function buildArena(group, lair) {
  const center = new THREE.Vector3(lair.x, 0, lair.z);
  const radius = ARENA.radius;

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(WORLD.lair.floor + 1, WORLD.lair.floor + 2, 1, 40),
    new THREE.MeshStandardMaterial({ color: '#120d1c', roughness: 0.95, flatShading: true })
  );
  floor.position.copy(center).setY(-0.48);
  floor.receiveShadow = true;
  group.add(floor);

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshStandardMaterial({ color: '#171126', roughness: 0.9, metalness: 0.15 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.copy(center).setY(0.06);
  disc.receiveShadow = true;
  group.add(disc);

  const inner = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.52, radius * 0.56, 48),
    new THREE.MeshBasicMaterial({ color: '#e11d48', transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  inner.rotation.x = -Math.PI / 2;
  inner.position.copy(center).setY(0.1);
  group.add(inner);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#ff2d55', transparent: true, opacity: 0.75 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.1, 6, 64), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(center).setY(0.14);
  group.add(ring);

  const marker = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.5, radius - 0.15, 56),
    new THREE.MeshBasicMaterial({ color: '#ff2d55', transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.copy(center).setY(0.11);
  group.add(marker);

  const gateMaterial = new THREE.MeshStandardMaterial({ color: '#40204a', emissive: '#e11d48', emissiveIntensity: 0.55, roughness: 0.7, metalness: 0.35 });
  const gates = [];
  const gateCount = 12;
  for (let i = 0; i < gateCount; i += 1) {
    const angle = (i / gateCount) * Math.PI * 2;
    const gate = new THREE.Mesh(new THREE.BoxGeometry((radius * 2 * Math.PI) / gateCount - 0.22, 3, 0.45), gateMaterial);
    gate.position.set(center.x + Math.cos(angle) * radius, 0.1, center.z + Math.sin(angle) * radius);
    gate.rotation.y = -angle;
    gate.scale.y = 0.001;
    gate.castShadow = true;
    group.add(occluder(gate));
    gates.push(gate);
  }

  const obeliskMat = new THREE.MeshStandardMaterial({ color: '#241a33', emissive: '#e11d48', emissiveIntensity: 0.35, roughness: 0.6, flatShading: true });
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2 + 0.3;
    const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.6, 4), obeliskMat);
    obelisk.position.set(center.x + Math.cos(angle) * (radius + 2.5), 1.3, center.z + Math.sin(angle) * (radius + 2.5));
    obelisk.castShadow = true;
    group.add(occluder(obelisk));
  }

  return {
    center,
    active: false,
    gateProgress: 0,
    activate() {
      this.active = true;
    },
    reset() {
      this.active = false;
      this.gateProgress = 0;
      gates.forEach((gate) => {
        gate.scale.y = 0.001;
      });
    },
    update(time, dt) {
      ringMaterial.opacity = 0.5 + Math.sin(time * 2.2) * 0.2;
      marker.material.opacity = this.active ? 0.15 : 0.32 + Math.sin(time * 3) * 0.16;
      const target = this.active ? 1 : 0;
      if (Math.abs(this.gateProgress - target) > 0.001) {
        this.gateProgress += Math.sign(target - this.gateProgress) * dt * 1.6;
        this.gateProgress = Math.max(0, Math.min(target, this.gateProgress));
        gates.forEach((gate, i) => {
          const delay = 1 - Math.min(1, Math.max(0, this.gateProgress * 2.4 - i * 0.12));
          gate.scale.y = Math.max(0.001, 1 - delay);
        });
      }
    },
  };
}