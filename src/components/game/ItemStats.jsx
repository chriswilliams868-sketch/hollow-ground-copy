import { statLabel, formatStat } from '@/game/items';

// A gear item's rolled stat bonuses.
export default function ItemStats({ item, classId }) {
  return (
    <ul className="mt-3 space-y-1">
      {Object.entries(item.stats).map(([stat, value]) => (
        <li key={stat} className="flex justify-between font-mono text-[12px]">
          <span className="text-white/60">{statLabel(stat, classId)}</span>
          <span className="text-[#86efac]">{formatStat(stat, value)}</span>
        </li>
      ))}
    </ul>
  );
}