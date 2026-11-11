import * as THREE from 'three';
import { ENEMY } from './constants';
import { reviveEnemy } from './population';

const RESPAWN_DELAY = 45;
import { sfx } from './audio';
import { turnTowards, approach, flatten } from './math';
import { speedFactor } from './status';
import { groundHeight } from './terrain';
import { above, standOnGround, shadeGround } from './grounding';
import { swayBack } from './stagger';

function stepTowards(actor, target, speed, dt, turnRate = 10) {
  const dir = new THREE.Vector3().subVectors(target, actor.group.position);
  flatten(dir);
  const distance = dir.length();
  if (distance < 0.02) return 0;
  dir.divideScalar(distance);
  const step = Math.min(speed * dt, distance);
  actor.group.position.addScaledVector(dir, step);
  const targetAngle = Math.atan2(dir.x, dir.z);
  actor.facing = turnTowards(actor.facing, targetAngle, 1 - Math.exp(-turnRate * dt));
  actor.group.rotation.y = actor.facing;
  return step;
}

function pickWaypoint(enemy) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 1.5 + Math.random() * 3;
  enemy.waypoint.set(enemy.spawn.x + Math.cos(angle) * radius, 0, enemy.spawn.z + Math.sin(angle) * radius);
}

// Enemies walk the hills: their feet follow the terrain once this frame's movement is done, and the walk
// cycle runs off the distance they actually stepped (frozen enemies hold their pose).
export function updateEnemy(engine, enemy, dt) {
  enemy.moved = 0;
  stepEnemy(engine, enemy, dt);
  if (enemy.dead) return;
  swayBack(enemy, dt);
  standOnGround(enemy);
  enemy.parts.walk(dt * speedFactor(enemy), enemy.moved);
}

