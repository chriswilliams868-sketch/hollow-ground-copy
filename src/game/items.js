import { ELEMENTS, rollAffix } from './elements';
import { gearOptions } from './arsenal';

export const RARITIES = {
  common: { name: 'Common', color: '#cbd5e1', power: 1 },
  rare: { name: 'Rare', color: '#60a5fa', power: 1.9 },
  legendary: { name: 'Legendary', color: '#f59e0b', power: 3.2 },
  boss: { name: 'Boss-Tier', color: '#ff5d8f', power: 4.4 },
};


const ROLLS = { damage: 0.06, attackSpeed: 0.04, crit: 0.03, poise: 0.1, maxHp: 10, parry: 0.01, fireRate: 0.06, guard: 0.06 };
const LABELS = { damage: 'Damage', attackSpeed: 'Attack Speed', crit: 'Crit Chance', poise: 'Poise Damage', maxHp: 'Max HP', parry: 'Parry Window', fireRate: 'Fire Rate', guard: 'Block Efficiency' };
const PREFIX = {
  common: ['Worn', 'Iron', 'Plain'],
  rare: ['Tempered', 'Runed', 'Moonlit'],
  legendary: ['Hollowbane', 'Kingsfall', 'Emberheart'],
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const statLabel = (stat, classId) => (stat === 'damage' && classId === 'sharpshooter' ? 'Burst Damage' : LABELS[stat]);

export function formatStat(stat, value) {
  if (stat === 'maxHp') return `+${Math.round(value)}`;
  if (stat === 'parry') return `+${Math.round(value * 1000)}ms`;
  return `+${Math.round(value * 100)}%`;
}

export const RARITY_ODDS = { common: 0.68, rare: 0.26, legendary: 0.06 };

function rollRarity(minRare) {
  const r = Math.random();
  if (r < RARITY_ODDS.legendary) return 'legendary';
  if (r < RARITY_ODDS.legendary + RARITY_ODDS.rare || minRare) return 'rare';
  return 'common';
}

// forged: the gemstone a boss-tier weapon was forged from (fixed top rolls instead of random ones).
function makeGear(classId, base, rarity, level, name, affix, forged = null) {
  const scale = RARITIES[rarity].power * (1 + level * 0.025);
  const stats = {};
  base.stats.forEach((stat) => {
    stats[stat] = ROLLS[stat] * scale * (forged ? 1.1 : 0.85 + Math.random() * 0.3);
  });
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    classId,
    slot: base.slot || 'weapon',
    archetype: base.id,
    kind: base.name,
    rarity,
    level,
    name,
    stats,
    affix,
    ...(forged ? { forged } : {}),
  };
}

// biome: where the drop happened; weapons there may roll that biome's elemental affix.
export function rollGear(classId, level, biome, minRare = false) {
  // Class-locked: each class only rolls its own three weapon archetypes (+ the Paladin's shield)
  const base = pick(gearOptions(classId));
  const rarity = rollRarity(minRare);
  const affix = (base.slot || 'weapon') === 'weapon' ? rollAffix(biome, RARITIES[rarity].power) : null;
  return makeGear(classId, base, rarity, level, `${affix ? `${ELEMENTS[affix.element].prefix} ` : ''}${pick(PREFIX[rarity])} ${base.name}`, affix);
}

// Gerald's boss-tier weapon: the recipe's archetype with a guaranteed, maxed gemstone element.
export function forgeGear(classId, recipe, gem, element, level) {
  const base = gearOptions(classId).find((option) => option.id === recipe.archetype);
  const affix = { element, power: 0.12 * RARITIES.boss.power * (element === 'poison' ? 1.6 : 1) };
  return makeGear(classId, base, 'boss', level, recipe.name, affix, gem);
}

// A custom weapon (custom/customWeapons.js): the archetype it acts as at its listed rarity, wearing its own model.
export function customGear(classId, def, level) {
  const base = gearOptions(classId).find((option) => option.id === def.actsAs);
  return { ...makeGear(classId, base, def.rarity, level, def.name, null), model: def.id };
}

export function gearStats(items) {
  const total = { damage: 0, attackSpeed: 0, crit: 0, poise: 0, maxHp: 0, parry: 0, fireRate: 0, guard: 0 };
  items.forEach((item) => Object.entries(item.stats).forEach(([stat, value]) => {
    total[stat] = (total[stat] || 0) + value;
  }));
  return total;
}