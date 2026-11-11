import RelicIcon from '@/components/game/RelicIcon';

export default function RelicModal({ choices, onPick }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#06050c]/80 backdrop-blur-[6px]" />
      <div className="relative w-full max-w-[560px] text-center">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.4em] text-[#ffb347]/80">
          A guardian has fallen
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.1em] text-white">Choose a relic</h2>
        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {choices.map((relic) => (
            <button
              key={relic.id}
              type="button"
              onClick={() => onPick(relic.id)}
              className="flex items-center gap-3 rounded-2xl border border-[#ffb347]/25 bg-white/[0.04] p-3.5 text-left transition-transform active:scale-[0.97] sm:flex-col sm:p-5 sm:text-center"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#ffb347]/40 bg-[#ff6b35]/15 text-[#ffb347]">
                <RelicIcon id={relic.id} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                  {relic.name}
                </span>
                <span className="mt-0.5 block text-[12px] text-white/55">{relic.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}