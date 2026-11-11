import { sfx } from '../audio';
import { aimDirection } from '../gunplay';
import { satchelBomb } from './satchelBomb';
import { above } from '../grounding';

// Sharpshooter: lob a satchel ahead; it detonates 1.2s after the throw.
// Blunderbusses widen the blast, hand cannons reload on throw, the sniper throws farther and exposes survivors.
export default {
  press(engine, player, def) {
    const mod = player.kit.skill;
    const reach = mod.distance || 5;
    const dir = aimDirection(engine, player, reach + 2);
    player.lastDir.copy(dir);
    player.facing = Math.atan2(dir.x, dir.z);
    player.group.rotation.y = player.facing;
    const pos = player.group.position;
    const to = pos.clone().addScaledVector(dir, reach);
    engine.clampPosition(to);
    engine.hazards.add(
      satchelBomb(engine, above(pos, 1.2), to, {
        flight: 0.45 * Math.sqrt(reach / 5),
        fuse: 1.2,
        radius: 3.6 * (mod.radius || 1),
        damage: 46 * engine.stats.damage,
        poise: 40,
        knockback: 3,
        expose: mod.expose || 0,
      })
    );
    if (mod.reload && player.kit.ranged) {
      player.reload = 0;
      player.ammo = player.kit.ranged.shots;
      sfx.reloadDone();
    }
    player.skillCooldown = def.cooldown;
    sfx.whoosh();
  },
};