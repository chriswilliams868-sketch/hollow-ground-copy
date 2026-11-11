import { CLASSES } from './classes';

const KEY = 'hollow-ground-save-v1';

// Fields added later (name, coins, quest, forged, buffs) are optional, so older saves still load.
export function loadSave() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    return data && data.version === 1 && CLASSES[data.classId] ? data : null;
  } catch {
    return null;
  }
}

export function writeSave(engine) {
  const data = {
    version: 1,
    savedAt: Date.now(),
    classId: engine.cls.id,
    name: engine.heroName,
    level: engine.level,
    xp: engine.xp,
    kills: engine.kills,
    inventory: engine.inventory,
    equipped: engine.equipped,
    gems: engine.gems,
    doors: engine.doors,
    relics: engine.relics,
    coins: engine.coins,
    quest: engine.quest,
    forged: engine.forged,
    buffs: engine.buffs,
    codex: [...engine.codex],
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}