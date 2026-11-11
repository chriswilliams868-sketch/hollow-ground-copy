import { Sword, Swords, Hammer, Shield, Target, FlaskConical, Axe, Slice, Zap, Crosshair, LocateFixed, MoveUpRight } from 'lucide-react';

const ICONS = {
  longsword: Sword,
  spear: MoveUpRight,
  claymore: Sword,
  warhammer: Hammer,
  battleaxe: Axe,
  greatsword: Sword,
  towerShield: Shield,
  daggers: Swords,
  katana: Slice,
  throwingKnives: Zap,
  blunderbuss: Target,
  handCannon: Crosshair,
  sniper: LocateFixed,
};

export default function ItemIcon({ kind, archetype, className }) {
  const Icon = kind === 'potion' ? FlaskConical : ICONS[archetype] || Sword;
  return <Icon className={className} strokeWidth={2} />;
}