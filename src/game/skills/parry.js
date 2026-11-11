// Vanguard: opens a short parry window; success is resolved in combat (freeze, stagger, riposte crits).
export default {
  press(engine, player) {
    if (player.attack || player.parryWindow > 0) return;
    engine.cancelCharge();
    player.parryWindow = engine.stats.parryWindow;
  },
  update(engine, player, dt, def) {
    if (player.parryWindow > 0) {
      player.parryWindow -= dt;
      if (player.parryWindow <= 0) {
        player.parryWindow = 0;
        player.skillCooldown = def.cooldown;
      }
    }
    const aura = player.parts.aura;
    aura.visible = player.parryWindow > 0;
    if (aura.visible) aura.scale.setScalar(1 + (1 - player.parryWindow / engine.stats.parryWindow) * 0.4);
  },
};