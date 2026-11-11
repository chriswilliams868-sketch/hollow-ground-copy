// Gerald's questline: one gemstone per quest, in order. Each delivered gem unlocks a class weapon recipe.
export const GEM_ELEMENT = { emerald: 'poison', ruby: 'fire', sapphire: 'frost', obsidian: 'void' };

export const FORGE_COST = { emerald: 150, ruby: 350, sapphire: 600, obsidian: 900 };

export const FORGE = {
  vanguard: {
    emerald: { archetype: 'spear', name: 'Emerald Thornspear' },
    ruby: { archetype: 'claymore', name: 'Ruby Flame Claymore' },
    sapphire: { archetype: 'longsword', name: 'Sapphire Frostbrand' },
    obsidian: { archetype: 'longsword', name: 'Obsidian Void Blade' },
  },
  paladin: {
    emerald: { archetype: 'battleaxe', name: 'Emerald Greataxe' },
    ruby: { archetype: 'warhammer', name: 'Ruby Magma Maul' },
    sapphire: { archetype: 'greatsword', name: 'Sapphire Glacier Greatsword' },
    obsidian: { archetype: 'warhammer', name: 'Obsidian Void Hammer' },
  },
  assassin: {
    emerald: { archetype: 'katana', name: 'Emerald Venom Katana' },
    ruby: { archetype: 'throwingKnives', name: 'Ruby Ember Knives' },
    sapphire: { archetype: 'daggers', name: 'Sapphire Ice Daggers' },
    obsidian: { archetype: 'katana', name: 'Obsidian Void Edge' },
  },
  sharpshooter: {
    emerald: { archetype: 'blunderbuss', name: 'Emerald Viper Blunderbuss' },
    ruby: { archetype: 'handCannon', name: 'Ruby Flame Cannon' },
    sapphire: { archetype: 'sniper', name: 'Sapphire Frost Sniper' },
    obsidian: { archetype: 'handCannon', name: 'Obsidian Void Cannons' },
  },
};

export const QUEST_LINES = {
  emerald: "The Emerald Guardian holds the Dark Forest's north-west lair. Bring me its gemstone, I'll only borrow its light, and I'll show you what a real forge can do.",
  ruby: 'Fine work. Now the Desert Wastes, north-east. The Ruby Guardian carries a stone hotter than my coals.',
  sapphire: "South-west lies the Frost Tundra. The Sapphire Guardian's heart never thaws. Bring it here.",
  obsidian: 'One more. The Obsidian Guardian waits in the Shadow Ruins, south-east. Mind the dark.',
  done: "All four stones have sung on my anvil. Go and end the Hollow King. I'll keep the coals warm.",
};