import { Lock, Hammer, Check } from 'lucide-react';
import ItemIcon from '@/components/game/ItemIcon';
import { GEMS } from '@/game/worldData';
import { ELEMENTS } from '@/game/elements';

// Boss-tier recipes: unlocked one by one by Gerald's questline, forged with gold.
export default function CraftTab({ recipes, coins, bagFull, onCraft }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {recipes.map((recipe) => {
        const gem = GEMS[recipe.gem];
        const element = ELEMENTS[recipe.element];
        const affordable = coins >= recipe.cost;
        return (
          <div key={recipe.gem} className="rounded-xl border bg-white/[0.03] p-3" style={{ borderColor: `${gem.color}${recipe.unlocked ? '66' : '22'}` }}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${gem.color}22`, color: gem.color }}>
                {recipe.unlocked ? <ItemIcon archetype={recipe.archetype} className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <h4 className="truncate font-display text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: recipe.unlocked ? gem.color : 'rgba(255,255,255,0.5)' }}>
                  {recipe.name}
                </h4>
                <p className="text-[11px] text-white/50">
                  Boss-Tier · <span style={{ color: element.color }}>{element.label}</span>
                </p>
              </div>
            </div>
            {!recipe.unlocked ? (
              <p className="mt-3 rounded-lg border border-dashed border-white/10 px-2.5 py-2 text-[11px] text-white/45">Deliver the {gem.name} to unlock</p>
            ) : recipe.forged ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.05] py-2.5 font-display text-[11px] uppercase tracking-[0.2em] text-[#86efac]">
                <Check className="h-3.5 w-3.5" /> Forged
              </p>
            ) : (
              <button
                type="button"
                disabled={!affordable || bagFull}
                onClick={() => onCraft(recipe.gem)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#140904] disabled:opacity-35"
                style={{ background: gem.color }}
              >
                <Hammer className="h-3.5 w-3.5" />
                {bagFull ? 'Bag full' : `Forge · ${recipe.cost} gold`}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}