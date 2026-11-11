import { aimShot, startReload } from './gunplay';
import { blast } from './gunBlast';
import { flipPose } from './airborne';

const DURATION = 0.62;
const HEIGHT = 0.75;
const DRIFT = 3; // m/s back off the target, easing out over the flip
const FIRE_AT = 0.5; // top of the arc, upside down

// Sharpshooter finisher, the magazine's last round: a 360° backflip with the guns held trained ahead while the body
// turns over them. Both fire from the top of the arc in a shower of brass, then the hero lands and reloads.
export function updateTrickShot(engine, player, dt) {
  const flip = player.flip;
  flip.t += dt;
  const p = Math.min(1, flip.t / DURATION);
  player.group.position.addScaledVector(player.lastDir, -DRIFT * (1 - p) * dt);
  engine.clampPosition(player.group.position);
  player.air = flipPose(p, -1, HEIGHT);
  const hands = [player.parts.weapon, player.parts.offhand];
  hands.forEach((pivot) => pivot.rotation.set(-player.air.pitch, 0, 0));
  if (!flip.fired && p >= FIRE_AT) {
    flip.fired = true;
    const dir = aimShot(engine, player);
    player.parts.muzzles.forEach((_, hand) => blast(engine, player, hand, dir, 5));
    player.ammo = 0;
  }
  if (p < 1) return;
  hands.forEach((pivot) => {
    pivot.rotation.x = 0;
  });
  player.flip = null;
  player.air = null;
  engine.effects.ring(player.group.position, 1.6, '#c9a27a', 0.3);
  startReload(player);
}