import { Gem, CheckCircle2 } from 'lucide-react';
import { GEMS } from '@/game/worldData';

// Gerald's current request (quest 1 -> 4) with the hand-in button once the gem is carried.
export default function QuestPanel({ quest, onDeliver }) {
  const gem = quest.gem ? GEMS[quest.gem] : null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4" style={gem ? { borderColor: `${gem.color}44` } : undefined}>
      <p className="font-display text-[10px] uppercase tracking-[0.24em] text-white/45">
        {gem ? `Quest ${quest.stage + 1} of 4` : 'Questline complete'}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {gem ? <Gem className="h-4 w-4 shrink-0" style={{ color: gem.color }} /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-[#86efac]" />}
        <h4 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-white">
          {gem ? `Bring Gerald the ${gem.name}` : 'All four gemstones delivered'}
        </h4>
      </div>
      <p className="mt-2 text-[12px] italic leading-relaxed text-white/60">“{quest.line}”</p>
      {gem && (
        <button
          type="button"
          disabled={!quest.ready}
          onClick={onDeliver}
          className="mt-3 w-full rounded-lg py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#140904] disabled:opacity-35"
          style={{ background: gem.color }}
        >
          {quest.ready ? `Deliver ${gem.name}` : 'Gemstone not yet found'}
        </button>
      )}
    </div>
  );
}