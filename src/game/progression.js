import { PLAYER } from './constants';
import { sfx } from './audio';
import { above } from './grounding';

export const MAX_LEVEL = 40;
export const xpToNext = (level) => Math.round(50 + 22 * level ** 1.6);
export const enemyXp = (level, big = false) => Math.round((10 + level * 5 + level * level * 0.9) * (big ? 1.4 : 1));

// Everything that scales with level, gear and relics, in one place.
export function deriveStats(engine) {
  const { cls, level, mods, gear, relics, buffs } = engine;
  return {
    damage: mods.damage * (1 + 0.05 * (level - 1)) * (1 + gear.damage) * (buffs.might > 0 ? 1.3 : 1),
    attackSpeed: mods.attackSpeed * (1 + gear.attackSpeed),
    reloadSpeed: mods.attackSpeed * (1 + gear.fireRate),
    crit: cls.critChance + gear.crit,
    parryWindow: cls.parryWindow + gear.parry,
    poise: 1 + gear.poise,
    speed: PLAYER.speed * cls.speed,
    maxHp: Math.round(PLAYER.maxHp * cls.hp) + 10 * (level - 1) + Math.round(gear.maxHp) + (relics.includes('vigor') ? 25 : 0),
  };
}

function levelUp(engine) {
  const player = engine.player;
  engine.refreshStats();
  player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.5);
  player.stamina = Math.min(player.maxStamina, player.stamina + player.maxStamina * 0.5);
  const pos = player.group.position;
  engine.effects.blast(pos, 4, '#ffd166');
  engine.effects.ring(pos, 5, '#fff1c2', 0.6);
  engine.effects.popup(above(pos, 2.6), `LEVEL ${engine.level}`, '#ffd166');
  sfx.levelUp();
  engine.setHint(`Level ${engine.level} · +10 Max HP · +5% damage`, 3);
  engine.save();
}

export function grantXp(engine, amount) {
  if (engine.level >= MAX_LEVEL) return;
  engine.xp += amount;
  let leveled = false;
  while (engine.level < MAX_LEVEL && engine.xp >= xpToNext(engine.level)) {
    engine.xp -= xpToNext(engine.level);
    engine.level += 1;
    leveled = true;
  }
  if (engine.level >= MAX_LEVEL) engine.xp = 0;
  if (leveled) levelUp(engine);
}