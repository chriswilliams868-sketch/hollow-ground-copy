import * as THREE from 'three';
import { sfx } from './audio';
import { groundHeight } from './terrain';
import { ejectShells } from './shellFx';

const SHOT_HEIGHT = 1.55; // shots fly no higher than this above the ground, even from the top of a backflip

// One gun goes off (hand 0 main, 1 off): pellets fly along `dir` from the muzzle, the gun kicks up and back, a pair of
// guns turns the torso into each shot, flash and smoke at the muzzle and `shells` casings flick out of its side.
export function blast(engine, player, hand, dir, shells = 1) {
  const { parts } = player;
  const ranged = player.kit.ranged;
  const muzzle = parts.muzzles[hand].getWorldPosition(new THREE.Vector3());
  const origin = muzzle.clone().setY(Math.min(muzzle.y, groundHeight(muzzle.x, muzzle.z) + SHOT_HEIGHT));
  const hit = { weapon: true, hitStop: 0.045, shake: 0.08, knockback: ranged.knockback, stagger: 0.35, poise: ranged.poise };
  for (let i = 0; i < ranged.pellets; i += 1) {
    const angle = player.facing + (i - (ranged.pellets - 1) / 2) * ranged.spread + (Math.random() - 0.5) * 0.04;
    engine.projectiles.spawn(origin, new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)), {
      speed: ranged.speed, range: ranged.range, damage: ranged.damage * engine.stats.damage, hit, look: ranged.look, pierce: ranged.pierce,
    });
  }

  // Recoil kick; the idle pose eases the gun back
  const pivot = hand === 0 ? parts.weapon : parts.offhand;
  const side = hand === 0 ? 1 : -1;
  pivot.rotation.x = -0.8;
  pivot.position.z -= 0.18;
  parts.body.rotation.x = parts.bodyPitch - 0.08 - Math.min(0.2, ranged.recoil * 0.05);
  if (parts.muzzles.length > 1) parts.body.rotation.y = -0.22 * side;
  player.knock.addScaledVector(dir, -ranged.recoil);
  engine.effects.spark(muzzle, '#ffe7a3');
  engine.effects.smoke(muzzle);
  engine.shake = Math.min(0.7, engine.shake + ranged.shake);
  sfx[ranged.sfx]();

  // Brass out of the gun's outer side, kicked a little back
  const port = pivot.getWorldPosition(new THREE.Vector3());
  port.y += 0.08;
  const f = player.facing;
  const out = new THREE.Vector3(Math.cos(f) * side, 0, -Math.sin(f) * side).addScaledVector(dir, -0.35);
  ejectShells(engine.effects, port, out, shells);
}