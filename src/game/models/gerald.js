import * as THREE from 'three';
import { std, metal, part, node, rot, scl, limbDown, between } from './kit';
import { blob } from '../actors';

const STRIKE = -1.05;
const RAISED = -2.7;
const CYCLE = 1.7;

// Hammer arm angle over one forging cycle: slow lift, fast drop, a small bounce off the anvil.
function swingAngle(ph) {
  if (ph < 0.55) {
    const k = ph / 0.55;
    return STRIKE + (RAISED - STRIKE) * (k * k * (3 - 2 * k));
  }
  if (ph < 0.66) {
    const k = (ph - 0.55) / 0.11;
    return RAISED + (STRIKE - RAISED) * k * k;
  }
  return STRIKE - 0.12 * Math.sin(Math.min(1, (ph - 0.66) / 0.14) * Math.PI);
}

// Gerald the Blacksmith: barrel-chested, bald, big grey beard, leather apron, hammering at the anvil (+Z).
export function buildGerald() {
  const group = new THREE.Group();
  group.add(blob(0.75));
  const skin = std('#c98d68', { roughness: 0.7 });
  const beard = std('#cfc8bd', { roughness: 0.95 });
  const shirt = std('#7a5134', { roughness: 0.9 });
  const leather = std('#3d2716', { roughness: 0.7, metalness: 0.1 });
  const iron = metal('#5e6470', 0.4);
  const wood = std('#6b4423', { roughness: 0.85 });
  const eye = std('#140c08');

  [-1, 1].forEach((s) => group.add(
    part(new THREE.CylinderGeometry(0.13, 0.12, 0.62, 8), std('#2e2925', { roughness: 0.9 }), s * 0.17, 0.42, 0),
    part(new THREE.BoxGeometry(0.24, 0.14, 0.36), leather, s * 0.17, 0.07, 0.05)
  ));

  const body = node(0, 1.08, 0,
    scl(part(new THREE.CylinderGeometry(0.4, 0.33, 0.74, 14), shirt), 1, 1, 0.8),
    scl(part(new THREE.SphereGeometry(0.36, 14, 10), shirt, 0, -0.12, 0.05), 1, 0.85, 0.85),
    part(new THREE.BoxGeometry(0.56, 0.86, 0.04), leather, 0, -0.18, 0.4),
    rot(part(new THREE.TorusGeometry(0.34, 0.03, 6, 18), leather, 0, -0.28, 0), Math.PI / 2),
    part(new THREE.BoxGeometry(0.06, 0.42, 0.03), leather, -0.18, 0.2, 0.3),
    part(new THREE.BoxGeometry(0.06, 0.42, 0.03), leather, 0.18, 0.2, 0.3),
    part(new THREE.SphereGeometry(0.13, 10, 8), shirt, -0.44, 0.28, 0),
    part(new THREE.SphereGeometry(0.13, 10, 8), shirt, 0.44, 0.28, 0)
  );

  const head = node(0, 1.68, 0.02,
    part(new THREE.SphereGeometry(0.2, 14, 12), skin),
    part(new THREE.SphereGeometry(0.045, 8, 6), skin, 0, -0.01, 0.2),
    part(new THREE.SphereGeometry(0.05, 8, 6), skin, -0.2, 0, 0),
    part(new THREE.SphereGeometry(0.05, 8, 6), skin, 0.2, 0, 0),
    part(new THREE.SphereGeometry(0.022, 6, 5), eye, -0.07, 0.04, 0.17),
    part(new THREE.SphereGeometry(0.022, 6, 5), eye, 0.07, 0.04, 0.17),
    part(new THREE.BoxGeometry(0.1, 0.03, 0.03), beard, -0.07, 0.09, 0.17),
    part(new THREE.BoxGeometry(0.1, 0.03, 0.03), beard, 0.07, 0.09, 0.17),
    scl(part(new THREE.SphereGeometry(0.17, 12, 8), beard, 0, -0.09, 0.06), 1, 0.7, 0.9),
    rot(part(new THREE.ConeGeometry(0.17, 0.46, 10), beard, 0, -0.3, 0.1), Math.PI - 0.25),
    part(new THREE.BoxGeometry(0.22, 0.045, 0.05), beard, 0, -0.04, 0.19)
  );

  // Left hand rests on the hip; the right arm swings the hammer from the shoulder.
  group.add(
    between([-0.44, 1.36, 0], [-0.52, 1.02, 0.1], 0.09, 0.08, shirt),
    between([-0.52, 1.02, 0.1], [-0.36, 0.88, 0.24], 0.08, 0.07, skin),
    part(new THREE.SphereGeometry(0.075, 8, 6), skin, -0.36, 0.88, 0.24)
  );
  const arm = node(0.44, 1.36, 0,
    part(limbDown(0.1, 0.085, 0.36), shirt),
    part(limbDown(0.085, 0.07, 0.3), skin, 0, -0.36, 0),
    part(new THREE.SphereGeometry(0.075, 8, 6), skin, 0, -0.68, 0),
    part(new THREE.CylinderGeometry(0.026, 0.026, 0.44, 6), wood, 0, -0.86, 0),
    part(new THREE.BoxGeometry(0.13, 0.13, 0.27), iron, 0, -1.06, 0)
  );
  group.add(body, head, arm);

  let last = 0;
  return {
    group,
    // Returns true on the frame the hammer meets the anvil.
    update(t) {
      const ph = (t % CYCLE) / CYCLE;
      arm.rotation.x = swingAngle(ph);
      const lean = ph > 0.6 && ph < 0.9 ? Math.sin(((ph - 0.6) / 0.3) * Math.PI) * 0.07 : 0;
      body.rotation.x = 0.04 + lean;
      head.rotation.x = 0.1 + lean;
      body.scale.y = 1 + Math.sin(t * 2.2) * 0.012;
      const struck = last < 0.66 && ph >= 0.66;
      last = ph;
      return struck;
    },
  };
}