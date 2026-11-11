import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, ShoppingBag, X } from 'lucide-react';
import CoinCounter from '@/components/game/CoinCounter';
import QuestPanel from '@/components/game/QuestPanel';
import CraftTab from '@/components/game/CraftTab';
import BuyTab from '@/components/game/BuyTab';

const TABS = [
  { id: 'craft', label: 'Craft Boss Weapons', icon: Hammer },
  { id: 'buy', label: 'Buy Consumables', icon: ShoppingBag },
];

// Gerald's forge: questline hand-ins plus the craft and consumable shop tabs.
export default function ShopModal({ data, onClose, onBuy, onCraft, onDeliver }) {
  const [tab, setTab] = useState('craft');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="pad-safe pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[#06050c]/80 backdrop-blur-md [--pad:0.5rem] sm:[--pad:1.5rem] short:[--pad:0.375rem]"
    >
      <div className="flex max-h-full w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#ffb347]/20 bg-[#0d0b16]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 short:py-1.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ff7a2a]/15 text-[#ffb347] short:h-8 short:w-8">
              <Hammer className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[#ffb347]/80 short:hidden">Hearthwood Forge</p>
              <h2 className="truncate font-display text-lg font-bold short:text-base uppercase tracking-[0.1em] text-white">Gerald the Blacksmith</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CoinCounter value={data.coins} large />
            <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/70">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div data-scroll className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-5 short:p-3">
          <QuestPanel quest={data.quest} onDeliver={onDeliver} />
          {data.notice && <p className="rounded-lg bg-white/[0.05] px-3 py-2 text-center font-display text-[11px] uppercase tracking-[0.16em] text-[#ffd27a]">{data.notice}</p>}
          <nav className="flex rounded-xl border border-white/10 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors sm:text-[11px] ${
                  tab === id ? 'bg-[#ff7a2a]/20 text-white' : 'text-white/45 hover:text-white/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                {id === 'buy' && data.weapons.length ? 'Buy Weapons & Items' : label}
              </button>
            ))}
          </nav>
          {tab === 'craft' ? (
            <CraftTab recipes={data.recipes} coins={data.coins} bagFull={data.bagFull} onCraft={onCraft} />
          ) : (
            <BuyTab items={data.consumables} weapons={data.weapons} coins={data.coins} onBuy={onBuy} />
          )}
        </div>
      </div>
    </motion.div>
  );
}