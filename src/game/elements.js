// Biome-bound elemental weapon affixes.
export const ELEMENTS = {
  frost: { prefix: 'Glacial', label: 'Frost', color: '#22d3ee', biome: 'tundra', effect: '20% chance on hit to freeze for 2s' },
  fire: { prefix: 'Searing', label: 'Fire', color: '#fb923c', biome: 'desert', effect: 'Hits set enemies burning for 3s' },
  void: { prefix: 'Voidtouched', label: 'Void', color: '#a855f7', biome: 'ruins', effect: '5% lifesteal on hit' },
  poison: { prefix: 'Venomous', label: 'Poison', color: '#4ade80', biome: 'forest', effect: 'Hits poison enemies for 3s' },
};

export const STATUS_COLORS = { poison: '#4ade80', burn: '#fb923c', bleed: '#fb7185' };

export const AFFIX_CHANCE = 0.35;

export function rollAffix(biome, rarityPower) {
  const element = Object.keys(ELEMENTS).find((id) => ELEMENTS[id].biome === biome);
  if (!element || Math.random() >= AFFIX_CHANCE) return null;
  const power = 0.12 * rarityPower * (0.85 + Math.random() * 0.3) * (element === 'poison' ? 1.6 : 1);
  return { element, power };
}

export function affixText(affix) {
  const pct = Math.round(affix.power * 100);
  return affix.element === 'poison' ? `+${pct}% Poison damage over 3s` : `+${pct}% ${ELEMENTS[affix.element].label} damage`;
}