import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, ChartColumn, Backpack, BookOpen, Settings, LogOut, Play } from 'lucide-react';
import MapTab from '@/components/game/MapTab';
import StatsTab from '@/components/game/StatsTab';
import InventoryTab from '@/components/game/InventoryTab';
import SettingsTab from '@/components/game/SettingsTab';
import SaveTab from '@/components/game/SaveTab';
import CodexTab from '@/components/game/CodexTab';
import PauseTabs from '@/components/game/PauseTabs';

const TABS = [
  { id: 'map', label: 'Map', icon: MapIcon },
  { id: 'stats', label: 'Stats', icon: ChartColumn },
  { id: 'inventory', label: 'Inventory', icon: Backpack },
  { id: 'codex', label: 'Codex', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'save', label: 'Save & Quit', icon: LogOut },
];

// Opens on the map (Esc / P) or straight on the inventory (Tab).
export default function PauseMenu({ data, onResume, onEquip, onDiscard, onUsePotion, onVolume, onSaveQuit }) {
  const [tab, setTab] = useState(data?.tab || 'map');
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="pad-safe pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[#06050c]/85 backdrop-blur-md [--pad:0.5rem] sm:[--pad:1.5rem] short:[--pad:0.375rem]"
    >
      <div className="flex h-full max-h-[760px] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b16]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] short:rounded-xl">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 short:py-1.5">
          <div className="min-w-0">
            <p className="font-display text-[10px] uppercase tracking-[0.36em] text-[#ff9a5a]/80 short:hidden">Paused</p>
            <h2 className="truncate font-display text-lg font-bold uppercase tracking-[0.12em] text-white short:text-base">Hollow Ground</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">World seed {data.seed}</p>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff8a4c] to-[#ff5a2c] px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#2a0c02] short:py-1.5"
          >
            <Play className="h-3.5 w-3.5" fill="currentColor" />
            Resume
          </button>
        </header>
        <PauseTabs tabs={TABS} active={tab} onSelect={setTab} />
        <div data-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 short:p-3">
          {tab === 'map' && <MapTab map={data.map} />}
          {tab === 'stats' && <StatsTab stats={data.stats} />}
          {tab === 'inventory' && (
            <InventoryTab inventory={data.inventory} classId={data.classId} onEquip={onEquip} onDiscard={onDiscard} onUsePotion={onUsePotion} />
          )}
          {tab === 'codex' && <CodexTab discovered={data.codex} />}
          {tab === 'settings' && <SettingsTab volumes={data.volumes} onVolume={onVolume} />}
          {tab === 'save' && <SaveTab stats={data.stats} onSaveQuit={onSaveQuit} />}
        </div>
      </div>
    </motion.div>
  );
}