function stepEnemy(engine, enemy, dt) {
  const group = enemy.group;
  const parts = enemy.parts;
  enemy.flash = Math.max(0, enemy.flash - dt);
  if (!enemy.dead) parts.animate(dt * speedFactor(enemy));

  if (enemy.dead) {
    enemy.deathTimer += dt;
    if (group.visible) {
      group.rotation.x = Math.min(1.35, group.rotation.x + dt * 5);
      group.position.y = Math.max(groundHeight(group.position.x, group.position.z) - 0.7, group.position.y - dt * 1.1);
      parts.bodyMat.transparent = true;
      parts.bodyMat.opacity = Math.max(0, 1 - enemy.deathTimer / 1.2) * parts.baseOpacity;
      parts.bodyMat.emissiveIntensity = Math.max(0, 1.2 - enemy.deathTimer);
      if (enemy.deathTimer > 1.5) group.visible = false;
      return;
    }
    const p = engine.player.group.position;
    const far = Math.hypot(p.x - enemy.spawn.x, p.z - enemy.spawn.z) > 24;
    if (engine.state === 'playing' && enemy.deathTimer > RESPAWN_DELAY && far) reviveEnemy(enemy);
    return;
  }

  enemy.vulnerable = Math.max(0, enemy.vulnerable - dt);
  parts.bodyMat.emissiveIntensity =
    enemy.flash > 0 ? 2.4 : enemy.vulnerable > 0 ? 1 + Math.sin(engine.time * 18) * 0.6 : 0.25;

  if (enemy.knock.lengthSq() > 0.001) {
    group.position.addScaledVector(enemy.knock, dt);
    enemy.knock.multiplyScalar(Math.exp(-8 * dt));
    engine.clampPosition(group.position, 0, false);
  }

  if (engine.state !== 'playing') return;
  // Frozen enemies stand still; slowed ones act in slow motion.
  const factor = speedFactor(enemy);
  if (factor === 0) return;
  dt *= factor;

  const player = engine.player;
  const playerPos = player.group.position;
  const distance = flatten(new THREE.Vector3().subVectors(playerPos, group.position)).length();
  const playerAlive = !player.dead;

  enemy.timer -= dt;

  switch (enemy.state) {
    case 'stagger': {
      parts.arm.rotation.x = approach(parts.arm.rotation.x, 0, 8, dt);
      if (enemy.timer <= 0) enemy.state = playerAlive ? 'chase' : 'patrol';
      break;
    }
    case 'patrol': {
      enemy.waitTimer -= dt;
      if (enemy.waitTimer > 0) {
        parts.arm.rotation.x = approach(parts.arm.rotation.x, 0, 6, dt);
        break;
      }
      if (flatten(new THREE.Vector3().subVectors(enemy.waypoint, group.position)).length() < 0.6) {
        enemy.waitTimer = 1 + Math.random() * 1.2;
        pickWaypoint(enemy);
        break;
      }
      enemy.moved += stepTowards(enemy, enemy.waypoint, enemy.stats.speed, dt, 6);
      if (playerAlive && distance < ENEMY.aggro) {
        enemy.state = 'chase';
        engine.discover(enemy.type);
        engine.effects.ring(group.position, 1.8, '#ff2d55', 0.4);
      }
      break;
    }
    case 'chase': {
      parts.arm.rotation.x = approach(parts.arm.rotation.x, 0, 6, dt);
      if (!playerAlive || distance > ENEMY.aggro * 2) {
        enemy.state = 'patrol';
        pickWaypoint(enemy);
        break;
      }
      if (distance <= enemy.stats.range) {
        enemy.state = 'windup';
        enemy.timer = enemy.stats.windup;
        engine.effects.warning(group.position, enemy.stats.range + 0.4, enemy.stats.windup, '#ff2d55');
        break;
      }
      enemy.moved += stepTowards(enemy, playerPos, enemy.stats.chaseSpeed, dt, 9);
      break;
    }
    case 'windup': {
      if (distance > 0.1) {
        const targetAngle = Math.atan2(playerPos.x - group.position.x, playerPos.z - group.position.z);
        enemy.facing = turnTowards(enemy.facing, targetAngle, 1 - Math.exp(-8 * dt));
        group.rotation.y = enemy.facing;
      }
      parts.arm.rotation.x = approach(parts.arm.rotation.x, -1.5, 10, dt);
      if (enemy.timer <= 0) {
        enemy.state = 'lunge';
        enemy.timer = 0.2;
        enemy.struck = false;
        enemy.lungeDir = new THREE.Vector3(Math.sin(enemy.facing), 0, Math.cos(enemy.facing));
      }
      break;
    }
    case 'lunge': {
      group.position.addScaledVector(enemy.lungeDir, enemy.stats.lunge * dt);
      enemy.moved += enemy.stats.lunge * dt;
      engine.clampPosition(group.position, 0, false);
      parts.arm.rotation.x = approach(parts.arm.rotation.x, 0.9, 18, dt);
      if (!enemy.struck && distance < enemy.stats.range + 0.55) {
        enemy.struck = engine.damagePlayer(enemy.stats.damage, group.position, enemy);
        engine.effects.spark(above(playerPos, 1.1), '#ff6b6b');
      }
      if (enemy.timer <= 0) {
        enemy.state = 'recover';
        enemy.timer = enemy.stats.recover;
      }
      break;
    }
    case 'recover': {
      parts.arm.rotation.x = approach(parts.arm.rotation.x, 0, 8, dt);
      if (enemy.timer <= 0) enemy.state = 'chase';
      break;
    }
    default:
      break;
  }
}

// The boss's legs stride off the ground it actually covered this frame (walking, charging, knockback).
export function updateBoss(engine, boss, dt) {
  const { x, z } = boss.group.position;
  stepBoss(engine, boss, dt);
  if (boss.dead) return;
  boss.parts.walk?.(dt, Math.hypot(boss.group.position.x - x, boss.group.position.z - z));
  swayBack(boss, dt);
  shadeGround(boss);
}

