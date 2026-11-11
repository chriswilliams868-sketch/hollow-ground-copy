import { Skull, Trophy, RotateCcw } from 'lucide-react';
import OverlayShell from '@/components/game/OverlayShell';

export default function RunResult({ won, stats, onRestart }) {
  const Icon = won ? Trophy : Skull;
  return (
    <OverlayShell>
      <div
        className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl border ${
          won ? 'border-[#ffb27a]/40 bg-[#ff6b35]/15 text-[#ffb27a]' : 'border-[#e11d48]/40 bg-[#e11d48]/15 text-[#ff8ba7]'
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <h2 className="mt-5 font-display text-3xl font-bold uppercase tracking-[0.14em] text-white sm:text-4xl">
        {won ? 'The King Falls' : 'You Fell'}
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-white/50">
        {won ? 'The Hollow King is dust. The ground falls silent.' : 'Your level, gear and gemstones remain. Rise at Hearthwood Cottage.'}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { k: 'Level', v: stats.level },
          { k: 'Kills', v: stats.kills },
          { k: 'Time', v: stats.time },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-white/10 bg-white/[0.03] py-3">
            <p className="font-display text-[9px] uppercase tracking-[0.2em] text-white/35">{s.k}</p>
            <p className="mt-1 font-mono text-sm text-white/85">{s.v}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] py-4 font-display text-[12px] font-bold uppercase tracking-[0.28em] text-white transition-transform active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={2.4} />
        {won ? 'Return to the surface' : 'Rise again'}
      </button>
    </OverlayShell>
  );
}