import { CLASSES } from '@/game/classes';
import { ELEMENTS } from '@/game/elements';
import { GEMS } from '@/game/worldData';
import { WEAPON_LORE } from '@/game/weaponLore';

const CHIP = 'rounded-full border px-2 py-0.5 font-display text-[9px] font-semibold uppercase tracking-[0.18em]';

// Lore tags: class and archetype tags, plus the element and forging gemstone when the item has them.
export default function WeaponTags({ item }) {
  const tags = [CLASSES[item.classId]?.name, ...(WEAPON_LORE[item.archetype]?.tags || [])].filter(Boolean);
  const special = [];
  if (item.affix) special.push({ label: ELEMENTS[item.affix.element].prefix, color: ELEMENTS[item.affix.element].color });
  if (item.forged) special.push({ label: `Forged · ${GEMS[item.forged].name}`, color: GEMS[item.forged].color });
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className={`${CHIP} border-white/15 bg-white/[0.04] text-white/65`}>{tag}</span>
      ))}
      {special.map(({ label, color }) => (
        <span key={label} className={CHIP} style={{ borderColor: `${color}66`, background: `${color}1a`, color }}>{label}</span>
      ))}
    </div>
  );
}