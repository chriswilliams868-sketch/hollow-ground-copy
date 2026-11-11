import { GEM_ORDER, GEMS } from './worldData';
import { BUFFS } from './buffs';
import { FORGE, FORGE_COST, GEM_ELEMENT, QUEST_LINES } from './forgeRecipes';
import { forgeGear, customGear } from './items';
import { BAG_SLOTS, equip } from './inventory';
import { sfx } from './audio';
import { gearOptions } from './arsenal';
import { CUSTOM_WEAPONS } from './custom/customWeapons';

export const CONSUMABLES = [
  { id: 'potion', name: 'Health Potion', desc: 'Restores 40% HP · stored in your bag', price: 25 },
  { id: 'might', name: 'Damage Elixir', desc: '+30% damage for 3 minutes', price: 60 },
  { id: 'stamina', name: 'Stamina Tonic', desc: '+75% stamina regen for 3 minutes', price: 45 },
];

const bagFull = (engine) => engine.inventory.items.length >= BAG_SLOTS;

// Plain-data snapshot for Gerald's shop modal.
export function shopData(engine) {
  const next = GEM_ORDER[engine.quest] || null;
  return {
    coins: Math.floor(engine.coins),
    notice: engine.shopNotice,
    quest: { stage: engine.quest, gem: next, line: QUEST_LINES[next || 'done'], ready: !!next && engine.gems.includes(next) },
    recipes: GEM_ORDER.map((gem, i) => ({
      gem,
      ...FORGE[engine.cls.id][gem],
      cost: FORGE_COST[gem],
      element: GEM_ELEMENT[gem],
      unlocked: i < engine.quest,
      forged: engine.forged.includes(gem),
    })),
    consumables: CONSUMABLES.map((item) => ({ ...item, owned: item.id === 'potion' ? engine.inventory.potions : Math.ceil(engine.buffs[item.id]) })),
    // Custom weapons acting as one of this class's archetypes
    weapons: CUSTOM_WEAPONS.flatMap((def) => {
      const base = gearOptions(engine.cls.id).find((option) => option.id === def.actsAs);
      if (!base) return [];
      const owned = engine.inventory.items.some((item) => item.model === def.id);
      return [{ id: def.id, name: def.name, rarity: def.rarity, price: def.price, archetype: def.actsAs, kind: base.name, owned }];
    }),
    bagFull: bagFull(engine),
  };
}

function pay(engine, price) {
  if (engine.coins < price) {
    engine.shopNotice = 'Not enough gold';
    sfx.unlock();
    return false;
  }
  engine.coins -= price;
  sfx.coin();
  return true;
}

// A custom weapon off Gerald's rack: rolled at the hero's level and equipped straight away.
function buyWeapon(engine, def) {
  if (bagFull(engine)) {
    engine.shopNotice = 'Your bag is full · discard gear from the pause menu first';
    return;
  }
  if (!pay(engine, def.price)) return;
  const item = customGear(engine.cls.id, def, engine.level);
  engine.inventory.items.push(item);
  engine.shopNotice = `${item.name} bought and equipped`;
  equip(engine, item.id);
}

export function buy(engine, id) {
  const item = CONSUMABLES.find((entry) => entry.id === id);
  if (!item) {
    const weapon = CUSTOM_WEAPONS.find((def) => def.id === id);
    if (weapon) buyWeapon(engine, weapon);
    return;
  }
  if (!pay(engine, item.price)) return;
  if (id === 'potion') engine.inventory.potions += 1;
  else {
    engine.buffs[id] = BUFFS[id].duration;
    engine.refreshStats();
  }
  engine.shopNotice = `Bought ${item.name}`;
  engine.save();
}

// Hand over the current quest's gemstone. Gerald only borrows its light: the gem still counts for the Hollow Gateway.
export function deliver(engine) {
  const gem = GEM_ORDER[engine.quest];
  if (!gem || !engine.gems.includes(gem)) return;
  engine.quest += 1;
  sfx.gem();
  engine.effects.blast(engine.player.group.position, 3.5, GEMS[gem].color);
  engine.shopNotice = `Quest complete · ${FORGE[engine.cls.id][gem].name} can now be forged`;
  engine.save();
}

export function craft(engine, gem) {
  if (GEM_ORDER.indexOf(gem) >= engine.quest || engine.forged.includes(gem)) return;
  if (bagFull(engine)) {
    engine.shopNotice = 'Your bag is full · discard gear from the pause menu first';
    return;
  }
  if (!pay(engine, FORGE_COST[gem])) return;
  const item = forgeGear(engine.cls.id, FORGE[engine.cls.id][gem], gem, GEM_ELEMENT[gem], engine.level);
  engine.inventory.items.push(item);
  engine.forged = [...engine.forged, gem];
  sfx.anvil();
  engine.effects.blast(engine.player.group.position, 3, GEMS[gem].color);
  engine.shopNotice = `${item.name} forged and equipped`;
  equip(engine, item.id);
}