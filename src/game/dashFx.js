import * as THREE from 'three';

const COLOR = '#7ef5e0';
const INTERVAL = 0.035;

// Dash: translucent afterimages strung out along the path, leaning with the hero, plus dust at the feet.
export function dashTrail(engine, player, dt) {
  if (dt <= 0) return;
  if (Math.random() < 0.5) engine.effects.smoke(player.group.position);
  player.ghost -= dt;
  if (player.ghost > 0) return;
  player.ghost = INTERVAL;
  const { position, rotation } = player.group;
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.95, 3, 10).translate(0, 0.85, 0),
    new THREE.MeshBasicMaterial({ color: COLOR, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  mesh.position.copy(position);
  mesh.rotation.set(rotation.x, rotation.y, 0, 'YXZ');
  engine.effects.add(mesh, 0.24, (obj, p) => {
    obj.material.opacity = 0.3 * (1 - p);
    obj.scale.set(1 - p * 0.35, 1, 1 - p * 0.35);
  });
}