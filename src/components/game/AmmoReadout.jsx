export default function AmmoReadout({ ammo, maxAmmo, reload, reloadMax }) {
  const reloading = reload > 0;
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#4ade80]/30 bg-black/55 px-2 py-0.5 backdrop-blur-md">
      {Array.from({ length: maxAmmo }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-1.5 rounded-sm ${
            i < ammo && !reloading ? 'bg-[#facc15] shadow-[0_0_6px_#facc15]' : 'bg-white/15'
          }`}
        />
      ))}
      {reloading ? (
        <>
          <span className="animate-pulse font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#4ade80]">
            Reloading...
          </span>
          <span className="font-mono text-[9px] tabular-nums text-white/60">{reload.toFixed(1)}s</span>
          <span className="h-1 w-10 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full bg-[#4ade80]" style={{ width: `${(1 - reload / reloadMax) * 100}%` }} />
          </span>
        </>
      ) : (
        <span className="font-mono text-[9px] tabular-nums text-white/60">
          {ammo}/{maxAmmo}
        </span>
      )}
    </div>
  );
}