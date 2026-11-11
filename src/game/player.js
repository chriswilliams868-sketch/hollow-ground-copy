import * as THREE from 'three';
import { PLAYER } from './constants';
import { turnTowards } from './math';
import { advanceAttack } from './attacks';
import { handsTowards } from './weaponPose';
import { updateGuns } from './gunplay';
import { settleBody } from './swingMotion';
import { groundHeight } from './terrain';
import { standOnGround, shadeGround } from './grounding';
import { updateGait, dashEnvelope } from './heroes/gait';
import { dashTrail } from './dashFx';
import { updateTrickShot } from './trickShot';
import { poseAir } from './airborne';
import { updateFlourish, idleFlourish } from './flourish';

const DASH_LEAN = 0.35;

const CHARGE_LOW = new THREE.Color('#ff9a1c');
const CHARGE_HIGH = new THREE.Color('#ff1f1f');

// Screen-relative movement, but sideways input orbits the locked target at a steady distance.
function strafe(pos, target, input, step) {
  const dx = target.x - pos.x;
  const dz = target.z - pos.z;
  const distance = Math.hypot(dx, dz);
  pos.addScaledVector(input, step);
  if (distance < 1.2) return;
  const desired = Math.max(0.8, distance - ((input.x * dx + input.z * dz) / distance) * step);
  const ox = pos.x - target.x;
  const oz = pos.z - target.z;
  const length = Math.hypot(ox, oz) || 1;
  pos.x = target.x + (ox / length) * desired;
  pos.z = target.z + (oz / length) * desired;
}

// Vanguard charge: orange-to-red glow, sword held back and trembling, embers at the feet.
function updateCharge(engine, player, dt) {
  const parts = player.parts;
  if (!player.charging) {
    parts.bodyMat.emissive.copy(parts.baseEmissive);
    parts.glowMat.emissiveIntensity = parts.glowBase;
    return;
  }
  const heavy = player.kit.heavy;
  const level = Math.min(1, player.chargeTime / heavy.maxCharge);
  parts.bodyMat.emissive.lerpColors(CHARGE_LOW, CHARGE_HIGH, level);
  parts.bodyMat.emissiveIntensity = 0.55 + level * 1.4 + Math.sin(engine.time * (12 + level * 18)) * 0.3 * level;
  parts.glowMat.emissiveIntensity = 1.6 + level * 2.8;
  handsTowards(player, player.kit.poses[heavy.style].wind, 14, dt);
  parts.weapon.rotation.y += Math.sin(engine.time * 47) * 0.025 * level;
  player.chargeFx -= dt;
  if (player.chargeFx <= 0) {
    player.chargeFx = 0.26 - level * 0.12;
    engine.effects.chargeDust(player.group.position, level > 0.85 ? '#ff2d2d' : '#ff8a4c');
  }
}

// Reload or shield-block poses when they apply, otherwise the class rest pose.
function idleHands(player, dt) {
  const { poses } = player.kit;
  const set = player.reload > 0 ? poses.reload : player.blocking ? poses.block : null;
  handsTowards(player, set, set ? 18 : 12, dt);
}

// Anything that keeps the hero from settling into the idle stance (and its weapon flourish).
const busy = (engine, player) =>
  engine.state !== 'playing' || player.dead || player.stride > 0.1 || player.attack || player.dodging || player.hop ||
  player.flip || player.charging || player.blocking || player.reload > 0 || player.shotTimer > 0;

export function updatePlayer(engine, dt) {
  const player = engine.player;
  if (!player) return;
  stepPlayer(engine, player, dt);
  if (player.dead) shadeGround(player);
  else standOnGround(player);
  updateGait(player, dt);
  poseAir(player); // leaps, flips and spins override the walk cycle
  idleFlourish(player, busy(engine, player), dt);
  updateFlourish(player, dt);
}

