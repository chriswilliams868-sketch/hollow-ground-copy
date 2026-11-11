import { PLAYER } from '../constants';

// Weapons (longsword, spear, claymore) live in arsenal/vanguard.js.
export default {
  id: 'vanguard',
  name: 'Vanguard',
  role: 'Default Hero',
  blurb:
    'Crimson-and-orange armored hero wielding longswords, spears or claymores. Rhythmic combos, a charged heavy on hold, and a precision Timed Parry.',
  traits: ['Balanced', 'Charged heavy', 'Timed parry'],
  passive: 'Charged Slam',
  accent: '#ff6b35',
  bars: { vitality: 3, speed: 3, power: 3, reach: 2 },
  hp: 1,
  speed: 1,
  attackSpeed: 1,
  critChance: 0.12,
  parryWindow: 0.2,
  dodge: PLAYER.dodge,
};