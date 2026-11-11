import * as THREE from 'three';
import { sfx } from '../audio';
import { smokeCloud } from './smokeCloud';
import { above } from '../grounding';

const STEP = 3;
const HOP_TIME = 0.2;

// Assassin: drop a poison cloud where you stand and spring 3 meters back out of it.
// Daggers recharge it faster, the katana adds bleed, throwing knives fire a fan while leaping.
export default {
  press(engine, player, def) {
    const mod = player.kit.skill;
    player.attack = null;
    player.comboIndex = 0;
    const pos = player.group.position;
    engine.hazards.add(
      smokeCloud(engine, pos, { radius: 3.2, duration: 4.5, dps: 5 * engine.stats.damage, bleed: mod.cloudBleed ? 4 * engine.stats.damage : 0 })
    );
    const target = engine.lock.target;
    const back = target
      ? new THREE.Vector3().subVectors(pos, target.group.position).setY(0)
      : new THREE.Vector3(-Math.sin(player.facing), 0, -Math.cos(player.facing));
    if (back.lengthSq() < 0.01) back.set(-Math.sin(player.facing), 0, -Math.cos(player.facing));
    back.normalize();
    if (mod.knifeFan) {
      engine.projectiles.fan(above(pos, 1.1), Math.atan2(-back.x, -back.z), mod.knifeFan, 0.22, {
        speed: 30,
        range: 9,
        damage: 8 * engine.stats.damage,
        hit: { weapon: true, hitStop: 0.03, shake: 0.05, knockback: 0.6, stagger: 0.25, poise: 2 },
        look: 'knife',
      });
    }
    player.hop = { dir: back, time: HOP_TIME, speed: STEP / HOP_TIME };
    player.iframe = Math.max(player.iframe, HOP_TIME + 0.1);
    player.skillCooldown = mod.cooldown || def.cooldown;
    engine.effects.ring(pos, 3.4, '#4ade80', 0.4);
    sfx.smoke();
  },
};