import { ENEMY_MODELS } from '../models/enemies';
import { BOSS_MODELS } from '../models/bosses';
import { weaponModel } from '../heroes/weapons';

// Codex turntable: a mob or boss voxel model running its idle animation (cloth, glows, hovering, spinning crystals).
export function creatureSubject(id) {
  return {
    yaw: 0.5,
    pitch: 0.2,
    spin: 0.35,
    build() {
      if (BOSS_MODELS[id]) {
        const { group, parts } = BOSS_MODELS[id]();
        const boss = { phase: 1, dead: false, stats: {} };
        return {
          object: group,
          animate: (dt) => {
            parts.animate(null, boss, dt);
            parts.core.rotation.y += dt * 2;
            parts.core.rotation.x += dt * 1.3;
          },
          dispose: () => parts.dispose?.(),
        };
      }
      const { group, parts } = ENEMY_MODELS[id]();
      return { object: group, animate: parts.animate };
    },
  };
}

// Inventory inspector: the item's weapon hovering on a continuous spin.
export const weaponSubject = (item) => ({ pitch: 0.12, spin: 0.8, hover: true, build: () => ({ object: weaponModel(item) }) });