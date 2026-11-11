import { useState } from 'react';
import { QUADRANTS, GEMS } from '@/game/worldData';
import { ENEMY_TYPES } from '@/game/bestiary';
import GemRow from '@/components/game/GemRow';
import WorldMap from '@/components/game/WorldMap';

// Continent map plus details for the tapped region.
export default function MapTab({ map }) {
  const [selected, setSelected] = useState(null);
  const q = QUADRANTS.find((entry) => entry.id === selected);
  const status = (gem) => (map.gems.includes(gem) ? 'Gemstone claimed' : map.slain.includes(gem) ? 'Fallen · gem awaits' : 'Guardian awaits');

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] short:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] short:gap-3">
      <WorldMap map={map} selected={selected} onSelect={setSelected} />
      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-display text-[10px] uppercase tracking-[0.24em] text-white/45">Gemstones</p>
          <div className="mt-2 flex items-center justify-between">
            <GemRow gems={map.gems} size="h-5 w-5" />
            <span className="font-mono text-sm text-white">{map.gems.length}/4</span>
          </div>
          {map.zone === 'lair' && <p className="mt-2 text-[11px] text-[#ff8ba7]">You are in the Hollow King's lair beneath the Hollow Gateway.</p>}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-display text-[10px] uppercase tracking-[0.24em] text-white/45">Hollow Gateway</p>
          <p className="mt-1 text-[12px] text-white/70">
            {!map.gateway.found
              ? 'Hidden somewhere deep in one of the four biomes.'
              : map.gateway.open
                ? 'Found · unsealed. The Hollow King waits below.'
                : `Found · sealed until all four gemstones are gathered (${map.gems.length}/4).`}
          </p>
        </div>
        {q ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="font-display text-[10px] uppercase tracking-[0.24em] text-white/45">{q.dir}</p>
            <h4 className="mt-1 font-display text-lg font-bold uppercase tracking-[0.1em] text-white">{q.name}</h4>
            <p className="font-mono text-[11px] text-white/55">Enemies Lv {q.levels[0]}-{q.levels[1]}</p>
            <ul className="mt-2 space-y-0.5 text-[12px] text-white/70">
              {q.enemies.map((id) => (
                <li key={id}>· {ENEMY_TYPES[id].name}</li>
              ))}
            </ul>
            <p className="mt-2 text-[12px]" style={{ color: GEMS[q.gem].color }}>
              {q.guardian.name} · Lv {q.levels[1]}
            </p>
            <p className="text-[11px] text-white/50">{status(q.gem)}</p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 p-3 text-[12px] text-white/45">Tap a region on the map to see its enemies and guardian.</p>
        )}
      </div>
    </div>
  );
}