function stepPlayer(engine, player, dt) {
  const { parts, cls } = player;

  player.stride = 0; // walking speed this frame, drives the walk cycle
  player.flash = Math.max(0, player.flash - dt);
  player.iframe = Math.max(0, player.iframe - dt);
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.staminaDelay = Math.max(0, player.staminaDelay - dt);
  player.comboTimer = Math.max(0, player.comboTimer - dt);
  if (player.comboTimer <= 0 && !player.attack) player.comboIndex = 0;
  if (engine.state === 'playing') updateGuns(engine, player, dt);

  parts.bodyMat.emissiveIntensity = player.flash > 0 ? 2.2 : parts.baseGlow;
  parts.animate(dt);
  updateCharge(engine, player, dt);
  if (!player.attack && !player.charging) idleHands(player, dt);
  if (!player.attack) settleBody(parts, dt, 8);

  if (player.knock.lengthSq() > 0.0004) {
    player.group.position.addScaledVector(player.knock, dt);
    player.knock.multiplyScalar(Math.exp(-9 * dt));
  }

  // Aerial poses are re-set every frame they last, so a cancelled leap or flip never sticks
  if (engine.state === 'playing' || player.dead) player.air = null;

  if (player.dead) {
    player.deathTimer += dt;
    player.group.rotation.x = Math.min(1.4, player.group.rotation.x + dt * 4);
    const pos = player.group.position;
    pos.y = Math.max(groundHeight(pos.x, pos.z) - 0.3, pos.y - dt * 0.6);
    return;
  }

  // Smoke-bomb backstep: a quick scripted hop that takes over movement.
  if (player.hop) {
    player.hop.time -= dt;
    player.group.position.addScaledVector(player.hop.dir, player.hop.speed * dt);
    engine.clampPosition(player.group.position);
    if (player.hop.time <= 0) player.hop = null;
    return;
  }

  if (player.dodging) {
    const dodge = cls.dodge;
    player.dodgeTimer -= dt;
    const remaining = Math.max(0, player.dodgeTimer / dodge.duration);
    const speed = dodge.speed * (0.35 + remaining * 0.65);
    player.group.position.addScaledVector(player.dodgeDir, speed * dt);
    // Dash: lean hard into a split stride and leave afterimages behind
    player.dash = dashEnvelope(1 - remaining);
    player.group.rotation.x = DASH_LEAN * player.dash;
    dashTrail(engine, player, dt);
    player.staminaDelay = PLAYER.regenDelay;
    if (player.dodgeTimer <= 0) {
      player.dodging = false;
      player.dash = 0;
      player.group.rotation.x = 0;
    }
    engine.clampPosition(player.group.position);
    return;
  }

  if (engine.state !== 'playing') {
    player.group.rotation.y = player.facing;
    return;
  }

  // Sharpshooter backflip trick shot: a scripted flip that takes over movement.
  if (player.flip) {
    updateTrickShot(engine, player, dt);
    player.group.rotation.y = player.facing;
    return;
  }

  const input = engine.getMoveVector();
  const moving = input.lengthSq() > 0.01;
  const target = engine.lock.target;

  if (player.attack) advanceAttack(engine, player, dt);

  if (!player.attack && moving) {
    const speed = PLAYER.speed * cls.speed * (player.charging ? player.kit.heavy.chargeSpeed : 1) * (player.blocking ? 0.45 : 1);
    const step = speed * dt;
    if (target) strafe(player.group.position, target.group.position, input, step);
    else player.group.position.addScaledVector(input, step);
    player.lastDir.copy(input).normalize();
    player.stride = speed * input.length();
    if (!target) player.facing = turnTowards(player.facing, Math.atan2(input.x, input.z), 1 - Math.exp(-16 * dt));
  }

  // Locked on: keep squared up to the target instead of facing the move direction.
  if (target && !player.attack) {
    const t = target.group.position;
    const p = player.group.position;
    player.facing = turnTowards(player.facing, Math.atan2(t.x - p.x, t.z - p.z), 1 - Math.exp(-18 * dt));
  }

  if (!player.attack && !player.charging && player.staminaDelay <= 0) {
    player.stamina = Math.min(player.maxStamina, player.stamina + PLAYER.staminaRegen * engine.mods.regen * (engine.buffs.stamina > 0 ? 1.75 : 1) * dt);
  }

  player.group.rotation.y = player.facing;
  engine.clampPosition(player.group.position);
}