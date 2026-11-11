import { applyStatus } from './status';
import { above } from './grounding';

// Weapon hits and skill hits "infused" with the weapon's element both carry the affix.
const carriesAffix = (hit) => hit.weapon || hit.infused;

// Instant elemental bonus from the equipped weapon (poison is dealt over time instead).
export function affixBonus(engine, hit) {
  const affix = carriesAffix(hit) && engine.affix;
  return affix && affix.element !== 'poison' ? affix.power : 0;
}

// Applies the equipped weapon's element to a target. `dealt` sizes the DoTs and lifesteal;
// `sure` (skills) makes the Frost freeze certain instead of a 20% chance.
export function elementProc(engine, target, dealt, sure = false) {
  const affix = engine.affix;
  if (!affix) return;
  const player = engine.player;
  if (affix.element === 'void') {
    const heal = dealt * 0.05;
    player.hp = Math.min(player.maxHp, player.hp + heal);
    player.leech = (player.leech || 0) + heal;
    if (player.leech >= 1) {
      const amount = Math.floor(player.leech);
      player.leech -= amount;
      engine.effects.popup(above(player.group.position, 2), `+${amount}`, '#c084fc');
    }
    return;
  }
  if (target.dead) return;
  if (affix.element === 'frost' && (sure || Math.random() < 0.2)) {
    if (target === engine.boss) applyStatus(target, 'slow', { time: 2, amount: 0.5 });
    else applyStatus(target, 'freeze', { time: 2 });
  }
  if (affix.element === 'fire') applyStatus(target, 'burn', { time: 3, dps: (dealt * affix.power * 0.5) / 3 });
  if (affix.element === 'poison') applyStatus(target, 'poison', { time: 3, dps: (dealt * affix.power) / 3 });
}

// On-hit effects: katana bleed plus the weapon element.
export function weaponProc(engine, target, dealt, hit) {
  if (hit.bleed && !target.dead) applyStatus(target, 'bleed', { time: 3, dps: (dealt * hit.bleed) / 3 });
  if (carriesAffix(hit)) elementProc(engine, target, dealt, hit.sure);
}