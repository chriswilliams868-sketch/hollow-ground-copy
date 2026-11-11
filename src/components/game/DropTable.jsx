const percent = (chance) => `${Math.round(chance * 1000) / 10}%`;

// Drop chances as labelled bars.
export default function DropTable({ drops, color }) {
  return (
    <ul className="space-y-2">
      {drops.map((drop) => (
        <li key={drop.label}>
          <div className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="min-w-0 truncate text-white/75">
              {drop.label}
              {drop.note && <span className="text-white/40"> · {drop.note}</span>}
            </span>
            <span className="shrink-0 font-mono font-bold" style={{ color: drop.color || color }}>{percent(drop.chance)}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, drop.chance * 100)}%`, background: drop.color || color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}