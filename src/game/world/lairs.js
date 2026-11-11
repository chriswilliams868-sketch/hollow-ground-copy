import * as THREE from 'three';
import { GEMS, QUADRANTS, WORLD } from '../worldData';
import { occluder } from '../occlusion/occluder';

// Guardian lairs: a glowing sigil circle that raises a barrier wall while its guardian fights.
export function buildLairs(group) {
  const lairs = {};
  QUADRANTS.forEach((q) => {
    const color = GEMS[q.gem].color;
    const { x, z } = q.lair;
    const r = WORLD.lairRadius;

    const floor = new THREE.Mesh(new THREE.CircleGeometry(r + 0.5, 40), new THREE.MeshStandardMaterial({ color: '#15111f', roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(x, 0.05, z);
    floor.receiveShadow = true;

    const sigilMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
    const sigil = new THREE.Mesh(new THREE.RingGeometry(r - 0.5, r - 0.15, 56), sigilMat);
    sigil.rotation.x = -Math.PI / 2;
    sigil.position.set(x, 0.09, z);
    const inner = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.45, 6), sigilMat);
    inner.rotation.x = -Math.PI / 2;
    inner.position.set(x, 0.1, z);

    const wallMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 2.6, 48, 1, true), wallMat);
    wall.position.set(x, 1.3, z);
    wall.visible = false;
    group.add(floor, sigil, inner, wall);

    const obeliskMat = new THREE.MeshStandardMaterial({ color: '#1a1526', emissive: color, emissiveIntensity: 0.5, flatShading: true });
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 4), obeliskMat);
      obelisk.position.set(x + Math.cos(angle) * (r + 1.2), 1.2, z + Math.sin(angle) * (r + 1.2));
      obelisk.castShadow = true;
      group.add(occluder(obelisk));
    }

    lairs[q.gem] = {
      active: false,
      setActive(value) {
        this.active = value;
        wall.visible = value;
      },
      update(time) {
        sigilMat.opacity = this.active ? 0.75 : 0.3 + Math.sin(time * 2 + x) * 0.12;
        inner.rotation.z = time * 0.4;
        if (this.active) wallMat.opacity = 0.18 + Math.sin(time * 5) * 0.06;
      },
    };
  });
  return lairs;
}