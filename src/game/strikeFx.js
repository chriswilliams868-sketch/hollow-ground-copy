import * as THREE from 'three';
import { sfx } from './audio';
import { above } from './grounding';

function glow(color, opacity = 0.85) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function ahead(pos, facing, distance) {
  return new THREE.Vector3(pos.x + Math.sin(facing) * distance, 0, pos.z + Math.cos(facing) * distance);
}

// Vertical arc standing in the facing plane (downward slashes and slams).
function arcSlash(effects, pos, facing, color, scale = 1) {
  const mesh = new THREE.Mesh(new THREE.RingGeometry(0.5 * scale, 2 * scale, 24, 1, -0.6, 2.7), glow(color));
  mesh.position.set(pos.x, pos.y + 1.1, pos.z);
  mesh.rotation.y = facing - Math.PI / 2;
  effects.add(mesh, 0.24, (obj, p) => {
    obj.scale.setScalar(1 + p * 0.15);
    obj.material.opacity = 0.85 * (1 - p);
  });
}

// Arc in front of the player tilted around the forward axis (dagger cuts).
function diagonalSlash(effects, pos, facing, tilt, color) {
  const group = new THREE.Group();
  group.position.set(pos.x, pos.y + 1.05, pos.z);
  group.rotation.y = facing;
  const geometry = new THREE.RingGeometry(0.45, 1.7, 20, 1, -Math.PI / 2 - 1, 2);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, glow(color));
  mesh.rotation.z = tilt;
  group.add(mesh);
  effects.add(group, 0.18, (obj, p) => {
    mesh.scale.setScalar(1 + p * 0.2);
    mesh.material.opacity = 0.85 * (1 - p);
  });
}

// Finisher thrust: a forward streak plus a long-lived particle trail.
function thrust(effects, pos, facing, length, color) {
  const dx = Math.sin(facing);
  const dz = Math.cos(facing);
  const streak = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, length), glow(color, 0.9));
  streak.position.set(pos.x + dx * (length / 2 + 0.2), pos.y + 1, pos.z + dz * (length / 2 + 0.2));
  streak.rotation.y = facing;
  effects.add(streak, 0.3, (obj, p) => {
    obj.scale.set(1 - p * 0.6, 1, Math.min(1, 0.3 + p * 5));
    obj.material.opacity = 0.9 * (1 - p);
  });

  const trail = new THREE.Group();
  const material = glow(color, 1);
  const geometry = new THREE.OctahedronGeometry(0.07, 0);
  const velocities = [];
  for (let i = 0; i < 16; i += 1) {
    const along = 0.3 + (i / 15) * (length + 0.6);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x + dx * along, pos.y + 0.9 + Math.random() * 0.3, pos.z + dz * along);
    velocities.push(
      new THREE.Vector3((Math.random() - 0.5) * 1.2 + dx * 1.5, 0.4 + Math.random() * 0.9, (Math.random() - 0.5) * 1.2 + dz * 1.5)
    );
    trail.add(mesh);
  }
  effects.add(trail, 0.75, (obj, p, dt) => {
    obj.children.forEach((child, i) => {
      child.position.addScaledVector(velocities[i], dt);
      child.scale.setScalar(Math.max(0.01, 1 - p));
    });
    material.opacity = 1 - p;
  });
}

const STRIKES = {
  horizontal: (fx, pos, facing, config) => fx.slash(pos, facing, config.arc, '#ffb27a'),
  // Wide arcs scaled to the weapon's reach (claymore, axe, greatsword sweeps)
  sweep: (fx, pos, facing, config) => fx.slash(pos, facing, config.arc, '#ffcf8a', config.range),
  whirl: (fx, pos, facing, config) => {
    fx.slash(pos, facing, Math.PI * 2 - 0.01, '#ffd2a8', config.range);
    fx.ring(pos, config.range + 0.6, '#ffb27a', 0.35);
  },
  cleave: (fx, pos, facing) => {
    arcSlash(fx, pos, facing, '#ffcf6b', 1.05);
    fx.ring(ahead(pos, facing, 1.5), 2.2, '#ffcf6b', 0.3);
  },
  greatswing: (fx, pos, facing) => {
    const impact = ahead(pos, facing, 2.2);
    arcSlash(fx, pos, facing, '#fff1c2', 1.4);
    fx.blast(impact, 3, '#ffcf6b');
    fx.smoke(impact);
  },
  katana: (fx, pos, facing, config) => fx.slash(pos, facing, config.arc, '#fda4af', config.range),
  toss: (fx, pos, facing) => fx.spark(above(ahead(pos, facing, 0.6), 1.1), '#c084fc'),
  vertical: (fx, pos, facing) => {
    arcSlash(fx, pos, facing, '#ffd2a8');
    fx.ring(ahead(pos, facing, 1.6), 1.5, '#ffb27a', 0.3);
  },
  thrust: (fx, pos, facing, config) => thrust(fx, pos, facing, config.range, '#ffd166'),
  slam: (fx, pos, facing) => {
    const impact = ahead(pos, facing, 1.7);
    arcSlash(fx, pos, facing, '#ff8a4c', 1.25);
    fx.blast(impact, 3.4, '#ff6b35');
    fx.spark(above(impact, 0.4), '#ffd166');
    sfx.stomp();
  },
  hammerSlam: (fx, pos, facing) => {
    const impact = ahead(pos, facing, 1.8);
    arcSlash(fx, pos, facing, '#ffe2a0', 1.1);
    fx.blast(impact, 2.8, '#ffb84d');
    fx.ring(impact, 3.8, '#fff1c2', 0.45);
    fx.smoke(impact);
    fx.smoke(impact);
    fx.smoke(impact);
  },
  hammerSweep: (fx, pos, facing, config) => {
    fx.slash(pos, facing, config.arc, '#ffcf6b');
    fx.ring(pos, 3.2, '#ffb84d', 0.35);
  },
  daggerR: (fx, pos, facing) => diagonalSlash(fx, pos, facing, 0.65, '#c084fc'),
  daggerL: (fx, pos, facing) => diagonalSlash(fx, pos, facing, -0.65, '#c084fc'),
  daggerX: (fx, pos, facing) => {
    diagonalSlash(fx, pos, facing, 0.75, '#e9d5ff');
    diagonalSlash(fx, pos, facing, -0.75, '#a855f7');
    fx.spark(above(ahead(pos, facing, 1.2), 1.1), '#c084fc');
  },
  // Outward X-cut: both blades rip up and away from the cross
  daggerXOut: (fx, pos, facing) => {
    diagonalSlash(fx, pos, facing, -0.95, '#f0abfc');
    diagonalSlash(fx, pos, facing, 0.95, '#c084fc');
    fx.spark(above(ahead(pos, facing, 1.1), 1.25), '#f0abfc');
  },
  // Leaping slam: both blades driven into the ground on landing
  leapSlam: (fx, pos, facing, config) => {
    const impact = ahead(pos, facing, 0.7);
    diagonalSlash(fx, pos, facing, 0.75, '#e9d5ff');
    diagonalSlash(fx, pos, facing, -0.75, '#a855f7');
    fx.blast(impact, config.range + 0.4, '#a855f7');
    fx.spark(above(impact, 0.3), '#e9d5ff');
    sfx.stomp();
  },
};

export function playStrike(engine, player, config) {
  if (config.impactShake) engine.shake = Math.min(0.9, engine.shake + config.impactShake);
  STRIKES[config.fx || config.style](engine.effects, player.group.position, player.facing, config);
}