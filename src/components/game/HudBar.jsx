const TONES = {
  hp: 'from-[#ff9a5a] via-[#ff6b35] to-[#d43a2a]',
  stamina: 'from-[#7ef5e0] via-[#3fd0c9] to-[#1f9bb0]',
  boss: 'from-[#f0578c] via-[#e11d48] to-[#8b1e5c]',
};

// Segmented gradient meter used for health, stamina and the boss bar.
export default function HudBar({ value, max, tone }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="relative h-full w-full overflow-hidden rounded-full bg-black/60">
      <div className={`h-full rounded-full bg-gradient-to-r ${TONES[tone]} transition-[width] duration-200 ease-out`} style={{ width: `${pct}%` }} />
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-40"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0 1px, transparent 1px 11px)' }}
      />
    </div>
  );
}