import woodenTreant from './woodenTreant';
import forestStalker from './forestStalker';
import sandMarauder from './sandMarauder';
import duneCrawler from './duneCrawler';
import glacialGolem from './glacialGolem';
import frostRevenant from './frostRevenant';
import voidCultist from './voidCultist';
import shadowAbomination from './shadowAbomination';

// One bespoke model per enemy type (no palette swaps).
export const ENEMY_MODELS = {
  forest_stalker: forestStalker,
  wooden_treant: woodenTreant,
  sand_marauder: sandMarauder,
  dune_crawler: duneCrawler,
  frost_revenant: frostRevenant,
  glacial_golem: glacialGolem,
  void_cultist: voidCultist,
  shadow_abomination: shadowAbomination,
};