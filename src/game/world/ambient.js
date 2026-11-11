import * as THREE from 'three';

const COUNT = 220;
const SPAN = 52;

// Drifting embers that wrap around the camera focus so the air is always alive.
export function buildAmbient(rand) {
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i += 1) {
    positions[i * 3] = (rand() - 0.5) * SPAN;
    positions[i * 3 + 1] = rand() * 14;
    positions[i * 3 + 2] = (rand() - 0.5) * SPAN;
    speeds[i] = 0.25 + rand() * 0.7;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: '#ff9a5a', size: 0.14, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  points.frustumCulled = false;

  const wrap = (value, center) => {
    if (value - center > SPAN / 2) return value - SPAN;
    if (value - center < -SPAN / 2) return value + SPAN;
    return value;
  };

  return {
    points,
    update(time, dt, focus) {
      for (let i = 0; i < COUNT; i += 1) {
        positions[i * 3 + 1] += speeds[i] * dt;
        positions[i * 3] = wrap(positions[i * 3] + Math.sin(time * 0.6 + i) * dt * 0.15, focus.x);
        positions[i * 3 + 2] = wrap(positions[i * 3 + 2], focus.z);
        if (positions[i * 3 + 1] > 15) positions[i * 3 + 1] = 0;
      }
      geometry.attributes.position.needsUpdate = true;
    },
  };
}