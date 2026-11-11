import { FlaskConical } from 'lucide-react';

export default function PotionButton({ count, onUse, disabled, compact = false, showKey = false }) {
  return (
    <button
      type="button"
      aria-label="Drink health potion"
      onPointerDown={(event) => {
        event.preventDefault();
        if (!disabled) onUse();
      }}
      className={`pointer-events-auto relative grid touch-none place-items-center rounded-full border border-[#f87171]/50 bg-[#3a0d10]/75 backdrop-blur-md transition-transform active:scale-90 ${
        compact ? 'h-12 w-12 short:h-10 short:w-10' : 'h-14 w-14'
      } ${count === 0 ? 'opacity-40' : ''}`}
    >
      <FlaskConical className="h-5 w-5 text-[#fca5a5]" strokeWidth={2.2} />
      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ef4444] px-1 font-mono text-[10px] font-bold text-white">
        {count}
      </span>
      {showKey && <span className="absolute -bottom-1 rounded bg-black/70 px-1 font-mono text-[9px] text-white/70">Q</span>}
    </button>
  );
}