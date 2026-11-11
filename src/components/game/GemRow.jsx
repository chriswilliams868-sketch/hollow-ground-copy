import { Gem } from 'lucide-react';
import { GEMS, GEM_ORDER } from '@/game/worldData';

export default function GemRow({ gems = [], size = 'h-3 w-3' }) {
  return (
    <div className="flex items-center gap-1">
      {GEM_ORDER.map((id) => {
        const owned = gems.includes(id);
        return (
          <span key={id} title={GEMS[id].name} style={{ color: owned ? GEMS[id].color : 'rgba(255,255,255,0.18)' }}>
            <Gem className={size} strokeWidth={2.4} fill={owned ? 'currentColor' : 'none'} />
          </span>
        );
      })}
    </div>
  );
}