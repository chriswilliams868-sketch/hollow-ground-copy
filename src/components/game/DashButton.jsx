import { Wind } from 'lucide-react';

export default function DashButton({ disabled, onDodge }) {
  return (
    <button
      type="button"
      aria-label="Dash"
      onPointerDown={(event) => {
        event.preventDefault();
        if (!disabled) onDodge();
      }}
      className="pointer-events-auto grid h-16 w-16 touch-none place-items-center rounded-full border border-[#4fd1c5]/40 bg-[#0f2b2b]/70 backdrop-blur-md transition-transform active:scale-90 active:bg-[#1b4a48]/80 short:h-[52px] short:w-[52px]"
    >
      <Wind className="h-6 w-6 text-[#7ef5e0] short:h-5 short:w-5" strokeWidth={2} />
    </button>
  );
}