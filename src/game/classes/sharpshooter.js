import { PLAYER } from '../constants';

// Guns (blunderbusses, hand cannons, sniper cannon) live in arsenal/sharpshooter.js.
export default {
  id: 'sharpshooter',
  name: 'Sharpshooter',
  role: 'Ranged Specialist',
  blurb:
    'A deep-green rogue with blunderbusses, hand cannons or a sniper cannon. Keep your distance and lob satchel bombs into the crowd.',
  traits: ['Ranged', 'Reload timing', 'Satchel bomb'],
  passive: 'Twin Barrels',
  accent: '#4ade80',
  bars: { vitality: 3, speed: 3, power: 4, reach: 5 },
  hp: 1,
  speed: 1,
  attackSpeed: 1,
  critChance: 0.15,
  parryWindow: 0.2,
  dodge: PLAYER.dodge,
};