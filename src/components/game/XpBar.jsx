export default function XpBar({ level, xp, xpNext }) {
  const pct = xpNext ? Math.min(100, (xp / xpNext) * 100) : 100;
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 rounded bg-[#ffd166]/15 px-1 font-mono text-[9px] font-bold text-[#ffd166]">LV {level}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/60">
        <div className="h-full rounded-full bg-gradient-to-r from-[#fde68a] to-[#f59e0b] transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="hidden shrink-0 font-mono text-[9px] tabular-nums text-white/45 sm:inline">
        {xpNext ? `${xp}/${xpNext}` : 'MAX'}
      </span>
    </div>
  );
}