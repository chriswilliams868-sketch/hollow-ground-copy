import { Coins } from 'lucide-react';
import ItemIcon from '@/components/game/ItemIcon';
import { RARITIES } from '@/game/items';

// Custom weapons Gerald sells to this class: each fights like the built-in weapon named under it.
export default function WeaponOffers({ weapons, coins, onBuy }) {
  return weapons.map((weapon) => {
    const rarity = RARITIES[weapon.rarity];
    return (
      <div key={weapon.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${rarity.color}22`, color: rarity.color }}>
          <ItemIcon archetype={weapon.archetype} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: rarity.color }}>{weapon.name}</h4>
          <p className="text-[11px] text-white/55">{rarity.name} {weapon.kind} · equips on purchase</p>
          {weapon.owned && <p className="text-[10px] text-white/40">Already in your bag</p>}
        </div>
        <button
          type="button"
          disabled={weapon.owned || coins < weapon.price}
          onClick={() => onBuy(weapon.id)}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-[#ffcf4d] px-3 py-2 font-mono text-[12px] font-bold text-[#2a1a02] disabled:opacity-35"
        >
          <Coins className="h-3.5 w-3.5" />
          {weapon.price}
        </button>
      </div>
    );
  });
}