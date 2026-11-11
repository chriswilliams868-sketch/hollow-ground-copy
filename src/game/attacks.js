import * as THREE from 'three';
import { PLAYER } from './constants';
import { wrapAngle, flatten } from './math';
import { sfx } from './audio';
import { handsTowards, captureHands, lerpHands } from './weaponPose';
import { playStrike } from './strikeFx';
import { aimDirection } from './gunplay';
import { livingTargets } from './targets';
import { ELEMENTS } from './elements';
import { motionOf, EASE, coilBody, driveSwing, settleBody, flurry, hitTimes, airPose } from './swingMotion';
import { dirtBurst, groundShatter } from './impactFx';
import { stopFlourish } from './flourish';
import { above } from './grounding';

// Face the locked target if there is one, otherwise the stick direction.
function aim(engine, player) {
  const target = engine.lock.target;
  const dir = target
    ? flatten(new THREE.Vector3().subVectors(target.group.position, player.group.position))
    : engine.getMoveVector();
  if (dir.lengthSq() > 0.01) {
    player.lastDir.copy(dir).normalize();
    player.facing = Math.atan2(player.lastDir.x, player.lastDir.z);
  } else {
    player.lastDir.set(Math.sin(player.facing), 0, Math.cos(player.facing));
  }
  player.group.rotation.y = player.facing;
}

// index: a step of the class combo, or 'heavy' for the Vanguard's charged slam.
export function startAttack(engine, player, index) {
  const config = index === 'heavy' ? player.kit.heavy : player.kit.combo[index];
  player.stamina = Math.max(0, player.stamina - config.cost);
  player.staminaDelay = PLAYER.regenDelay;
  player.attack = {
    index,
    config,
    phase: config.pause ? 'pause' : 'windup',
    timer: config.pause || config.windup,
    queued: false,
    hits: 0,
    times: hitTimes(config),
    from: null,
  };
  stopFlourish(player);
  aim(engine, player);
  if (config.pause) engine.effects.spark(above(player.group.position, 1.35), '#ffd166');
  // Parry frames: a cyan glint says blows landing during this wind-up will be parried
  if (config.parry) engine.effects.spark(above(player.group.position, 1.2), '#5ee7ff');
}

function resolveHits(engine, config) {
  const player = engine.player;
  const origin = player.group.position;
  const hit = {
    weapon: true,
    bleed: config.bleed || 0,
    hitStop: config.hitStop,
    shake: config.shake,
    poise: (config.poise || 0) * engine.stats.poise,
    knockback: config.knockback || 1,
    stagger: config.stagger || 0.26,
  };
  const struck = livingTargets(engine).filter((target) => {
    const offset = flatten(new THREE.Vector3().subVectors(target.group.position, origin));
    const distance = offset.length();
    if (distance > config.range + target.radius) return false;
    return distance <= 0.001 || Math.abs(wrapAngle(Math.atan2(offset.x, offset.z) - player.facing)) <= config.arc / 2;
  });
  // Battle-axe cleave: every extra foe caught in the swing adds damage
  const cleave = 1 + Math.min(0.6, (config.cleave || 0) * Math.max(0, struck.length - 1));
  struck.forEach((target) => {
    const offset = flatten(new THREE.Vector3().subVectors(target.group.position, origin));
    const dir = offset.lengthSq() > 0.000001 ? offset.normalize() : new THREE.Vector3(0, 0, 1);
    engine.damageActor(target, config.damage * engine.stats.damage * cleave, dir, hit);
  });
}

// Throwing knives: the strike releases blades at the aimed target instead of a melee arc.
function throwBlades(engine, player, config) {
  const { count, spread, speed, range } = config.projectile;
  const dir = aimDirection(engine, player, range);
  player.lastDir.copy(dir);
  player.facing = Math.atan2(dir.x, dir.z);
  player.group.rotation.y = player.facing;
  const hit = { weapon: true, hitStop: config.hitStop, shake: config.shake, knockback: 0.6, stagger: 0.25, poise: (config.poise || 0) * engine.stats.poise };
  const origin = above(player.group.position, 1.1).addScaledVector(dir, 0.5);
  engine.projectiles.fan(origin, player.facing, count, spread, { speed, range, damage: config.damage * engine.stats.damage, hit, look: 'knife' });
}

