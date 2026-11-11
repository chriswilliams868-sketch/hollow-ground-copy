import * as THREE from 'three';
import { buildCreature } from './creatures';
import { enemyStats, ENEMY_TYPES } from './bestiary';
import { enemySpawns } from './spawns';
import { disposeGroup } from './actors';
import { groundHeight } from './terrain';

function createEnemy(engine, spawn) {
  const { group, parts } = buildCreature(spawn.type);
  const stats = enemyStats(spawn.type, spawn.level);
  const facing = Math.random() * Math.PI * 2;
  const ground = groundHeight(spawn.x, spawn.z);
  group.position.set(spawn.x, ground, spawn.z);
  group.rotation.y = facing;
  const enemy = {
    group,
    parts,
    type: spawn.type,
    level: spawn.level,
    stats,
    radius: stats.radius,
    big: ENEMY_TYPES[spawn.type].shape === 'brute',
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    spawn: new THREE.Vector3(spawn.x, ground, spawn.z),
    waypoint: new THREE.Vector3(spawn.x, ground, spawn.z),
    state: 'patrol',
    timer: 0,
    facing,
    knock: new THREE.Vector3(),
    flash: 0,
    dead: false,
    deathTimer: 0,
    waitTimer: Math.random() * 1.5,
    vulnerable: 0,
    struck: false,
    lungeDir: new THREE.Vector3(),
  };
  engine.scene.add(group);
  engine.nameplates.attach(enemy, ENEMY_TYPES[spawn.type].name, spawn.level);
  return enemy;
}

export function populate(engine) {
  engine.enemies.forEach((enemy) => {
    engine.scene.remove(enemy.group);
    disposeGroup(enemy.group);
    engine.nameplates.detach(enemy);
  });
  engine.enemies = enemySpawns().map((spawn) => createEnemy(engine, spawn));
}

// Fallen enemies return to their post once the player has moved on.
export function reviveEnemy(enemy) {
  const { group, parts } = enemy;
  enemy.dead = false;
  enemy.hp = enemy.maxHp;
  enemy.state = 'patrol';
  enemy.deathTimer = 0;
  enemy.vulnerable = 0;
  enemy.flash = 0;
  enemy.knock.set(0, 0, 0);
  enemy.waypoint.copy(enemy.spawn);
  group.position.copy(enemy.spawn);
  group.rotation.set(0, enemy.facing, 0);
  group.visible = true;
  parts.bodyMat.transparent = parts.baseOpacity < 1;
  parts.bodyMat.opacity = parts.baseOpacity;
}