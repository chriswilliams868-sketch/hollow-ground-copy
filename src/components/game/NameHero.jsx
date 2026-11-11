import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OverlayShell from '@/components/game/OverlayShell';
import { CLASSES } from '@/game/classes';

// "Name Your Hero" step between class selection and spawning at the cottage.
export default function NameHero({ classId, onSubmit, onBack }) {
  const cls = CLASSES[classId] || CLASSES.vanguard;
  const [name, setName] = useState('');
  const clean = name.trim().replace(/\s+/g, ' ');

  const submit = (event) => {
    event.preventDefault();
    if (clean) onSubmit(clean);
  };

  return (
    <OverlayShell>
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.44em]" style={{ color: cls.accent }}>
        {cls.name} · {cls.role}
      </p>
      <h2 className="mt-2 font-display text-[30px] font-bold uppercase leading-none tracking-[0.06em] text-white sm:text-4xl">Name your hero</h2>
      <p className="mx-auto mt-3 max-w-[320px] text-[13px] text-white/55">Gerald the Blacksmith will know you by this name.</p>
      <form onSubmit={submit} className="mt-7">
        <input
          autoFocus
          value={name}
          maxLength={18}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter a name"
          className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-center font-display text-lg uppercase tracking-[0.14em] text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!clean}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 font-display text-[13px] font-bold uppercase tracking-[0.28em] text-[#140904] transition-transform active:scale-[0.98] disabled:opacity-40"
          style={{ background: cls.accent }}
        >
          Begin the journey
          <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
        </button>
      </form>
      <button type="button" onClick={onBack} className="mt-3 inline-flex items-center gap-1 font-display text-[11px] uppercase tracking-[0.2em] text-white/45 hover:text-white/70">
        <ChevronLeft className="h-3.5 w-3.5" />
        Choose another class
      </button>
    </OverlayShell>
  );
}