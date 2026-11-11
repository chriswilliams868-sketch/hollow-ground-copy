import { useState } from 'react';
import ItemIcon from '@/components/game/ItemIcon';
import ItemDetail from '@/components/game/ItemDetail';
import ElementTag from '@/components/game/ElementTag';
import WeaponInspector from '@/components/game/WeaponInspector';
import { RARITIES } from '@/game/items';

// 4x4 bag: the first slot stacks potions, the rest hold class-locked gear.
export default function InventoryTab({ inventory, classId, onEquip, onDiscard, onUsePotion }) {
  const [selection, setSelection] = useState('potion');
  const [inspecting, setInspecting] = useState(null);
  const equippedIds = Object.values(inventory.equipped);
  const slots = Array.from({ length: inventory.bagSlots }, (_, i) => inventory.items[i] || null);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px] short:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] short:gap-3">
      <div>
        <p className="mb-2 font-display text-[10px] uppercase tracking-[0.24em] text-white/45">
          Bag · {inventory.items.length}/{inventory.bagSlots} gear
        </p>
        <div className="grid grid-cols-4 gap-2 short:grid-cols-8 short:gap-1.5">
          <button
            type="button"
            onClick={() => setSelection('potion')}
            className={`relative grid aspect-square place-items-center rounded-xl border bg-[#ef4444]/10 text-[#fca5a5] ${selection === 'potion' ? 'border-white' : 'border-[#f87171]/30'}`}
          >
            <ItemIcon kind="potion" className="h-6 w-6" />
            <span className="absolute bottom-1 right-1.5 font-mono text-[11px] font-bold text-white">×{inventory.potions}</span>
          </button>
          {slots.map((item, i) =>
            item ? (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelection(item.id)}
                className={`relative grid aspect-square place-items-center rounded-xl border ${selection === item.id ? 'border-white' : 'border-white/10'}`}
                style={{ background: `${RARITIES[item.rarity].color}1a`, color: RARITIES[item.rarity].color }}
              >
                <ItemIcon archetype={item.archetype} className="h-6 w-6" />
                <ElementTag affix={item.affix} compact />
                {equippedIds.includes(item.id) && (
                  <span className="absolute left-1 top-1 rounded bg-black/70 px-1 font-mono text-[8px] uppercase text-[#86efac]">E</span>
                )}
              </button>
            ) : (
              <div key={`empty-${i}`} className="aspect-square rounded-xl border border-dashed border-white/[0.08]" />
            )
          )}
        </div>
      </div>
      <ItemDetail
        selection={selection}
        inventory={inventory}
        classId={classId}
        onEquip={onEquip}
        onDiscard={(id) => {
          onDiscard(id);
          setSelection('potion');
        }}
        onUsePotion={onUsePotion}
        onInspect={setInspecting}
      />
      {inspecting && <WeaponInspector item={inspecting} classId={classId} onClose={() => setInspecting(null)} />}
    </div>
  );
}