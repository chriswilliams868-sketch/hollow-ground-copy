import { FlaskConical, Flame, Wind, Coins } from 'lucide-react';
import WeaponOffers from '@/components/game/WeaponOffers';

const META = {
  potion: { icon: FlaskConical, color: '#f87171' },
  might: { icon: Flame, color: '#fb7185' },
  stamina: { icon: Wind, color: '#5eead4' },
};

// Bought with gold: custom weapons for this class, then consumables (potions stack in the bag, elixirs start their
// timer right away).
export default function BuyTab({ items, weapons, coins, onBuy }) {
  return (
    <div className="space-y-2">
      <WeaponOffers weapons={weapons} coins={coins} onBuy={onBuy} />
      {items.map((item) => {
        const { icon: Icon, color } = META[item.id];
        const owned = item.id === 'potion' ? `×${item.owned} in bag` : item.owned > 0 ? `Active · ${Math.ceil(item.owned / 60)} min left` : null;
        return (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${color}22`, color }}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-white">{item.name}</h4>
              <p className="text-[11px] text-white/55">{item.desc}</p>
              {owned && <p className="text-[10px] text-white/40">{owned}</p>}
            </div>
            <button
              type="button"
              disabled={coins < item.price}
              onClick={() => onBuy(item.id)}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-[#ffcf4d] px-3 py-2 font-mono text-[12px] font-bold text-[#2a1a02] disabled:opacity-35"
            >
              <Coins className="h-3.5 w-3.5" />
              {item.price}
            </button>
          </div>
        );
      })}
    </div>
  );
}