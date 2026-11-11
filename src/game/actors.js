import * as THREE from 'three';
import { softDot } from './models/textures';

export function disposeGroup(group) {
  group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

// Soft contact shadow that grounds a character on the terrain (and stands in for shadow maps on mobile).
export function blob(radius, opacity = 0.34) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 1.3, 24),
    new THREE.MeshBasicMaterial({ color: '#050308', map: softDot(), transparent: true, opacity: Math.min(1, opacity * 1.6), depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.1;
  mesh.name = 'blob';
  return mesh;
}