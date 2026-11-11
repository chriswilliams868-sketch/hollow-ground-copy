import { gearStats, rollGear, RARITIES } from './items';
import { sfx } from './audio';
import { GEMS } from './worldData';
import { biomeAt } from './biomes';
import { dressWeapons } from './heroes/weapons';
import { weaponKit } from './arsenal';
import { restHands } from './weaponPose';
import { above } from './grounding';

export const BAG_SLOTS = 15; // gear slots; potions stack in their own slot

export const freshInventory = () => ({ potions: 2, items: [] });

const findItem = (engine, id) => engine.inventory.items.find((item) => item.id === id);

function tierOf(engine, slot) {
  const item = findItem(engine, engine.equipped[slot]);
  return item ? item.rarity : 'common';
}

// Recompute gear bonuses, load the equipped weapon archetype and swap the 3D meshes to match.
export function applyGear(engine) {
  const player = engine.player;
  const items = Object.values(engine.equipped).map((id) => findItem(engine, id)).filter(Boolean);
  const weapon = findItem(engine, engine.equipped.weapon);
  engine.gear = gearStats(items);
  engine.affix = weapon?.affix || null;
  const kit = weaponKit(engine.cls.id, weapon?.archetype);
  if (player.kit?.id !== kit.id) {
    // New weapon type in hand: drop any swing, charge or reload from the old one
    engine.cancelCharge();
    Object.assign(player, { kit, attack: null, comboIndex: 0, comboTimer: 0, reload: 0, shotTimer: 0, gun: 0, ammo: kit.ranged ? kit.ranged.shots : 0 });
  }
  // Boss-tier weapons use the legendary meshes, re-lit in their gemstone's colour
  const tier = weapon?.rarity === 'boss' ? 'legendary' : weapon?.rarity || 'common';
  dressWeapons(player.parts, kit, { weapon: tier, shield: tierOf(engine, 'shield'), tint: weapon?.forged ? GEMS[weapon.forged].color : null, model: weapon?.model });
  restHands(player);
  engine.refreshStats();
}

export function equip(engine, id) {
  const item = findItem(engine, id);
  if (!item || item.classId !== engine.cls.id) return;
  engine.equipped = { ...engine.equipped, [item.slot]: id };
  applyGear(engine);
  sfx.equip();
  engine.save();
}

export function discard(engine, id) {
  engine.inventory.items = engine.inventory.items.filter((item) => item.id !== id);
  const slot = Object.keys(engine.equipped).find((key) => engine.equipped[key] === id);
  if (slot) {
    engine.equipped = { ...engine.equipped, [slot]: null };
    applyGear(engine);
  }
  sfx.click();
  engine.save();
}

export function drinkPotion(engine) {
  const player = engine.player;
  if (engine.state !== 'playing' && engine.state !== 'paused') return false;
  if (!player || player.dead || engine.inventory.potions <= 0 || player.hp >= player.maxHp || engine.potionCooldown > 0) return false;
  engine.inventory.potions -= 1;
  const heal = Math.round(player.maxHp * 0.4);
  player.hp = Math.min(player.maxHp, player.hp + heal);
  engine.potionCooldown = 0.8;
  engine.effects.popup(above(player.group.position, 2.2), `+${heal}`, '#4ade80');
  engine.effects.ring(player.group.position, 2.2, '#4ade80', 0.45);
  sfx.potion();
  return true;
}

export const DROP_RATES = { potion: 0.22, gear: 0.15 };

// Health potions plus a 15% chance of gear rolled for the player's CURRENT class.
export function rollDrops(engine, enemy) {
  const pos = enemy.group.position;
  if (Math.random() < DROP_RATES.potion) engine.loot.spawn('potion', null, pos);
  if (Math.random() < DROP_RATES.gear) engine.loot.spawn('gear', rollGear(engine.cls.id, enemy.level, biomeAt(pos.x, pos.z).id), pos);
}

export function collectLoot(engine, item) {
  const head = above(engine.player.group.position, 2.2);
  if (item.kind === 'potion') {
    engine.inventory.potions += 1;
    engine.effects.popup(head, '+1 Potion', '#f87171');
    sfx.pickup();
    return true;
  }
  if (item.kind === 'gear') {
    if (engine.inventory.items.length >= BAG_SLOTS) {
      if (engine.time > engine.bagHintAt) {
        engine.bagHintAt = engine.time + 4;
        engine.setHint('Inventory full — discard gear from the pause menu', 2.5);
      }
      return false;
    }
    engine.inventory.items.push(item.data);
    const rarity = RARITIES[item.data.rarity];
    engine.effects.popup(head, rarity.name, rarity.color);
    engine.setHint(`Found ${item.data.name}`, 2.2);
    sfx.loot();
    return true;
  }
  engine.collectGem(item.data);
  return true;
}