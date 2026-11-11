import { Pause, Save } from 'lucide-react';
import RelicBadges from '@/components/game/RelicBadges';
import ClassStatus from '@/components/game/ClassStatus';
import RegionPanel from '@/components/game/RegionPanel';
import CoinCounter from '@/components/game/CoinCounter';
import BuffBadges from '@/components/game/BuffBadges';
import PlayerPanel from '@/components/game/PlayerPanel';
import BossBar from '@/components/game/BossBar';

// Top HUD: hero card, region and pause, status chips, then boss bar and prompts.
// Clears notches on every side; `short:` keeps it slim when a phone is held sideways.
export default function GameHud({ hud, onPause }) {
  const { boss, hint, relics = [], critical, gems = [], region, saved } = hud;
  const { classId, ammo = 0, maxAmmo = 0, reload = 0, reloadMax = 0 } = hud;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center gap-1.5 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-2 sm:pt-4 short:gap-1 short:pt-2">
      <div className="flex w-full max-w-[760px] items-start justify-between gap-1.5 sm:gap-2">
        <PlayerPanel hud={hud} />
        <RegionPanel region={region} gems={gems} />
        <button
          type="button"
          aria-label="Pause"
          onClick={onPause}
          className="pointer-events-auto grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-[#0d0b16]/80 text-white/80 backdrop-blur-md transition-transform active:scale-90 sm:h-10 sm:w-10 sm:rounded-xl short:h-9 short:w-9 short:rounded-lg"
        >
          <Pause className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>

      <div className="flex w-full max-w-[760px] flex-wrap items-center gap-1 sm:gap-1.5 short:gap-1">
        <ClassStatus classId={classId} weapon={hud.weapon} ammo={ammo} maxAmmo={maxAmmo} reload={reload} reloadMax={reloadMax} />
        <CoinCounter value={hud.coins} />
        <BuffBadges buffs={hud.buffs} />
        <RelicBadges relics={relics} />
        {saved && (
          <span className="ml-auto flex items-center gap-1 rounded-full border border-[#5eead4]/30 bg-black/50 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-[#5eead4]">
            <Save className="h-3 w-3" strokeWidth={2.4} />
            Saved
          </span>
        )}
      </div>

      {boss && <BossBar boss={boss} />}

      {critical && (
        <div className="animate-pulse rounded-lg border border-[#ffd84d]/60 bg-[#2a2005]/85 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffd84d] shadow-[0_0_30px_-6px_rgba(255,216,77,0.7)] sm:px-4 sm:py-1.5 sm:text-[12px] short:px-3 short:py-1 short:text-[11px]">
          Critical Opportunity
        </div>
      )}

      {hint && (
        <div className="max-w-full rounded-2xl border border-white/10 bg-black/50 px-3 py-1 text-center font-display text-[10px] uppercase leading-snug tracking-[0.16em] text-white/60 backdrop-blur-md sm:rounded-full sm:tracking-[0.24em]">
          {hint}
        </div>
      )}
    </div>
  );
}