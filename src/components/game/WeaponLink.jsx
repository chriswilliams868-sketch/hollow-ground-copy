import { gearDef } from '@/game/arsenal';
import { SKILL_DEFS } from '@/game/skills/defs';

// Weapon archetype trait plus how it changes the class skill.
export default function WeaponLink({ item }) {
  const def = gearDef(item.classId, item.archetype);
  const skill = SKILL_DEFS[item.classId];
  return (
    <div className="mt-3 space-y-1">
      <p className="text-[11px] text-white/60">{def.trait}</p>
      {def.skill && (
        <p className="rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug" style={{ borderColor: `${skill.color}44`, color: skill.color }}>
          <span className="font-display font-bold uppercase tracking-[0.14em]">{skill.name}:</span> {def.skill.text}
        </p>
      )}
    </div>
  );
}