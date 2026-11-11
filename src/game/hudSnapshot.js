import { xpToNext, MAX_LEVEL } from './progression';
import { QUADRANTS } from './worldData';
import { skillHud } from './skills';
import { buffHud } from './buffs';

function regionInfo(engine) {
  if (engine.zone === 'lair') return { name: 'Hollow Lair', levels: 'Lv 45' };
  if (engine.regionId === 'cottage') return { name: 'Hearthwood Cottage', levels: 'Sanctuary' };
  const q = QUADRANTS.find((entry) => entry.id === engine.regionId);
  return q ? { name: q.name, levels: `Lv ${q.levels[0]}-${q.levels[1]}` } : { name: 'Crossroads', levels: 'Sanctuary' };
}

// Plain-data snapshot of everything the React HUD shows; the engine diffs it before pushing.
export function hudSnapshot(engine) {
  const { player, boss, cls, stats } = engine;
  const { kit } = player;
  const ranged = kit.ranged;
  return {
    hp: Math.max(0, Math.round(player.hp)),
    maxHp: player.maxHp,
    stamina: Math.max(0, Math.round(player.stamina)),
    maxStamina: player.maxStamina,
    boss:
      boss && !boss.dead
        ? { hp: Math.max(0, Math.round(boss.hp)), maxHp: boss.maxHp, phase: boss.phase, poise: Math.round(boss.poise), name: boss.name, level: boss.level }
        : null,
    hint: engine.hint,
    skill: skillHud(engine),
    weapon: { id: kit.id, name: kit.name, link: kit.skill.text, element: engine.affix?.element || null },
    relics: engine.relics,
    critical: !!(boss && !boss.dead && boss.broken > 0),
    charge: player.charging ? Math.round(Math.min(1, player.chargeTime / kit.heavy.maxCharge) * 20) / 20 : 0,
    locked: !!engine.lock.target,
    classId: cls.id,
    ammo: player.ammo,
    maxAmmo: ranged ? ranged.shots : 0,
    reload: ranged ? Math.ceil((player.reload / stats.reloadSpeed) * 10) / 10 : 0,
    reloadMax: ranged ? ranged.reload / stats.reloadSpeed : 0,
    level: engine.level,
    xp: Math.floor(engine.xp),
    xpNext: engine.level >= MAX_LEVEL ? 0 : xpToNext(engine.level),
    potions: engine.inventory.potions,
    gems: engine.gems,
    region: regionInfo(engine),
    saved: engine.savedFlash > 0,
    name: engine.heroName,
    coins: Math.floor(engine.coins),
    buffs: buffHud(engine),
    interact: engine.gerald.near,
  };
}