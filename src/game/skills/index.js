import { SKILL_DEFS } from './defs';
import parry from './parry';
import bulwark from './bulwark';
import smoke from './smokeBomb';
import satchel from './satchel';

const IMPL = { parry, bulwark, smoke, satchel };

export const skillDef = (engine) => SKILL_DEFS[engine.cls.id];
const impl = (engine) => IMPL[skillDef(engine).id];

export function pressSkill(engine) {
  const player = engine.player;
  if (engine.state !== 'playing' || !player || player.dead) return;
  const def = skillDef(engine);
  if (!def.hold && (player.skillCooldown > 0 || player.dodging || player.hop)) return;
  impl(engine).press(engine, player, def);
}

export function releaseSkill(engine) {
  if (engine.player) impl(engine).release?.(engine, engine.player);
}

export function updateSkill(engine, dt) {
  const player = engine.player;
  player.skillCooldown = Math.max(0, player.skillCooldown - dt);
  player.riposte = Math.max(0, player.riposte - dt);
  impl(engine).update?.(engine, player, dt, skillDef(engine));
}

export function skillHud(engine) {
  const player = engine.player;
  return {
    cooldown: Math.ceil(player.skillCooldown * 10) / 10,
    max: player.kit.skill.cooldown || skillDef(engine).cooldown,
    active: player.parryWindow > 0 || player.blocking,
  };
}