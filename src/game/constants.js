export const PLAYER = {
  maxHp: 100,
  maxStamina: 100,
  speed: 5.8,
  radius: 0.42,
  staminaRegen: 30,
  regenDelay: 0.55,
  attackCooldown: 0.06,
  dodge: { cost: 25, duration: 0.42, speed: 13, iframe: 0.32 },
  parry: { cooldown: 1.5 },
  comboWindow: 0.8,
};

export const LOCK = { range: 11, breakRange: 14, doubleTap: 0.3, camBias: 0.35, camMax: 4 };

// Level-1 baseline; enemy types and levels scale these (see bestiary.js).
export const ENEMY = {
  maxHp: 46,
  speed: 1.9,
  chaseSpeed: 3.4,
  aggro: 10,
  damage: 8,
  knockback: 5.4,
};

export const BOSS = {
  speed: 2.5,
  radius: 1.3,
  chargeSpeed: 13.5,
  chargeDamage: 22,
  aoeDamage: 18,
  aoeRadius: 5.6,
};

// The Hollow King's arena in the underground lair.
export const ARENA = { radius: 8, trigger: 6.6 };