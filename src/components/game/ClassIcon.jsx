import { Hammer, Swords, Sword, Target, Shield, Zap, Flame } from 'lucide-react';

const CLASS_ICONS = { paladin: Hammer, assassin: Swords, vanguard: Sword, sharpshooter: Target };
const PASSIVE_ICONS = { paladin: Shield, assassin: Zap, vanguard: Flame, sharpshooter: Target };

export default function ClassIcon({ id, passive = false, className, strokeWidth = 2 }) {
  const Icon = (passive ? PASSIVE_ICONS : CLASS_ICONS)[id] || Sword;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}