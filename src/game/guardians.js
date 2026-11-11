import * as THREE from 'three';
import { disposeGroup } from './actors';
import { BOSS_MODELS } from './models/bosses';
import { BOSS, ARENA } from './constants';
import { QUADRANTS, WORLD } from './worldData';
import { bossVitals } from './bestiary';

function createBoss(engine, { name, level, palette, x, z, arena, gem = null, king = false }) {
  const { group, parts, height, radius = BOSS.radius } = BOSS_MODELS[king ? 'king' : gem]();
  group.position.set(x, -3, z);
  const { hp, chargeDamage, aoeDamage } = bossVitals(level, king);
  engine.discover(king ? 'king' : gem);
  const boss = {
    group, parts, name, level, gem, king, arena,
    color: palette.core || '#a855f7',
    radius,
    stats: {
      speed: BOSS.speed,
      chargeSpeed: BOSS.chargeSpeed,
      chargeDamage,
      aoeDamage,
      aoeRadius: BOSS.aoeRadius,
      plate: height + 0.5,
    },
    hp, maxHp: hp, phase: 1, state: 'intro', timer: 1.6, facing: 0, nextAttack: 'charge',
    knock: new THREE.Vector3(), flash: 0, dead: false, deathTimer: 0, attackCooldown: 1.4, struck: false,
    chargeDir: new THREE.Vector3(), poise: 100, broken: 0, pulse: 1,
  };
  engine.scene.add(group);
  engine.nameplates.attach(boss, name, level, true);
  engine.boss = boss;
  engine.shake = 0.8;
  engine.setHint(`${name} awakens`, 3.2);
}

export function removeBoss(engine) {
  const boss = engine.boss;
  if (!boss) return;
  engine.scene.remove(boss.group);
  disposeGroup(boss.group);
  boss.parts.dispose?.();
  engine.nameplates.detach(boss);
  if (boss.gem) engine.world.lairs[boss.gem].setActive(false);
  engine.boss = null;
}

// Proximity triggers: guardian lairs, the Hollow Gateway (discovery and descent), and the King's arena below.
export function checkTriggers(engine) {
  const player = engine.player;
  if (player.dead || engine.fade.active) return;
  const pos = player.group.position;

  if (engine.zone === 'lair') {
    if (!engine.boss && Math.hypot(pos.x - WORLD.lair.x, pos.z - WORLD.lair.z) < ARENA.trigger) {
      createBoss(engine, {
        name: 'The Hollow King', level: 45, palette: {}, x: WORLD.lair.x, z: WORLD.lair.z,
        arena: { x: WORLD.lair.x, z: WORLD.lair.z, radius: ARENA.radius }, king: true,
      });
      engine.world.arena.activate();
    }
    return;
  }
  if (engine.boss) return;

  for (const q of QUADRANTS) {
    if (engine.gems.includes(q.gem) || engine.slain.has(q.gem)) continue;
    if (Math.hypot(pos.x - q.lair.x, pos.z - q.lair.z) < WORLD.lairRadius - 2.5) {
      createBoss(engine, {
        name: q.guardian.name, level: q.levels[1], palette: q.guardian, x: q.lair.x, z: q.lair.z,
        arena: { x: q.lair.x, z: q.lair.z, radius: WORLD.lairRadius }, gem: q.gem,
      });
      engine.world.lairs[q.gem].setActive(true);
      return;
    }
  }

  const { gateway } = WORLD;
  const near = Math.hypot(pos.x - gateway.x, pos.z - gateway.z);
  if (!engine.gatewayFound && near < 16) engine.discoverGateway();
  if (engine.doors.dungeon && near < 1.4) engine.descend();
  else if (!engine.doors.dungeon && near < gateway.radius && engine.time > engine.gateHintAt) {
    engine.gateHintAt = engine.time + 6;
    engine.setHint(`The Hollow Gateway is sealed · ${engine.gems.length}/4 gemstones`, 3);
  }
}