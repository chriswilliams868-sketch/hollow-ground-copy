// Sharpshooter guns. Each one changes how the Satchel Bomb (skill) plays out.
const blunderbuss = {
  id: 'blunderbuss',
  name: 'Blunderbusses',
  trait: '2-shot heavy cone burst · 3.5s reload',
  stats: ['damage', 'fireRate'],
  hands: { main: 'blunderbuss', off: 'blunderbuss' },
  skill: { text: 'Satchel blast radius +35%', radius: 1.35 },
  rest: { main: { yaw: -0.12, pitch: 0, y: 1.0, z: 0.16 }, off: { yaw: 0.12, pitch: 0, y: 1.0, z: 0.16 } },
  // Both guns twirl round their trigger guards on settling into the idle stance (one more turn while reloading)
  flourish: { hands: 'both', turns: 2, duration: 0.6, every: 5 },
  poses: {
    // Barrels tipped up while reloading
    reload: { main: { yaw: -0.5, pitch: -1.25, y: 1.14, z: 0.02 }, off: { yaw: 0.5, pitch: -1.25, y: 1.14, z: 0.02 } },
  },
  combo: [],
  heavy: null,
  ranged: { shots: 2, reload: 3.5, interval: 0.3, pellets: 3, spread: 0.1, damage: 13, speed: 32, range: 15, knockback: 1.6, poise: 6, look: 'pellet', recoil: 2.4, shake: 0.2, sfx: 'gunshot' },
};

const handCannon = {
  id: 'handCannon',
  name: 'Hand Cannons',
  trait: '4-shot rapid pistol burst · 2s reload',
  stats: ['damage', 'fireRate'],
  hands: { main: 'handCannon', off: 'handCannon' },
  skill: { text: 'Throwing a satchel instantly reloads', reload: true },
  rest: { main: { yaw: -0.1, pitch: 0, y: 1.0, z: 0.2 }, off: { yaw: 0.1, pitch: 0, y: 1.0, z: 0.2 } },
  flourish: { hands: 'both', turns: 3, duration: 0.65, every: 4 },
  poses: {
    reload: { main: { yaw: -0.6, pitch: -1.4, y: 1.12, z: 0.05 }, off: { yaw: 0.6, pitch: -1.4, y: 1.12, z: 0.05 } },
  },
  combo: [],
  heavy: null,
  ranged: { shots: 4, reload: 2, interval: 0.13, pellets: 1, spread: 0, damage: 10, speed: 40, range: 14, knockback: 0.7, poise: 3, look: 'bullet', recoil: 1.2, shake: 0.1, sfx: 'pistol' },
};

const sniper = {
  id: 'sniper',
  name: 'Sniper Cannon',
  trait: '1-shot piercing line blast · 4s reload',
  stats: ['damage', 'crit'],
  hands: { main: 'sniperCannon' },
  skill: { text: 'Satchels fly 9m and leave survivors vulnerable', distance: 9, expose: 2 },
  rest: { main: { yaw: -0.05, pitch: 0, y: 1.05, z: 0.1 }, off: { yaw: 0.4, pitch: 0.3, y: 1.0, z: 0.2 } },
  // Too long to twirl end over end: the cannon rolls about its barrel instead
  flourish: { hands: 'main', axis: 'z', turns: 1, duration: 0.7, every: 6 },
  poses: {
    reload: { main: { yaw: -0.4, pitch: -1.1, y: 1.15, z: 0 }, off: { yaw: 0.2, pitch: -0.6, y: 1.1, z: 0.2 } },
  },
  combo: [],
  heavy: null,
  ranged: { shots: 1, reload: 4, interval: 0.4, pellets: 1, spread: 0, damage: 72, speed: 62, range: 26, knockback: 3.2, poise: 30, pierce: true, look: 'slug', recoil: 4, shake: 0.4, sfx: 'snipe' },
};

export default { blunderbuss, handCannon, sniper };