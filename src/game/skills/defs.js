// Class-specific secondary skills (the F / right-click / skill button action).
export const SKILL_DEFS = {
  vanguard: {
    id: 'parry',
    name: 'Timed Parry',
    desc: '200ms precision parry. A perfect parry freezes the moment and makes your counter-attacks critical.',
    cooldown: 1.5,
    color: '#5ee7ff',
  },
  paladin: {
    id: 'bulwark',
    name: 'Bulwark Block',
    desc: 'Hold to raise your tower shield. Blocks all damage but drains 15 stamina per hit. No attacks while blocking.',
    cooldown: 1.2,
    hold: true,
    color: '#ffcf6b',
  },
  assassin: {
    id: 'smoke',
    name: 'Poison Smoke Bomb',
    desc: 'Drop a toxic cloud and spring 3m back. Enemies inside are poisoned for 5s and slowed 30%.',
    cooldown: 8,
    color: '#4ade80',
  },
  sharpshooter: {
    id: 'satchel',
    name: 'Satchel Bomb',
    desc: 'Lob a satchel 5m ahead. It explodes after 1.2s for massive fire and poise damage, knocking enemies back.',
    cooldown: 10,
    color: '#fb923c',
  },
};