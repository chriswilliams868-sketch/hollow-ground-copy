import { PLAYER } from '../constants';

// Weapons (war hammer, battle axe, greatsword + tower shield) live in arsenal/paladin.js.
export default {
  id: 'paladin',
  name: 'Paladin',
  role: 'Heavy Tank',
  blurb:
    'An iron knight with a tower shield and a war hammer, battle axe or greatsword. Hold Bulwark Block to stop every blow at a stamina cost.',
  traits: ['+40% HP', 'Slower', 'Shield block'],
  passive: 'Bulwark',
  accent: '#ffcf6b',
  bars: { vitality: 5, speed: 2, power: 4, reach: 3 },
  hp: 1.4,
  speed: 0.82,
  attackSpeed: 1,
  critChance: 0.08,
  parryWindow: 0.25,
  dodge: PLAYER.dodge,
};