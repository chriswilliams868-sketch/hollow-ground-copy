import { Zap } from 'lucide-react';
import ClassIcon from '@/components/game/ClassIcon';
import XpBar from '@/components/game/XpBar';
import HudBar from '@/components/game/HudBar';
import { CLASSES } from '@/game/classes';

// Top-left hero card: class crest, name, health, stamina and XP. Compact on phones.
export default function PlayerPanel({ hud }) {
  const { hp, maxHp, stamina, maxStamina, classId, level = 1, xp = 0, xpNext = 0 } = hud;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0d0b16]/75 px-2 py-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md sm:gap-3 sm:rounded-2xl sm:px-3.5 sm:py-2.5 short:max-w-[340px] short:gap-2 short:rounded-xl short:px-2.5 short:py-1.5">
      <div className="relative grid h-8 w-8 shrink-0 place-items-center sm:h-11 sm:w-11 short:h-8 short:w-8">
        <div className="absolute inset-0 rotate-45 rounded-[10px] border border-[#ff8a4c]/50 bg-[#ff6b35]/15" />
        <span className="relative text-[#ff9a5a]">
          <ClassIcon id={classId} className="h-4 w-4 sm:h-5 sm:w-5 short:h-4 short:w-4" strokeWidth={2.2} />
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5 short:space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 sm:text-[11px] sm:tracking-[0.22em] short:text-[10px]">
            <span className="text-white/90">{hud.name}</span>
            <span className="hidden sm:inline"> · {CLASSES[classId]?.name || 'Warden'}</span>
          </span>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/70 sm:text-[11px] short:text-[10px]">
            {Math.ceil(hp)}
            <span className="text-white/30">/{maxHp}</span>
          </span>
        </div>
        <div className="h-2 w-full sm:h-2.5 short:h-2">
          <HudBar value={hp} max={maxHp} tone="hp" />
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-2.5 w-2.5 shrink-0 text-[#3fd0c9]" strokeWidth={3} />
          <div className="h-1 flex-1 rounded-full">
            <HudBar value={stamina} max={maxStamina} tone="stamina" />
          </div>
        </div>
        <XpBar level={level} xp={xp} xpNext={xpNext} />
      </div>
    </div>
  );
}