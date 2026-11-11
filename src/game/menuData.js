import { xpToNext, MAX_LEVEL } from './progression';
import { BAG_SLOTS } from './inventory';
import { getVolumes } from './audio';
import { SKILL_DEFS } from './skills/defs';
import { ELEMENTS } from './elements';
import { WORLD } from './worldData';

// Snapshot for the pause menu tabs (map, stats, inventory, settings).
export function menuData(engine) {
  const { player, cls, stats } = engine;
  const pos = player.group.position;
  const { kit } = player;
  const baseHit = kit.ranged ? kit.ranged.damage * kit.ranged.pellets : kit.combo[0].damage;
  return {
    classId: cls.id,
    seed: engine.seed,
    map: {
      seed: engine.seed,
      gateway: { x: WORLD.gateway.x, z: WORLD.gateway.z, found: engine.gatewayFound, open: !!engine.doors.dungeon },
      x: pos.x,
      z: pos.z,
      facing: player.facing,
      zone: engine.zone,
      gems: engine.gems,
      slain: [...engine.slain],
    },
    stats: {
      level: engine.level,
      xp: Math.floor(engine.xp),
      xpNext: engine.level >= MAX_LEVEL ? 0 : xpToNext(engine.level),
      heroName: engine.heroName,
      coins: Math.floor(engine.coins),
      className: cls.name,
      weapon: kit.name,
      baseDamage: Math.round(baseHit * stats.damage),
      damageBonus: Math.round((stats.damage - 1) * 100),
      skillName: SKILL_DEFS[cls.id].name,
      skillDetail: {
        parry: `${Math.round(stats.parryWindow * 1000)}ms window`,
        bulwark: `${Math.round(15 * (kit.skill.blockCost || 1) * (1 - Math.min(0.6, engine.gear.guard || 0)))} stamina / hit`,
      }[SKILL_DEFS[cls.id].id] || `${kit.skill.cooldown || SKILL_DEFS[cls.id].cooldown}s cooldown`,
      element: engine.affix ? ELEMENTS[engine.affix.element].label : 'None',
      moveSpeed: stats.speed.toFixed(1),
      attackSpeed: Math.round(stats.attackSpeed * cls.attackSpeed * 100),
      crit: Math.round(stats.crit * 100),
      hp: Math.round(player.hp),
      maxHp: player.maxHp,
      kills: engine.kills,
      gems: engine.gems.length,
    },
    inventory: {
      potions: engine.inventory.potions,
      items: engine.inventory.items,
      equipped: engine.equipped,
      bagSlots: BAG_SLOTS,
      canDrink: player.hp < player.maxHp,
    },
    volumes: getVolumes(),
    codex: [...engine.codex],
  };
}