// Stop lunging once the player is up against the locked target.
function lungeBlocked(engine, player) {
  const target = engine.lock.target;
  if (!target) return false;
  const t = target.group.position;
  const p = player.group.position;
  return Math.hypot(t.x - p.x, t.z - p.z) < target.radius + 1.1;
}

const trailColor = (engine) => (engine.affix ? ELEMENTS[engine.affix.element].color : '#ffe2c2');

// The weapon meets the ground: dirt and sparks fly and time catches for a beat, hit or miss.
// Leaps land at the hero's feet; shattering slams also crack the ground open.
function slamImpact(engine, player, config) {
  const reach = config.leap ? 0.7 : Math.min(2.2, config.range * 0.7);
  const point = player.group.position.clone().addScaledVector(player.lastDir, reach).setY(0);
  dirtBurst(engine.effects, point);
  if (config.shatter) groundShatter(engine.effects, point, player.facing);
  engine.hitStop = Math.max(engine.hitStop, 0.085);
  engine.shake = Math.min(0.9, engine.shake + 0.14);
}

// The blow lands: sound and strike effect, then knives fly or the arc connects.
function land(engine, player, config, motion) {
  sfx[config.sfx]();
  playStrike(engine, player, config);
  if (config.projectile) throwBlades(engine, player, config);
  else resolveHits(engine, config);
  if (motion === 'slam') slamImpact(engine, player, config);
}

// Thrust follow-through: the arm snaps back and the hero rebounds a step.
function recoil(player) {
  player.knock.addScaledVector(player.lastDir, -1.8);
  player.parts.weapon.position.z -= 0.22;
}

function finishAttack(engine, player, attack) {
  const { combo } = player.kit;
  const last = attack.index === 'heavy' || attack.index >= combo.length - 1;
  const next = last ? 0 : attack.index + 1;
  player.attack = null;
  player.attackCooldown = PLAYER.attackCooldown;
  player.comboIndex = next;
  player.comboTimer = last ? 0 : PLAYER.comboWindow;
  if (attack.queued && player.stamina >= combo[next].cost) startAttack(engine, player, next);
}

export function advanceAttack(engine, player, dt) {
  const attack = player.attack;
  const { config } = attack;
  const pose = player.kit.poses[config.style];
  const motion = motionOf(config.style);
  attack.timer -= dt * engine.stats.attackSpeed * player.cls.attackSpeed;

  // Finisher beat (pause) then wind-up: coil into the wind pose.
  if (attack.phase === 'pause' || attack.phase === 'windup') {
    handsTowards(player, pose.wind, attack.phase === 'pause' ? 16 : 32, dt);
    coilBody(player, pose.wind, motion, dt);
    if (attack.timer > 0) return;
    if (attack.phase === 'pause') {
      attack.phase = 'windup';
      attack.timer = config.windup;
      return;
    }
    attack.phase = 'active';
    attack.timer = config.active;
    attack.from = captureHands(player);
    if (engine.lock.target) aim(engine, player);
    return;
  }

  if (attack.phase === 'active') {
    const progress = 1 - Math.max(0, attack.timer) / config.active;
    const eased = config.thrusts ? flurry(progress, config.thrusts) : EASE[motion](progress);
    lerpHands(player, attack.from, pose.strike, eased);
    driveSwing(player, pose.strike, motion, progress, eased);
    player.air = airPose(config, progress);
    if (!config.projectile) engine.trail.sample(player, pose.strike, motion, trailColor(engine));
    if (!lungeBlocked(engine, player)) player.group.position.addScaledVector(player.lastDir, config.lunge * dt);
    while (attack.hits < attack.times.length && progress >= attack.times[attack.hits]) {
      attack.hits += 1;
      land(engine, player, config, motion);
    }
    if (attack.timer <= 0) {
      attack.phase = 'recovery';
      attack.timer = config.recovery;
      if (motion === 'thrust' && !config.projectile) recoil(player);
    }
    return;
  }

  handsTowards(player, null, 12, dt);
  settleBody(player.parts, dt, 9);
  if (attack.timer <= 0) finishAttack(engine, player, attack);
}