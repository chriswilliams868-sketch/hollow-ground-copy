import { buildEmerald } from './emerald';
import { buildRuby } from './ruby';
import { buildSapphire } from './sapphire';
import { buildObsidian } from './obsidian';
import { buildKing } from './king';

// Bespoke boss models keyed by guardian gem (or 'king'): { group, height, radius?, parts }.
export const BOSS_MODELS = {
  emerald: buildEmerald,
  ruby: buildRuby,
  sapphire: buildSapphire,
  obsidian: buildObsidian,
  king: buildKing,
};