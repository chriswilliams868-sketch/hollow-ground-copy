import { Snowflake, Flame, Moon, Droplets } from 'lucide-react';
import { ELEMENTS, affixText } from '@/game/elements';

const ICONS = { frost: Snowflake, fire: Flame, void: Moon, poison: Droplets };

// Coloured elemental affix tag: a corner badge on bag tiles, or a full card in the item details.
export default function ElementTag({ affix, compact = false }) {
  if (!affix) return null;
  const element = ELEMENTS[affix.element];
  const Icon = ICONS[affix.element];
  if (compact) {
    return (
      <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full" style={{ background: `${element.color}33`, color: element.color }}>
        <Icon className="h-2.5 w-2.5" strokeWidth={2.6} />
      </span>
    );
  }
  return (
    <div className="mt-3 rounded-lg border px-3 py-2" style={{ borderColor: `${element.color}55`, background: `${element.color}14` }}>
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ background: `${element.color}26`, color: element.color }}
      >
        <Icon className="h-3 w-3" />
        {element.label}
      </span>
      <p className="mt-1.5 font-mono text-[12px]" style={{ color: element.color }}>{affixText(affix)}</p>
      <p className="text-[11px] text-white/55">{element.effect}</p>
    </div>
  );
}