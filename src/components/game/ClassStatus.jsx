import ItemIcon from '@/components/game/ItemIcon';
import AmmoReadout from '@/components/game/AmmoReadout';
import { CLASSES } from '@/game/classes';
import { ELEMENTS } from '@/game/elements';

// Top-HUD chip for the equipped weapon (tinted by its element), plus ammo/reload for guns.
export default function ClassStatus({ classId, weapon, ammo, maxAmmo, reload, reloadMax }) {
  const cls = CLASSES[classId];
  if (!cls) return null;
  const color = weapon?.element ? ELEMENTS[weapon.element].color : cls.accent;
  return (
    <>
      <div
        className="flex items-center gap-1 rounded-full border bg-black/50 px-2 py-0.5 backdrop-blur-md"
        style={{ borderColor: `${color}55`, color }}
      >
        <ItemIcon archetype={weapon?.id} className="h-3 w-3" />
        <span className="font-display text-[9px] font-semibold uppercase tracking-[0.18em]">
          {weapon?.name || cls.passive}
          {weapon?.element && ` · ${ELEMENTS[weapon.element].label}`}
        </span>
      </div>
      {maxAmmo > 0 && <AmmoReadout ammo={ammo} maxAmmo={maxAmmo} reload={reload} reloadMax={reloadMax} />}
    </>
  );
}