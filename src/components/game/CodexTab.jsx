import { useState } from 'react';
import { CODEX_GROUPS, CODEX_TOTAL } from '@/game/codex';
import CodexEntryButton from '@/components/game/CodexEntryButton';
import CodexModal from '@/components/game/CodexModal';

// Bestiary: every biome's mobs and guardian, then the Hollow King. Encountered ones open in the 3D Codex viewer.
export default function CodexTab({ discovered }) {
  const [open, setOpen] = useState(null);
  const known = new Set(discovered);

  return (
    <div className="space-y-5 short:space-y-3">
      <p className="font-display text-[10px] uppercase tracking-[0.24em] text-white/45">
        Codex · {known.size}/{CODEX_TOTAL} discovered
      </p>
      {CODEX_GROUPS.map((group) => (
        <section key={group.id}>
          <h4 className="mb-2 flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
            <span className="h-2 w-2 rounded-full" style={{ background: group.color }} />
            {group.name}
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 short:grid-cols-4">
            {group.entries.map((entry) => (
              <CodexEntryButton key={entry.id} entry={entry} known={known.has(entry.id)} onOpen={() => setOpen(entry)} />
            ))}
          </div>
        </section>
      ))}
      {open && <CodexModal entry={open} onClose={() => setOpen(null)} />}
    </div>
  );
}