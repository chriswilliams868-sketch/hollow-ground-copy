import * as THREE from 'three';
import { PLAYER } from '../constants';
import { sfx } from '../audio';
import { elementProc } from '../procs';
import { above } from '../grounding';

const BLOCK_COST = 15;

function barrier(player) {
  if (!player.barrier) {
    const material = new THREE.MeshBasicMaterial({
      color: '#ffcf6b', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    player.barrier = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.7, 20, 1, true, -1.15, 2.3), material);
    player.barrier.position.y = 0.95;
    player.group.add(player.barrier);
  }
  return player.barrier;
}

// Weapon-specific block effects (hammer stagger, axe reflect) plus the weapon element on the attacker.
function retaliate(engine, source, amount, mod) {
  if (mod.blockStagger && source !== engine.boss) {
    source.state = 'stagger';
    source.timer = Math.max(source.timer, mod.blockStagger);
    source.flash = 0.2;
  }
  if (mod.blockReflect) {
    const dir = new THREE.Vector3().subVectors(source.group.position, engine.player.group.position).setY(0);
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
    engine.damageActor(source, amount * mod.blockReflect, dir.normalize(), { hitStop: 0, shake: 0, knockback: 0.6, color: '#ffcf6b' });
  }
  if (!source.dead) elementProc(engine, source, amount);
}

// Paladin: hold to raise the tower shield. Each blocked hit costs stamina; running dry breaks the guard.
export default {
  press(engine, player) {
    player.guardHeld = true;
    engine.cancelCharge();
  },
  release(engine, player) {
    player.guardHeld = false;
  },
  update(engine, player, dt) {
    player.blocking = player.guardHeld && player.skillCooldown <= 0 && !player.attack && !player.dodging && !player.dead;
    player.guardFlash = Math.max(0, player.guardFlash - dt);
    const mesh = barrier(player);
    const target = player.blocking ? 0.22 + player.guardFlash * 1.6 : 0;
    mesh.material.opacity += (target - mesh.material.opacity) * Math.min(1, dt * 14);
    mesh.visible = mesh.material.opacity > 0.01;
  },
  // Returns true when the hit was fully absorbed.
  defend(engine, amount, sourcePosition, source) {
    const player = engine.player;
    const mod = player.kit.skill;
    const pos = player.group.position;
    const cost = BLOCK_COST * (mod.blockCost || 1) * (1 - Math.min(0.6, engine.gear.guard || 0));
    if (player.stamina < cost) {
      player.blocking = false;
      player.skillCooldown = 1.2;
      engine.effects.ring(pos, 2.4, '#ffcf6b', 0.4);
      engine.setHint('Guard broken · out of stamina', 1.4);
      sfx.guardBreak();
      return false;
    }
    player.stamina -= cost;
    player.staminaDelay = PLAYER.regenDelay;
    player.guardFlash = 0.25;
    const away = new THREE.Vector3().subVectors(pos, sourcePosition).setY(0);
    if (away.lengthSq() < 0.01) away.set(-Math.sin(player.facing), 0, -Math.cos(player.facing));
    player.knock.copy(away.normalize()).multiplyScalar(2.4);
    engine.shake = Math.min(0.6, engine.shake + 0.18);
    engine.hitStop = Math.max(engine.hitStop, 0.06);
    const front = above(pos, 1.1).add(new THREE.Vector3(Math.sin(player.facing) * 0.8, 0, Math.cos(player.facing) * 0.8));
    engine.effects.spark(front, '#ffe2a0');
    engine.effects.popup(front.clone().setY(front.y + 1), 'BLOCK', '#ffcf6b');
    sfx.block();
    if (source && !source.dead) retaliate(engine, source, amount, mod);
    return true;
  },
};