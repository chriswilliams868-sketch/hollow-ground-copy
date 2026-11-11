// Your own 3D weapons. Each entry is sold by Gerald and fights exactly like the built-in weapon named in `actsAs`
// (same moves, animations, class skill bonus and stat types). Only heroes of that weapon's class see and wield it.
//
// To add one: export the model as a .glb, put the file online with a public link, copy the Blood Drinker entry
// below, give the copy its own `id`, `name` and `url`, and pick `actsAs` from:
//   Vanguard:     longsword, spear, claymore
//   Paladin:      warhammer, battleaxe, greatsword   (the tower shield stays in the other hand)
//   Assassin:     daggers, throwingKnives (a copy in each hand), katana
//   Sharpshooter: blunderbuss, handCannon (one in each hand), sniper
//
//   rarity: common, rare or legendary (stat strength and name colour)
//   price:  gold at Gerald's shop
//
// Fitting it to the hand (all optional). The longest side of the model becomes the weapon's length, with the
// handle expected at the bottom, the way Blockbench models usually stand.
//   length: size in the hand; leave it out to match the built-in weapon it acts as
//   grip:   where the fist holds it, from the handle end (0) to the tip (1); leave it out to match the built-in weapon
//   flip:   true if the model was built the other way up (handle at the top)
//   spin:   degrees to turn it around its length, e.g. 90 if its edge shows where its flat side should
//   glow:   0 to 1, lights the model's own colours so dark weapons stay visible at night
export const CUSTOM_WEAPONS = [
  {
    id: 'bloodDrinker',
    name: 'Blood Drinker',
    url: 'https://media.base44.com/files/public/6aec188c5ccff588f81da219/221562e0f_BloodDrinker.glb',
    actsAs: 'greatsword',
    rarity: 'legendary',
    price: 0,
    grip: 0.1,
    glow: 1,
    spin: 90,
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    url: 'https://raw.githubusercontent.com/chriswilliams868-sketch/hollow-ground-copy/main/Shotgun.glb',
    actsAs: 'blunderbuss',
    rarity: 'legendary',
    price: 0,
    grip: 0.2,
    flip:0.1,
    glow: 0.3,
  },
];