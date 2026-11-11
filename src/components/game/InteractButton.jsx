import { Hammer } from 'lucide-react';

// Touch button shown while standing next to Gerald.
export default function InteractButton({ onPress }) {
  return (
    <button
      type="button"
      aria-label="Talk to Gerald"
      onPointerDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      className="pointer-events-auto flex h-11 touch-none items-center gap-1.5 rounded-full border border-[#5eead4]/50 bg-[#0f2b2b]/85 px-4 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#99f6e4] shadow-[0_0_22px_-6px_rgba(94,234,212,0.8)] backdrop-blur-md transition-transform active:scale-90 short:h-9 short:px-3"
    >
      <Hammer className="h-4 w-4" strokeWidth={2.2} />
      Talk
    </button>
  );
}