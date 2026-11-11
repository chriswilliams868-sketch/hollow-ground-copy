import { Lock, Skull, Gem, Crown } from 'lucide-react';

const ICONS = { mob: Skull, guardian: Gem, king: Crown };

// One Codex page in the list: opens the 3D turntable once encountered, a locked silhouette until then.
export default function CodexEntryButton({ entry, known, onOpen }) {
  const Icon = known ? ICONS[entry.tier] : Lock;
  return (
    <button
      type="button"
      disabled={!known}
      onClick={onOpen}
      className="flex min-w-0 items-center gap-3 rounded-xl border bg-white/[0.03] p-3 text-left transition-colors enabled:hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45 short:p-2"
      style={{ borderColor: known ? `${entry.color}55` : 'rgba(255,255,255,0.08)' }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg short:h-8 short:w-8"
        style={{ background: known ? `${entry.color}22` : 'rgba(255,255,255,0.05)', color: known ? entry.color : 'rgba(255,255,255,0.4)' }}
      >
        <Icon className="h-5 w-5 short:h-4 short:w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display text-[12px] font-bold uppercase tracking-[0.06em] text-white">{known ? entry.name : '???'}</span>
        <span className="block truncate text-[11px] text-white/50">{known ? `${entry.rank} · ${entry.level}` : 'Undiscovered'}</span>
      </span>
    </button>
  );
}