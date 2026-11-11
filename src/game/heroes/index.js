import { weaponKit } from '../arsenal';
import { applyPose } from '../weaponPose';
import { dressWeapons } from './weapons';
import { buildVanguard } from './vanguard';
import { buildPaladin } from './paladin';
import { buildAssassin } from './assassin';
import { buildSharpshooter } from './sharpshooter';

const BUILDERS = {
  vanguard: buildVanguard,
  paladin: buildPaladin,
  assassin: buildAssassin,
  sharpshooter: buildSharpshooter,
};

// Builds a class model holding its default weapon (common tier) in that weapon's rest pose.
export function buildHero(id) {
  const hero = BUILDERS[id]();
  const kit = weaponKit(id);
  dressWeapons(hero.parts, kit);
  applyPose(hero.parts.weapon, kit.rest.main);
  if (hero.parts.offhand) applyPose(hero.parts.offhand, kit.rest.off);
  return hero;
}