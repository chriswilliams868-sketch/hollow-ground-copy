// Weapons (twin daggers, katana, throwing knives) live in arsenal/assassin.js.
export default {
  id: 'assassin',
  name: 'Assassin',
  role: 'Agile Skirmisher',
  blurb:
    'A violet shadow with daggers, a katana or throwing knives. Lightning combos, lethal crits, and a smoke bomb that poisons foes as you slip away.',
  traits: ['-15% HP', '+30% atk speed', 'Smoke bomb'],
  passive: 'Killing Edge',
  accent: '#a78bfa',
  bars: { vitality: 2, speed: 5, power: 3, reach: 1 },
  hp: 0.85,
  speed: 1.1,
  attackSpeed: 1.3,
  critChance: 0.35,
  parryWindow: 0.2,
  dodge: { cost: 20, duration: 0.32, speed: 17, iframe: 0.3 },
};