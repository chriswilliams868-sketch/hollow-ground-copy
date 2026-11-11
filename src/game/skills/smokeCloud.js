import * as THREE from 'three';
import { applyStatus } from '../status';
import { targetsNear } from '../targets';
import { elementProc } from '../procs';
import { ELEMENTS } from '../elements';
import { settle } from '../grounding';

// A lingering toxic cloud: anything inside is poisoned for 5s and slowed by 30% (plus bleed with a katana).
// The equipped weapon's element hits each enemy the first time the cloud touches it.
export function smokeCloud(engine, position, { radius, duration, dps, bleed = 0 }) {
  const element = engine.affix ? ELEMENTS[engine.affix.element] : null;
  const touched = new Set();
  const group = new THREE.Group();
  settle(group, position.x, position.z);
  const gas = new THREE.MeshStandardMaterial({
    color: '#3f6212', emissive: '#4ade80', emissiveIntensity: 0.35, transparent: true, opacity: 0, roughness: 1, depthWrite: false, flatShading: true,
  });
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const puffs = Array.from({ length: 11 }, (_, i) => {
    const angle = (i / 11) * Math.PI * 2 + Math.random();
    const dist = i === 0 ? 0 : radius * (0.25 + Math.random() * 0.5);
    const mesh = new THREE.Mesh(geometry, gas);
    mesh.userData = { size: radius * (0.32 + Math.random() * 0.2), spin: (Math.random() - 0.5) * 0.8, bob: Math.random() * 6 };
    mesh.position.set(Math.cos(angle) * dist, mesh.userData.size * 0.6, Math.sin(angle) * dist);
    group.add(mesh);
    return mesh;
  });
  const ringMat = new THREE.MeshBasicMaterial({ color: element?.color || '#4ade80', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(radius - 0.15, radius, 40), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.08;
  group.add(ring);
  engine.scene.add(group);

  let age = 0;
  let tick = 0;
  return {
    update(dt) {
      age += dt;
      const alpha = Math.max(0, Math.min(age / 0.3, (duration - age) / 0.6, 1));
      gas.opacity = 0.55 * alpha;
      ringMat.opacity = 0.5 * alpha;
      puffs.forEach((puff) => {
        const { size, spin, bob } = puff.userData;
        puff.scale.setScalar(size * (0.6 + 0.4 * Math.min(1, age / 0.3) + 0.08 * Math.sin(age * 2 + bob)));
        puff.rotation.y += spin * dt;
      });
      tick -= dt;
      if (tick <= 0) {
        tick = 0.25;
        targetsNear(engine, group.position, radius).forEach((actor) => {
          applyStatus(actor, 'poison', { time: 5, dps });
          applyStatus(actor, 'slow', { time: 5, amount: 0.3 });
          if (bleed) applyStatus(actor, 'bleed', { time: 5, dps: bleed });
          if (touched.has(actor)) return;
          touched.add(actor);
          elementProc(engine, actor, dps * 3, true);
        });
      }
      return age < duration;
    },
    dispose() {
      engine.scene.remove(group);
      geometry.dispose();
      gas.dispose();
      ring.geometry.dispose();
      ringMat.dispose();
    },
  };
}