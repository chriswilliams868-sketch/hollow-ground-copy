import GemRow from '@/components/game/GemRow';

export default function RegionPanel({ region, gems }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-0.5 rounded-xl border border-white/10 bg-[#0d0b16]/75 px-2 py-1.5 text-right shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md sm:gap-1 sm:rounded-2xl sm:px-4 sm:py-2.5 short:gap-0.5 short:rounded-xl short:px-2.5 short:py-1.5">
      <span className="max-w-[110px] truncate font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:max-w-none sm:text-[11px] sm:tracking-[0.2em] short:text-[10px]">
        {region?.name}
      </span>
      <span className="font-mono text-[9px] uppercase text-white/40">{region?.levels}</span>
      <div className="flex items-center gap-1.5">
        <GemRow gems={gems} />
        <span className="font-mono text-[9px] tabular-nums text-white/50">{gems.length}/4</span>
      </div>
    </div>
  );
}