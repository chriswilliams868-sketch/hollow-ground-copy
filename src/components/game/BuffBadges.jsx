import { Flame, Wind } from 'lucide-react';

const META = {
  might: { icon: Flame, color: '#fb7185', label: 'Elixir' },
  stamina: { icon: Wind, color: '#5eead4', label: 'Tonic' },
};

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Active consumable buffs with their remaining time.
export default function BuffBadges({ buffs = [] }) {
  return (
    <>
      {buffs.map(({ id, left }) => {
        const { icon: Icon, color, label } = META[id];
        return (
          <span
            key={id}
            className="flex items-center gap-1 rounded-full border bg-black/50 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.16em] backdrop-blur-md"
            style={{ borderColor: `${color}55`, color }}
          >
            <Icon className="h-3 w-3" strokeWidth={2.4} />
            {label} {clock(left)}
          </span>
        );
      })}
    </>
  );
}