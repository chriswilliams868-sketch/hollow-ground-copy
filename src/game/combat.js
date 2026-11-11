import * as THREE from 'three';
import { PLAYER, ENEMY } from './constants';
import { sfx } from './audio';
import { ELEMENTS, STATUS_COLORS } from './elements';
import { affixBonus, weaponProc, elementProc } from './procs';
import { targetsNear } from './targets';
import { clearStatus } from './status';
import bulwark from './skills/bulwark';
import { above } from './grounding';
import { kickStagger } from './stagger';

const HIT_PAUSE = 0.05; // every landed blow stops the world dead for a beat, then the slow-mo hit-stop runs out

// Impact: the hit pause and hit-stop, and the target rocks along the blow.
function impact(engine, actor, dir, hitStop, lean) {
  engine.freeze = Math.max(engine.freeze, HIT_PAUSE);
  engine.hitStop = Math.max(engine.hitStop, hitStop);
  kickStagger(actor, dir, lean);
}

// Claymore wind-ups are parry frames: a blow landing while the Vanguard winds up is parried.
const parryFrames = (player) => player.attack?.config.parry && (player.attack.phase === 'pause' || player.attack.phase === 'windup');

function damagePoise(engine, boss, amount) {
  if (boss.broken > 0) return;
  boss.poise -= amount;
  if (boss.poise > 0) return;
  boss.poise = 100;
  boss.state = 'stagger';
  boss.timer = 3;
  boss.broken = 3;
  engine.effects.ring(boss.group.position, 5, '#5ee7ff', 0.6);
}

// Claymore parry: a full-circle shockwave that hits everything around the Vanguard.
function parryWave(engine, damage) {
  const pos = engine.player.group.position;
  engine.effects.slash(pos, engine.player.facing, Math.PI * 2 - 0.01, '#ffd2a8', 3.4);
  engine.effects.ring(pos, 3.8, '#ffb27a', 0.4);
  targetsNear(engine, pos, 3.4).forEach((actor) => {
    const dir = new THREE.Vector3().subVectors(actor.group.position, pos).setY(0);
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
    engine.damageActor(actor, damage * engine.stats.damage, dir.normalize(), { weapon: true, hitStop: 0, shake: 0.12, knockback: 1.6, stagger: 0.5, poise: 10 });
  });
}

// Vanguard perfect parry: freeze, stagger the attacker and open a riposte window where every hit crits.
// The equipped weapon shapes it (longer riposte, knockback or a shockwave) and its element hits the attacker.
function handleParry(engine, source) {
  const player = engine.player;
  const mod = player.kit.skill;
  player.parryWindow = 0;
  player.skillCooldown = 0;
  player.riposte = mod.riposte || 1.5;
  player.iframe = 0.3;
  engine.freeze = 0.25;
  engine.shake = Math.min(0.6, engine.shake + 0.3);
  engine.effects.parryBurst(above(player.group.position, 1.1));
  sfx.parry();
  if (engine.relics.includes('leech')) {
    player.hp = Math.min(player.maxHp, player.hp + 12);
    engine.effects.popup(above(player.group.position, 1.6), '+12', '#7dffb0');
  }
  if (mod.parryWave) parryWave(engine, mod.parryWave);
  if (!source || source.dead) return;
  source.flash = 0.3;
  if (source === engine.boss) {
    damagePoise(engine, source, 34);
  } else {
    source.state = 'stagger';
    source.timer = 1.5;
    source.vulnerable = 1.5;
  }
  if (mod.parryKnock) {
    const away = new THREE.Vector3().subVectors(source.group.position, player.group.position).setY(0);
    if (away.lengthSq() > 0.01) source.knock.copy(away.normalize()).multiplyScalar(source === engine.boss ? 3 : ENEMY.knockback * mod.parryKnock);
  }
  elementProc(engine, source, 20 * engine.stats.damage, true);
}

function hitColor(engine, hit, crit) {
  if (crit) return '#ffd84d';
  if (hit.dot) return STATUS_COLORS[hit.dot];
  if ((hit.weapon || hit.infused) && engine.affix) return ELEMENTS[engine.affix.element].color;
  return hit.color || '#ffffff';
}

const rollCrit = (engine, guaranteed) => guaranteed || engine.player.riposte > 0 || Math.random() < engine.stats.crit;

