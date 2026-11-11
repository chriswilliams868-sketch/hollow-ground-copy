import HudBar from '@/components/game/HudBar';

// Boss health (with the phase-two marker) and poise meter under the top HUD.
export default function BossBar({ boss }) {
  return (
    <div className="w-full max-w-[640px] rounded-xl border border-[#e11d48]/25 bg-[#160810]/80 px-3 py-1.5 shadow-[0_0_40px_-10px_rgba(225,29,72,0.55)] backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-2.5 short:max-w-[480px] short:rounded-xl short:px-3 short:py-1.5">
      <div className="mb-1 flex items-center justify-between gap-3 sm:mb-1.5 short:mb-1">
        <span className="min-w-0 truncate font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff8ba7] sm:text-[11px] sm:tracking-[0.28em] short:text-[10px]">
          {boss.name} · Lvl {boss.level}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff8ba7]/60">
          {boss.phase === 2 ? 'Phase II' : 'Phase I'}
        </span>
      </div>
      <div className="relative h-2 w-full sm:h-3 short:h-2">
        <HudBar value={boss.hp} max={boss.maxHp} tone="boss" />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/25" />
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-black/60">
        <div className="h-full rounded-full bg-[#5ee7ff] transition-[width] duration-200" style={{ width: `${boss.poise}%` }} />
      </div>
    </div>
  );
}