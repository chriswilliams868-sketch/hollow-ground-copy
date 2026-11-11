export const RELICS = [
  { id: 'swift', name: 'Quickened Edge', desc: '+20% attack speed' },
  { id: 'firering', name: 'Cinder Step', desc: 'Fire ring on dash' },
  { id: 'leech', name: 'Blood Ward', desc: 'Heal 12 HP on parry' },
  { id: 'might', name: 'Ember Fang', desc: '+20% damage' },
  { id: 'vigor', name: 'Hollow Heart', desc: '+25 max HP' },
  { id: 'breath', name: 'Second Wind', desc: '+40% stamina regen' },
];

export function rollRelics(count = 3, owned = []) {
  return RELICS.filter((relic) => !owned.includes(relic.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function relicMods(ids) {
  return {
    attackSpeed: ids.includes('swift') ? 1.2 : 1,
    damage: ids.includes('might') ? 1.2 : 1,
    regen: ids.includes('breath') ? 1.4 : 1,
  };
}