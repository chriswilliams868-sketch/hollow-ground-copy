import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

const CHANNELS = [
  ['master', 'Master Volume'],
  ['music', 'Music'],
  ['sfx', 'Sound Effects'],
];

const CONTROLS = [
  ['WASD / Arrows', 'Move'],
  ['J / Left Click', 'Attack / Fire (hold: Vanguard heavy)'],
  ['Shift', 'Dash'],
  ['F / Right Click', 'Class skill (hold to block as Paladin)'],
  ['Space', 'Lock on'],
  ['Q', 'Drink health potion'],
  ['Tab', 'Inventory'],
  ['P / Esc', 'Pause menu'],
];

export default function SettingsTab({ volumes, onVolume }) {
  const [levels, setLevels] = useState(volumes);
  return (
    <div className="grid gap-5 md:grid-cols-2 short:grid-cols-2 short:gap-4">
      <div className="space-y-4">
        <p className="font-display text-[10px] uppercase tracking-[0.24em] text-white/45">Audio</p>
        {CHANNELS.map(([key, label]) => (
          <div key={key}>
            <div className="mb-2 flex justify-between text-[12px] text-white/70">
              <span>{label}</span>
              <span className="font-mono">{Math.round(levels[key] * 100)}%</span>
            </div>
            <Slider
              value={[levels[key] * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => {
                setLevels((prev) => ({ ...prev, [key]: value / 100 }));
                onVolume(key, value / 100);
              }}
            />
          </div>
        ))}
      </div>
      <div>
        <p className="mb-3 font-display text-[10px] uppercase tracking-[0.24em] text-white/45">Controls</p>
        <ul className="space-y-1.5">
          {CONTROLS.map(([key, action]) => (
            <li key={key} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px]">
              <span className="font-mono text-white/80">{key}</span>
              <span className="text-right text-white/50">{action}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-white/40">On mobile, use the on-screen joystick and buttons.</p>
      </div>
    </div>
  );
}