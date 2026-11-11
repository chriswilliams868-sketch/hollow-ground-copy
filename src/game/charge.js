import { startAttack } from './attacks';
import { sfx } from './audio';

// Attack input. Classes with a heavy (Vanguard): a quick tap is a light attack and holding past
// the threshold charges the heavy slam. Every other class attacks or fires on press.
export function press(engine) {
  if (engine.state !== 'playing') return;
  if (!engine.player?.kit.heavy) {
    engine.attack();
    return;
  }
  if (!engine.hold) engine.hold = { time: 0 };
}

export function release(engine) {
  const hold = engine.hold;
  engine.hold = null;
  if (!hold || engine.state !== 'playing' || !engine.player) return;
  if (engine.player.charging) unleash(engine);
  else engine.attack();
}

export function update(engine, dt) {
  const player = engine.player;
  const heavy = player.kit.heavy;
  if (!engine.hold) {
    if (player.charging) cancel(engine);
    return;
  }
  if (player.dead || !heavy) return;
  engine.hold.time += dt;
  if (player.charging) {
    player.chargeTime += dt;
    if (player.chargeTime >= heavy.maxCharge) {
      engine.hold = null;
      unleash(engine);
    }
    return;
  }
  if (engine.hold.time < heavy.holdThreshold || player.attack || player.dodging) return;
  if (player.stamina < heavy.cost) {
    engine.hold = null;
    engine.setHint('Out of stamina', 1);
    return;
  }
  player.charging = true;
  player.chargeTime = 0;
  player.comboIndex = 0;
  player.comboTimer = 0;
  engine.chargeSound = sfx.charge();
}

function unleash(engine) {
  engine.chargeSound?.();
  engine.chargeSound = null;
  engine.player.charging = false;
  engine.player.chargeTime = 0;
  startAttack(engine, engine.player, 'heavy');
}

export function cancel(engine) {
  engine.hold = null;
  engine.chargeSound?.();
  engine.chargeSound = null;
  if (engine.player) {
    engine.player.charging = false;
    engine.player.chargeTime = 0;
  }
}