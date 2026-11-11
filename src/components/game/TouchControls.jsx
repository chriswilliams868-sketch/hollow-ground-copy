import SkillButton from '@/components/game/SkillButton';
import { SKILL_DEFS } from '@/game/skills/defs';
import AttackButton from '@/components/game/AttackButton';
import LockOnButton from '@/components/game/LockOnButton';
import PotionButton from '@/components/game/PotionButton';
import InteractButton from '@/components/game/InteractButton';
import DashButton from '@/components/game/DashButton';
import Joystick from '@/components/game/Joystick';

// Mobile controls: joystick bottom-left, action cluster bottom-right, clear of notches and the home bar.
export default function TouchControls({
  onMove,
  onAttackPress,
  onAttackRelease,
  onDodge,
  onSkillPress,
  onSkillRelease,
  onLockOn,
  skill,
  charge = 0,
  locked,
  classId,
  reload = 0,
  potions = 0,
  onPotion,
  interact = false,
  onInteract,
  disabled,
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 select-none pb-[max(1rem,env(safe-area-inset-bottom))] short:pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      <div className="flex items-end justify-between pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <Joystick onMove={onMove} disabled={disabled} />

        <div className="relative flex items-end gap-3 short:gap-2">
          {interact && !disabled && (
            <div className="absolute -top-14 right-0 short:-top-11">
              <InteractButton onPress={onInteract} />
            </div>
          )}
          <div className="flex flex-col items-center gap-3 short:gap-2">
            <PotionButton count={potions} onUse={onPotion} disabled={disabled} compact />
            <SkillButton
              skill={SKILL_DEFS[classId] || SKILL_DEFS.vanguard}
              cooldown={skill?.cooldown}
              max={skill?.max}
              active={skill?.active}
              disabled={disabled}
              onPress={onSkillPress}
              onRelease={onSkillRelease}
            />
            <DashButton disabled={disabled} onDodge={onDodge} />
          </div>
          <div className="flex flex-col items-center gap-3 short:gap-2">
            <LockOnButton locked={locked} disabled={disabled} onLockOn={onLockOn} />
            <AttackButton
              classId={classId}
              charge={charge}
              reload={reload}
              disabled={disabled}
              onPress={onAttackPress}
              onRelease={onAttackRelease}
            />
          </div>
        </div>
      </div>
    </div>
  );
}