export function damageEnemy(engine, enemy, amount, dir, hit = {}) {
  if (enemy.dead) return;
  const { hitStop = 0.055, shake = 0.14, knockback = 1, stagger = 0.26, dot } = hit;
  const vulnerable = enemy.vulnerable > 0;
  const crit = !dot && rollCrit(engine, vulnerable);
  const damage = Math.max(1, Math.round(amount * (1 + affixBonus(engine, hit)) * (vulnerable ? 2 : crit ? 1.5 : 1)));
  enemy.hp -= damage;
  const head = above(enemy.group.position, enemy.stats.plate - 0.6);
  engine.effects.popup(head, crit ? `${damage}!` : damage, hitColor(engine, hit, crit));

  if (!dot) {
    enemy.flash = 0.2;
    enemy.knock.copy(dir).multiplyScalar(ENEMY.knockback * knockback * (enemy.big ? 0.5 : 1));
    if (!vulnerable) {
      enemy.timer = enemy.state === 'stagger' ? Math.max(enemy.timer, stagger) : stagger;
      enemy.state = 'stagger';
    }
    impact(engine, enemy, dir, hitStop, (enemy.big ? 0.1 : 0.2) * Math.min(1.6, 0.6 + knockback * 0.4));
    engine.shake = Math.min(0.8, engine.shake + shake);
    sfx.hit();
    engine.effects.spark(head, '#ffb27a');
  }
  weaponProc(engine, enemy, damage, hit);

  if (enemy.hp > 0) return;
  enemy.hp = 0;
  enemy.dead = true;
  enemy.state = 'dead';
  enemy.deathTimer = 0;
  clearStatus(enemy);
  engine.effects.ring(enemy.group.position, 3.4, '#ff6b35', 0.5);
  engine.shake = Math.min(0.7, engine.shake + 0.25);
  engine.onEnemySlain(enemy);
}

export function damageBoss(engine, amount, dir, hit = {}) {
  const boss = engine.boss;
  if (!boss || boss.dead || boss.state === 'intro') return;
  const { hitStop = 0.05, shake = 0.12, knockback = 1, poise = 0, dot } = hit;
  const broken = boss.broken > 0;
  const crit = !dot && rollCrit(engine, broken);
  const damage = Math.max(1, Math.round(amount * (1 + affixBonus(engine, hit)) * (broken ? 2 : crit ? 1.5 : 1)));
  boss.hp -= damage;
  const head = above(boss.group.position, boss.stats.plate - 1);
  engine.effects.popup(head, crit ? `${damage}!` : damage, hitColor(engine, hit, crit));
  if (!dot) {
    boss.flash = 0.16;
    boss.knock.copy(dir).multiplyScalar(0.9 * knockback);
    impact(engine, boss, dir, hitStop, 0.04 + 0.02 * knockback);
    engine.shake = Math.min(0.8, engine.shake + shake);
    if (poise) damagePoise(engine, boss, poise);
    sfx.hit();
    engine.effects.spark(head, '#ffb27a');
  }
  weaponProc(engine, boss, damage, hit);

  if (boss.phase === 1 && boss.hp <= boss.maxHp * 0.5) {
    boss.phase = 2;
    boss.flash = 0.6;
    boss.state = 'stagger';
    boss.timer = Math.max(boss.timer, 0.9);
    boss.attackCooldown = 0.4;
    boss.nextAttack = 'aoe';
    engine.effects.blast(boss.group.position, 7, boss.color);
    engine.shake = 0.9;
    engine.setHint(`${boss.name} enters phase II`, 3);
  }

  if (boss.hp <= 0) {
    boss.hp = 0;
    boss.dead = true;
    boss.state = 'dead';
    boss.deathTimer = 0;
    boss.broken = 0;
    clearStatus(boss);
    engine.effects.blast(boss.group.position, 9, '#ffd166');
    engine.effects.ring(boss.group.position, 8, '#ff6b35', 0.8);
    engine.shake = 1;
    engine.onBossSlain(boss);
  }
}

export function damagePlayer(engine, amount, sourcePosition, source = null) {
  const player = engine.player;
  if (!player || player.dead || engine.state !== 'playing') return false;
  if (player.parryWindow > 0 || parryFrames(player)) {
    handleParry(engine, source);
    return true;
  }
  if (player.iframe > 0) return false;
  if (player.blocking && bulwark.defend(engine, amount, sourcePosition, source)) return true;
  sfx.hit();
  if (player.charging) engine.cancelCharge();

  player.hp = Math.max(0, player.hp - amount);
  player.flash = 0.24;
  player.iframe = 0.35;
  player.staminaDelay = PLAYER.regenDelay;

  const away = new THREE.Vector3().subVectors(player.group.position, sourcePosition);
  away.y = 0;
  if (away.lengthSq() < 0.01) away.set(0, 0, 1);
  away.normalize();
  player.knock.copy(away).multiplyScalar(5);

  engine.shake = Math.min(0.85, engine.shake + 0.4);
  engine.effects.popup(above(player.group.position, 2), Math.round(amount), '#ff6b6b');
  engine.effects.ring(player.group.position, 2, '#ff2d55', 0.35);

  if (player.hp <= 0) {
    player.dead = true;
    player.deathTimer = 0;
    engine.endTimer = 1.4;
    engine.endPhase = 'dead';
    engine.shake = 0.9;
    engine.effects.blast(player.group.position, 4, '#ff2d55');
  }
  return true;
}