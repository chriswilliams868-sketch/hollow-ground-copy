import { Swords, Wind, Move, Shield, FlaskConical, Crosshair } from 'lucide-react';
import OverlayShell from '@/components/game/OverlayShell';

const KEY_HINTS = [
  { icon: Move, label: 'WASD / Arrows', sub: 'Move' },
  { icon: Swords, label: 'J / Left Click', sub: 'Attack / Fire' },
  { icon: Wind, label: 'Shift', sub: 'Dash' },
  { icon: Shield, label: 'F / Right Click', sub: 'Class skill' },
  { icon: Crosshair, label: 'Space', sub: 'Lock on' },
  { icon: FlaskConical, label: 'Q · P · Tab', sub: 'Potion · Pause · Bag' },
];

export default function MainMenu({ onEnter, onContinue, continueInfo }) {
  return (
    <OverlayShell>
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.44em] text-[#ff9a5a]/80">Isometric Action RPG</p>
      <h1 className="mt-3 font-display text-[42px] font-bold uppercase leading-[0.92] tracking-[0.02em] text-white sm:text-[54px] short:mt-2 short:text-[36px]">
        Hollow
        <span className="block text-[#ff6b35]">Ground</span>
      </h1>
      <p className="mx-auto mt-4 max-w-[340px] short:mt-2 text-[13px] leading-relaxed text-white/55">
        Conquer four biomes, slay their guardians for the gemstones, then find and unseal the Hollow Gateway hidden somewhere on the island. The Hollow King waits below.
      </p>

      <div className="mt-7 grid grid-cols-3 gap-2 short:hidden">
        {KEY_HINTS.map(({ icon: Icon, label, sub }) => (
          <div key={sub} className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 backdrop-blur-sm">
            <Icon className="mx-auto h-4 w-4 text-white/70" strokeWidth={2} />
            <p className="mt-2 font-display text-[9px] uppercase tracking-[0.16em] text-white/40">{sub}</p>
            <p className="mt-0.5 font-mono text-[9px] text-white/60">{label}</p>
          </div>
        ))}
      </div>

      {continueInfo && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-8 w-full rounded-xl border border-[#5eead4]/40 bg-[#0f2b2b]/70 py-3.5 short:mt-4 short:py-2.5 font-display text-[13px] font-bold uppercase tracking-[0.28em] text-[#99f6e4] transition-transform active:scale-[0.98]"
        >
          Continue
          <span className="mt-1 block font-mono text-[10px] font-normal normal-case tracking-normal text-white/50">
            {continueInfo.name ? `${continueInfo.name} · ` : ''}{continueInfo.className} · Level {continueInfo.level} · {continueInfo.gems}/4 gemstones
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={onEnter}
        className={
          (continueInfo ? 'mt-3 ' : 'mt-8 short:mt-4 ') +
          'short:py-3 w-full rounded-xl bg-gradient-to-r from-[#ff8a4c] to-[#ff5a2c] py-4 font-display text-[13px] font-bold uppercase tracking-[0.28em] text-[#2a0c02] shadow-[0_18px_45px_-16px_rgba(255,107,53,0.9)] transition-transform active:scale-[0.98]'
        }
      >
        {continueInfo ? 'New game' : 'Enter the ground'}
      </button>
      <p className="mt-3 font-mono text-[10px] text-white/30">Progress autosaves every 30 seconds</p>
    </OverlayShell>
  );
}