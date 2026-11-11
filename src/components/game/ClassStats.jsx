const STATS = [
  ['vitality', 'Vitality'],
  ['speed', 'Speed'],
  ['power', 'Power'],
  ['reach', 'Reach'],
];

export default function ClassStats({ bars, accent }) {
  return (
    <div className="mt-2 space-y-1">
      {STATS.map(([key, label]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-12 shrink-0 font-display text-[8px] uppercase tracking-[0.16em] text-white/40 sm:w-14 sm:text-[9px]">
            {label}
          </span>
          <div className="flex flex-1 gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: i < bars[key] ? accent : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}