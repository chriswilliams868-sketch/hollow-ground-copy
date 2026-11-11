import { ENEMY, BOSS } from './constants';

// Body archetypes: collision radius, nameplate height and attack timing.
export const SHAPES = {
  stalker: { radius: 0.45, plate: 2.2, range: 1.9, windup: 0.55, recover: 0.8, lunge: 7 },
  brute: { radius: 0.75, plate: 3.1, range: 2.4, windup: 0.8, recover: 1, lunge: 5 },
  crawler: { radius: 0.6, plate: 1.6, range: 2, windup: 0.42, recover: 0.7, lunge: 9 },
};

// Stats per type; each type has its own bespoke model in models/enemies.
export const ENEMY_TYPES = {
  forest_stalker: { name: 'Forest Stalker', shape: 'stalker', hp: 1, damage: 1, speed: 1.1 },
  wooden_treant: { name: 'Wooden Treant', shape: 'brute', hp: 1.6, damage: 1.3, speed: 0.75 },
  sand_marauder: { name: 'Sand Marauder', shape: 'stalker', hp: 1.1, damage: 1.05, speed: 1 },
  dune_crawler: { name: 'Dune Crawler', shape: 'crawler', hp: 0.8, damage: 0.9, speed: 1.35 },
  frost_revenant: { name: 'Frost Revenant', shape: 'stalker', hp: 1, damage: 1.1, speed: 1.1 },
  glacial_golem: { name: 'Glacial Golem', shape: 'brute', hp: 1.8, damage: 1.4, speed: 0.7 },
  void_cultist: { name: 'Void Cultist', shape: 'stalker', hp: 0.95, damage: 1.2, speed: 1.15 },
  shadow_abomination: { name: 'Shadow Abomination', shape: 'brute', hp: 2, damage: 1.5, speed: 0.8 },
};

export function enemyStats(typeId, level) {
  const type = ENEMY_TYPES[typeId];
  return {
    ...SHAPES[type.shape],
    maxHp: Math.round(ENEMY.maxHp * type.hp * (1 + (level - 1) * 0.1)),
    damage: Math.round(ENEMY.damage * type.damage * (1 + (level - 1) * 0.09)),
    speed: ENEMY.speed * type.speed,
    chaseSpeed: ENEMY.chaseSpeed * type.speed,
  };
}

// Coins a fallen mob or guardian scatters.
export const enemyCoins = (level, big) => Math.round((3 + level * 1.2) * (big ? 1.5 : 1));
export const bossCoins = (level) => 60 + level * 6;

// Boss-fight numbers for a guardian (or the Hollow King) at a level.
export function bossVitals(level, king = false) {
  const scale = 1 + (level - 1) * 0.08;
  return {
    hp: Math.round(king ? 1500 : 260 * (1 + (level - 1) * 0.09)),
    chargeDamage: Math.round(BOSS.chargeDamage * scale),
    aoeDamage: Math.round(BOSS.aoeDamage * scale),
  };
}