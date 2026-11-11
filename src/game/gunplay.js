import * as THREE from 'three';
import { flatten, wrapAngle } from './math';
import { sfx } from './audio';
import { blast } from './gunBlast';
import { flourishHands, stopFlourish } from './flourish';

const ASSIST_ANGLE = 0.5;

// Locked target first; otherwise the stick/facing direction, nudged onto an enemy inside a small cone.
export function aimDirection(engine, player, range) {
  const pos = player.group.position;
  const target = engine.lock.target;
  if (target) {
    const dir = flatten(new THREE.Vector3().subVectors(target.group.position, pos));
    if (dir.lengthSq() > 0.01) return dir.normalize();
  }
  const input = engine.getMoveVector();
  const base = input.lengthSq() > 0.01 ? input.normalize() : new THREE.Vector3(Math.sin(player.facing), 0, Math.cos(player.facing));
  const baseAngle = Math.atan2(base.x, base.z);
  const actors = engine.enemies.filter((enemy) => !enemy.dead);
  if (engine.boss && !engine.boss.dead) actors.push(engine.boss);

  let best = null;
  let bestScore = Infinity;
  actors.forEach((actor) => {
    const offset = flatten(new THREE.Vector3().subVectors(actor.group.position, pos));
    const distance = offset.length();
    if (distance > range || distance < 0.01) return;
    const delta = Math.abs(wrapAngle(Math.atan2(offset.x, offset.z) - baseAngle));
    if (delta > ASSIST_ANGLE) return;
    const score = delta * 6 + distance * 0.1;
    if (score < bestScore) {
      bestScore = score;
      best = offset.divideScalar(distance);
    }
  });
  return best || base;
}

// Turns the hero to face the shot and settles its pose so the muzzles fire from where they really are.
export function aimShot(engine, player) {
  const dir = aimDirection(engine, player, player.kit.ranged.range);
  player.lastDir.copy(dir);
  player.facing = Math.atan2(dir.x, dir.z);
  player.group.rotation.y = player.facing;
  player.group.updateMatrixWorld(true);
  return dir;
}

// Empty: the barrels tip up and the guns twirl round their trigger guards while the reload runs.
export function startReload(player) {
  const { ranged, flourish } = player.kit;
  player.reload = ranged.reload;
  sfx.reloadClick();
  flourishHands(player, { ...flourish, turns: flourish.turns + 1, duration: 0.8 });
}

// Sharpshooter: dual guns alternate left/right blasts and the magazine's last round is a backflip trick shot with
// both; a single two-handed gun always fires from the main hand.
export function fireShot(engine) {
  const player = engine.player;
  const ranged = player.kit.ranged;
  if (player.reload > 0 || player.shotTimer > 0 || player.ammo <= 0 || player.flip) return;
  stopFlourish(player);
  const dir = aimShot(engine, player);
  const guns = player.parts.muzzles.length;
  if (guns > 1 && player.ammo === 1) {
    player.flip = { t: 0, fired: false };
    sfx.whoosh();
    return;
  }
  const hand = player.gun % guns;
  player.gun = (hand + 1) % guns;
  blast(engine, player, hand, dir);
  player.ammo -= 1;
  player.shotTimer = ranged.interval / engine.stats.reloadSpeed;
  if (player.ammo <= 0) startReload(player);
}

// Reload countdown; a full magazine starts back on the main hand with a twirl into the ready stance.
export function updateGuns(engine, player, dt) {
  const { ranged, flourish } = player.kit;
  if (!ranged) return;
  player.shotTimer = Math.max(0, player.shotTimer - dt);
  if (player.reload <= 0) return;
  player.reload -= dt * engine.stats.reloadSpeed;
  if (player.reload > 0) return;
  player.reload = 0;
  player.ammo = ranged.shots;
  player.gun = 0;
  sfx.reloadDone();
  flourishHands(player, flourish);
  player.flourishIn = flourish.every;
}