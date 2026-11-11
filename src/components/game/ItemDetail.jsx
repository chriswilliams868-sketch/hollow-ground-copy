import { Trash2, ScanEye } from 'lucide-react';
import ItemIcon from '@/components/game/ItemIcon';
import ElementTag from '@/components/game/ElementTag';
import WeaponLink from '@/components/game/WeaponLink';
import ItemStats from '@/components/game/ItemStats';
import { RARITIES } from '@/game/items';

export default function ItemDetail({ selection, inventory, classId, onEquip, onDiscard, onUsePotion, onInspect }) {
  if (selection === 'potion') {
    return (
      <div className="rounded-xl border border-[#f87171]/30 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ef4444]/15 text-[#fca5a5]">
            <ItemIcon kind="potion" className="h-5 w-5" />
          </span>
          <div>
            <h4 className="font-display text-base font-bold uppercase tracking-[0.1em] text-white">Health Potion</h4>
            <p className="text-[12px] text-white/55">Restores 40% HP · ×{inventory.potions} · hotkey Q</p>
          </div>
        </div>
        <button
          type="button"
          disabled={inventory.potions === 0 || !inventory.canDrink}
          onClick={onUsePotion}
          className="mt-4 w-full rounded-lg bg-[#ef4444] py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.24em] text-white disabled:opacity-35"
        >
          Use
        </button>
      </div>
    );
  }

  const item = inventory.items.find((entry) => entry.id === selection);
  if (!item) return <p className="rounded-xl border border-dashed border-white/10 p-4 text-[12px] text-white/45">Select an item to inspect it.</p>;
  const rarity = RARITIES[item.rarity];
  const equipped = inventory.equipped[item.slot] === item.id;

  return (
    <div className="rounded-xl border bg-white/[0.03] p-4" style={{ borderColor: `${rarity.color}55` }}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${rarity.color}22`, color: rarity.color }}>
          <ItemIcon archetype={item.archetype} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h4 className="truncate font-display text-base font-bold uppercase tracking-[0.08em]" style={{ color: rarity.color }}>
            {item.name}
          </h4>
          <p className="text-[11px] text-white/50">
            {rarity.name} {item.kind} · {item.slot === 'shield' ? 'Off-hand' : 'Weapon'} · iLvl {item.level}
          </p>
        </div>
      </div>
      <WeaponLink item={item} />
      <ElementTag affix={item.affix} />
      <ItemStats item={item} classId={classId} />
      <button
        type="button"
        onClick={() => onInspect(item)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.24em] transition-colors hover:bg-white/[0.06]"
        style={{ borderColor: `${rarity.color}66`, color: rarity.color }}
      >
        <ScanEye className="h-4 w-4" />
        Inspect
      </button>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={equipped}
          onClick={() => onEquip(item.id)}
          className="flex-1 rounded-lg py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.24em] text-[#140904] disabled:opacity-40"
          style={{ background: rarity.color }}
        >
          {equipped ? 'Equipped' : 'Equip'}
        </button>
        <button
          type="button"
          aria-label="Discard"
          onClick={() => onDiscard(item.id)}
          className="grid w-11 place-items-center rounded-lg border border-white/15 text-white/60"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}