import { ENEMY_TYPES, enemyStats, enemyCoins, bossCoins, bossVitals } from './bestiary';
import { QUADRANTS, GEMS } from './worldData';
import { ELEMENTS, AFFIX_CHANCE } from './elements';
import { DROP_RATES } from './inventory';
import { RARITIES, RARITY_ODDS } from './items';
import { ENEMY, BOSS } from './constants';
import { LORE, SIGNATURES } from './codexLore';

const RANK = { stalker: 'Skirmisher', brute: 'Brute', crawler: 'Crawler' };
const KING_COLOR = '#ff2d55';
const elementOf = (q) => Object.values(ELEMENTS).find((element) => element.biome === q.id);
const gearDrop = (rarity, chance) => ({ label: `${RARITIES[rarity].name} Gear`, chance, color: RARITIES[rarity].color });

function mobEntry(type, q) {
  const def = ENEMY_TYPES[type];
  const [low, high] = q.levels;
  const stats = enemyStats(type, low);
  const element = elementOf(q);
  return {
    id: type, name: def.name, tier: 'mob', rank: RANK[def.shape], biome: q.name, color: q.guardian.core,
    level: `Lv ${low}-${high}`, hp: stats.maxHp, damage: `${stats.damage}`, lore: LORE[type],
    attacks: [
      { name: SIGNATURES[type], detail: `${stats.damage} damage · ${stats.windup}s telegraphed wind-up` },
      { name: 'Lunge', detail: `Surges ${(stats.lunge * 0.2).toFixed(1)}m forward as it strikes` },
      { name: 'Hunt', detail: `Gives chase inside ${ENEMY.aggro}m and gives up past ${ENEMY.aggro * 2}m` },
    ],
    drops: [
      { label: 'Coins', chance: 1, note: `${enemyCoins(low, def.shape === 'brute')}+` },
      { label: 'Health Potion', chance: DROP_RATES.potion },
      gearDrop('common', DROP_RATES.gear * RARITY_ODDS.common),
      gearDrop('rare', DROP_RATES.gear * RARITY_ODDS.rare),
      gearDrop('legendary', DROP_RATES.gear * RARITY_ODDS.legendary),
      { label: `${element.label} Affix Weapon`, chance: DROP_RATES.gear * AFFIX_CHANCE, color: element.color },
    ],
  };
}

const bossAttacks = ({ chargeDamage, aoeDamage }, king) => [
  { name: king ? 'Lance Charge' : 'Charging Rush', detail: `${chargeDamage} damage · 1s telegraph, then a ${BOSS.chargeSpeed}m/s rush` },
  { name: king ? 'Void Cleave' : 'Ground Slam', detail: `${aoeDamage} damage in a ${BOSS.aoeRadius}m shockwave` },
  {
    name: king ? 'Kingsflame' : 'Enrage',
    detail: king ? 'At 50% HP he swells larger, his armour burns and his blade trails fire' : 'At 50% HP: faster steps, wider slams and shorter rests',
  },
];

function guardianEntry(q) {
  const level = q.levels[1];
  const vitals = bossVitals(level);
  const element = elementOf(q);
  return {
    id: q.gem, name: q.guardian.name, tier: 'guardian', rank: 'Guardian', biome: q.name, color: q.guardian.core,
    level: `Lv ${level}`, hp: vitals.hp, damage: `${vitals.chargeDamage} / ${vitals.aoeDamage}`, lore: LORE[q.gem],
    attacks: bossAttacks(vitals, false),
    drops: [
      { label: GEMS[q.gem].name, chance: 1, color: GEMS[q.gem].color },
      { label: 'Health Potion ×2', chance: 1 },
      { label: 'Coins', chance: 1, note: `${bossCoins(level)}` },
      gearDrop('rare', 1 - RARITY_ODDS.legendary),
      gearDrop('legendary', RARITY_ODDS.legendary),
      { label: `${element.label} Affix Weapon`, chance: AFFIX_CHANCE, color: element.color },
    ],
  };
}

function kingEntry() {
  const vitals = bossVitals(45, true);
  return {
    id: 'king', name: 'The Hollow King', tier: 'king', rank: 'Final Boss', biome: "Hollow King's Lair", color: KING_COLOR,
    level: 'Lv 45', hp: vitals.hp, damage: `${vitals.chargeDamage} / ${vitals.aoeDamage}`, lore: LORE.king,
    attacks: bossAttacks(vitals, true),
    drops: [{ label: 'XP Orbs ×10', chance: 1 }],
  };
}

// Codex pages grouped by where they're met: each biome's two mobs and its guardian, then the Hollow King.
export const CODEX_GROUPS = [
  ...QUADRANTS.map((q) => ({
    id: q.id, name: q.name, color: q.guardian.core, entries: [...q.enemies.map((type) => mobEntry(type, q)), guardianEntry(q)],
  })),
  { id: 'lair', name: "Hollow King's Lair", color: KING_COLOR, entries: [kingEntry()] },
];

export const CODEX_TOTAL = CODEX_GROUPS.reduce((total, group) => total + group.entries.length, 0);