function stepBoss(engine, boss, dt) {
  const group = boss.group;
  const parts = boss.parts;
  boss.flash = Math.max(0, boss.flash - dt);
  parts.animate(engine, boss, engine.state === 'playing' ? dt : 0);
  boss.timer -= dt;

  if (boss.dead) {
    boss.deathTimer += dt;
    group.rotation.z = Math.min(1.2, group.rotation.z + dt * 1.6);
    group.position.y = Math.max(-3, group.position.y - dt * 1.5);
    parts.bodyMat.emissiveIntensity = Math.max(0, 1.6 - boss.deathTimer);
    parts.coreMat.emissiveIntensity = Math.max(0, 2.2 - boss.deathTimer);
    return;
  }

  parts.bodyMat.emissiveIntensity = boss.flash > 0 ? 2 : boss.phase === 2 ? 0.75 : 0.3;
  parts.core.rotation.y += dt * 2;
  parts.core.rotation.x += dt * 1.3;

  boss.pulse -= dt;
  if (boss.pulse <= 0 && boss.state !== 'intro') {
    boss.pulse = boss.phase === 2 ? 0.9 : 1.5;
    engine.effects.ring(group.position, boss.phase === 2 ? 5 : 3.5, boss.color, 0.9);
  }

  if (boss.knock.lengthSq() > 0.001) {
    group.position.addScaledVector(boss.knock, dt);
    boss.knock.multiplyScalar(Math.exp(-9 * dt));
    engine.clampPosition(group.position, boss.radius + 0.5);
  }

  const player = engine.player;
  const playerPos = player.group.position;
  const toPlayer = flatten(new THREE.Vector3().subVectors(playerPos, group.position));
  const distance = toPlayer.length();
  const playerAlive = !player.dead;

  if (boss.state === 'intro') {
    const progress = 1 - Math.max(0, boss.timer) / 1.6;
    group.position.y = -3 + progress * 3;
    parts.arms.forEach((arm, i) => {
      arm.rotation.x = Math.sin(progress * Math.PI) * 0.9 * (i ? 1 : -1);
    });
    if (boss.timer <= 0) {
      boss.state = 'idle';
      boss.attackCooldown = 1.1;
      engine.shake = Math.min(0.8, engine.shake + 0.5);
      engine.effects.ring(group.position, 6, '#ff2d55', 0.7);
      pickBossAttack(boss, distance);
    }
    return;
  }

  if (engine.state !== 'playing') {
    parts.arms.forEach((arm) => {
      arm.rotation.x = approach(arm.rotation.x, 0, 4, dt);
    });
    return;
  }

  if (!playerAlive && boss.state !== 'idle') {
    boss.state = 'idle';
    boss.attackCooldown = 2;
  }


  switch (boss.state) {
    case 'idle': {
      boss.attackCooldown -= dt;
      parts.arms.forEach((arm) => {
        arm.rotation.x = approach(arm.rotation.x, Math.sin(engine.time * 1.6) * 0.12, 5, dt);
      });
      if (distance > 0.2) {
        const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
        boss.facing = turnTowards(boss.facing, targetAngle, 1 - Math.exp(-5 * dt));
        group.rotation.y = boss.facing;
      }
      if (distance > 5.5) stepTowards(boss, playerPos, boss.stats.speed * (boss.phase === 2 ? 1.25 : 1), dt, 5);
      if (boss.attackCooldown <= 0 && playerAlive) {
        if (boss.nextAttack === 'charge' && distance > 4) boss.state = 'telegraphCharge';
        else if (boss.nextAttack === 'charge') boss.state = 'telegraphAoe';
        else if (distance < 6.5) boss.state = 'telegraphAoe';
        else boss.state = 'telegraphCharge';

        boss.timer = 1;
        sfx.stomp();
        engine.effects.warning(
          group.position,
          boss.state === 'telegraphCharge' ? 3 : boss.stats.aoeRadius,
          boss.timer,
          '#ff2d55'
        );
      }
      break;
    }
    case 'telegraphCharge': {
      parts.arms.forEach((arm) => {
        arm.rotation.x = approach(arm.rotation.x, -1.1, 8, dt);
      });
      parts.body.rotation.x = approach(parts.body.rotation.x, -0.28, 8, dt);
      if (boss.timer > 0.25) {
        const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
        boss.facing = turnTowards(boss.facing, targetAngle, 1 - Math.exp(-4 * dt));
        group.rotation.y = boss.facing;
      }
      if (boss.timer <= 0) {
        boss.state = 'charge';
        boss.timer = 0.55;
        boss.struck = false;
        boss.chargeDir.set(Math.sin(boss.facing), 0, Math.cos(boss.facing));
      }
      break;
    }
    case 'charge': {
      parts.body.rotation.x = approach(parts.body.rotation.x, 0.32, 12, dt);
      group.position.addScaledVector(boss.chargeDir, boss.stats.chargeSpeed * dt);
      engine.clampPosition(group.position, boss.radius + 0.5);
      if (Math.random() < 0.6) {
        engine.effects.chargeDust(group.position.clone().setY(0.1).addScaledVector(boss.chargeDir, -1.2));
      }
      if (!boss.struck && distance < boss.radius + 1.1) {
        boss.struck = engine.damagePlayer(boss.stats.chargeDamage, group.position, boss);
        engine.shake = Math.min(0.9, engine.shake + 0.4);
      }
      if (boss.timer <= 0) {
        boss.state = 'recover';
        boss.timer = 0.65;
        engine.effects.ring(group.position, 4, '#ff8ba7', 0.5);
        sfx.stomp();
        engine.shake = Math.min(0.8, engine.shake + 0.3);
      }
      break;
    }
    case 'telegraphAoe': {
      parts.arms.forEach((arm) => {
        arm.rotation.x = approach(arm.rotation.x, -1.7, 9, dt);
      });
      parts.body.rotation.x = approach(parts.body.rotation.x, 0.1, 6, dt);
      if (boss.timer <= 0) {
        boss.state = 'recover';
        boss.timer = 0.8;
        parts.arms.forEach((arm) => {
          arm.rotation.x = 1.35;
        });
        parts.body.rotation.x = 0.3;
        engine.effects.blast(group.position, boss.stats.aoeRadius * (boss.phase === 2 ? 1.12 : 1), '#ff2d55');
        sfx.stomp();
        engine.shake = Math.min(1, engine.shake + 0.65);
        if (playerAlive && distance <= boss.stats.aoeRadius * (boss.phase === 2 ? 1.12 : 1)) {
          engine.damagePlayer(boss.stats.aoeDamage, group.position, boss);
        }
      }
      break;
    }
    case 'recover': {
      parts.arms.forEach((arm) => {
        arm.rotation.x = approach(arm.rotation.x, Math.sin(engine.time * 5) * 0.2, 6, dt);
      });
      parts.body.rotation.x = approach(parts.body.rotation.x, 0, 6, dt);
      if (boss.timer <= 0) {
        boss.state = 'idle';
        boss.attackCooldown = (boss.phase === 2 ? 1.1 : 1.9);
        pickBossAttack(boss, distance);
      }
      break;
    }
    case 'stagger': {
      parts.body.rotation.x = approach(parts.body.rotation.x, 0, 6, dt);
      if (boss.timer <= 0) {
        boss.state = 'idle';
        boss.attackCooldown = 0.7;
      }
      break;
    }
    default:
      break;
  }
}

function pickBossAttack(boss, distance) {
  if (boss.nextAttack === 'charge') {
    boss.nextAttack = 'aoe';
  } else if (boss.nextAttack === 'aoe') {
    boss.nextAttack = 'charge';
  } else {
    boss.nextAttack = distance > 6 ? 'charge' : 'aoe';
  }
}