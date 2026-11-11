import { LogOut, Save } from 'lucide-react';

// Pause-menu tab for leaving the run: progress is saved before returning to the title screen.
export default function SaveTab({ stats, onSaveQuit }) {
  return (
    <div className="mx-auto max-w-[420px] space-y-4 py-2 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#5eead4]/30 bg-[#0f2b2b]/60 text-[#5eead4]">
        <Save className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-display text-lg font-bold uppercase tracking-[0.12em] text-white">Save & Return</h3>
        <p className="mt-1 font-mono text-[11px] text-white/60">
          {stats.heroName} · {stats.className} · Level {stats.level} · {stats.gems}/4 gemstones
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-white/50">
          Your level, gear, gold and gemstones are kept. Progress also autosaves every 30 seconds.
        </p>
      </div>
      <button
        type="button"
        onClick={onSaveQuit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] py-3.5 font-display text-[12px] font-bold uppercase tracking-[0.24em] text-white"
      >
        <LogOut className="h-4 w-4" />
        Save & Return to Main Menu
      </button>
    </div>
  );
}