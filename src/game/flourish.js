const TAU = Math.PI * 2;
const SETTLE = 0.45; // stillness before the hero has settled into the idle stance

// One hand's weapon spins in its grip while the fist stays put: `turns` over `duration` about the grip's X (end over
// end, a twirl round the trigger guard) or Z (a barrel roll); `toss` flips it up off the fist and catches it.
function spinGrip(player, hand, move, delay = 0) {
  if (player.parts.grips[hand]) player.flourish[hand] = { ...move, t: -delay };
}

// Flourishes the kit's hands: 'both' (a beat apart), 'main', or 'alternate' (one hand, swapping each time).
export function flourishHands(player, move) {
  if (move.hands === 'alternate') {
    player.flourishHand = 1 - player.flourishHand;
    spinGrip(player, player.flourishHand, move);
    return;
  }
  (move.hands === 'main' ? [0] : [0, 1]).forEach((hand) => spinGrip(player, hand, move, hand * 0.08));
}

// Settling into the idle stance (after moving or fighting) earns the weapon's flourish, then another every so often.
export function idleFlourish(player, busy, dt) {
  const move = player.kit.flourish;
  if (busy || !move) {
    player.flourishIn = SETTLE;
    return;
  }
  player.flourishIn -= dt;
  if (player.flourishIn > 0) return;
  player.flourishIn = move.every;
  flourishHands(player, move);
}

function settleGrip(player, hand) {
  const grip = player.parts.grips[hand];
  grip.rotation.set(0, 0, 0);
  grip.position.y = 0;
  player.flourish[hand] = null;
}

export function updateFlourish(player, dt) {
  player.flourish.forEach((spin, hand) => {
    if (!spin) return;
    spin.t += dt;
    if (spin.t < 0) return;
    const p = Math.min(1, spin.t / spin.duration);
    // Tossed blades turn evenly in the air; twirls whip round and slow into the catch
    const grip = player.parts.grips[hand];
    grip.rotation[spin.axis || 'x'] = TAU * spin.turns * (spin.toss ? p : 1 - (1 - p) ** 2);
    grip.position.y = (spin.toss || 0) * Math.sin(Math.PI * p);
    if (p >= 1) settleGrip(player, hand);
  });
}

// Snaps every spinning weapon back into its grip: attacks and shots need it pointing true.
export function stopFlourish(player) {
  player.flourish.forEach((spin, hand) => spin && settleGrip(player, hand));
}