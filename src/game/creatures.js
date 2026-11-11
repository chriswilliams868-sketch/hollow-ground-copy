import { ENEMY_MODELS } from './models/enemies';

// Builds the bespoke biome model for an enemy type.
export function buildCreature(typeId) {
  return ENEMY_MODELS[typeId]();
}