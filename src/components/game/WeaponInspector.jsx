import { useMemo } from 'react';
import InspectorModal from '@/components/game/InspectorModal';
import InspectorViewport from '@/components/game/InspectorViewport';
import WeaponTags from '@/components/game/WeaponTags';
import WeaponLink from '@/components/game/WeaponLink';
import ElementTag from '@/components/game/ElementTag';
import ItemStats from '@/components/game/ItemStats';
import { RARITIES } from '@/game/items';
import { WEAPON_LORE } from '@/game/weaponLore';
import { weaponSubject } from '@/game/inspect/subjects';

// Inventory INSPECT: the voxel weapon hovering on a slow spin beside its stats, elemental affix and lore.
export default function WeaponInspector({ item, classId, onClose }) {
  const subject = useMemo(() => weaponSubject(item), [item]);
  const rarity = RARITIES[item.rarity];
  return (
    <InspectorModal
      title={item.name}
      subtitle={`${rarity.name} ${item.kind} · iLvl ${item.level}`}
      color={rarity.color}
      onClose={onClose}
      viewport={<InspectorViewport subject={subject} color={rarity.color} />}
    >
      <WeaponTags item={item} />
      <p className="mt-3 text-[13px] leading-relaxed text-white/70">{WEAPON_LORE[item.archetype]?.lore}</p>
      <WeaponLink item={item} />
      <ElementTag affix={item.affix} />
      <h5 className="mt-4 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">Stats</h5>
      <ItemStats item={item} classId={classId} />
    </InspectorModal>
  );
}