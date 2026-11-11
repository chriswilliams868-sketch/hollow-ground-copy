import * as THREE from 'three';

function glow(color, depthTest = true) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest,
    side: THREE.DoubleSide,
  });
}

// Ground ring of yellow arcs with red inward pointers, plus a marker floating above the target.
export function buildReticle() {
  const group = new THREE.Group();
  const ring = new THREE.Group();
  ring.position.y = 0.14;
  const arcMat = glow('#ffd84d');
  const tipMat = glow('#ff2d55');

  for (let i = 0; i < 4; i += 1) {
    const angle = (i * Math.PI) / 2;
    const arc = new THREE.RingGeometry(1, 1.16, 18, 1, angle + 0.22, Math.PI / 2 - 0.44);
    arc.rotateX(-Math.PI / 2);
    ring.add(new THREE.Mesh(arc, arcMat));

    const tipGeometry = new THREE.CircleGeometry(0.17, 3);
    tipGeometry.rotateX(-Math.PI / 2);
    const tip = new THREE.Mesh(tipGeometry, tipMat);
    tip.position.set(Math.cos(angle) * 1.42, 0, -Math.sin(angle) * 1.42);
    tip.rotation.y = Math.PI + angle;
    ring.add(tip);
  }

  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), glow('#ff2d55', false));
  marker.scale.set(1, 1.5, 1);
  marker.renderOrder = 25;

  group.add(ring, marker);
  return { group, ring, marker };
}