import { Zap, Flame, HeartPulse, Swords, Heart, Wind } from 'lucide-react';

const ICONS = { swift: Zap, firering: Flame, leech: HeartPulse, might: Swords, vigor: Heart, breath: Wind };

export default function RelicIcon({ id, className }) {
  const Icon = ICONS[id] || Zap;
  return <Icon className={className} strokeWidth={2.2} />;
}