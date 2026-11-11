import { Crosshair } from 'lucide-react';

export default function LockOnButton({ locked, disabled, onLockOn }) {
  return (
    <button
      type="button"
      aria-label="Lock on"
      onPointerDown={(event) => {
        event.preventDefault();
        if (!disabled) onLockOn();
      }}
      className={`pointer-events-auto flex h-11 w-[88px] touch-none items-center justify-center gap-1.5 rounded-full border font-display text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md transition-transform active:scale-90 short:h-9 short:w-[72px] short:gap-1 short:tracking-[0.08em] ${
        locked
          ? 'border-[#ff2d55] bg-[#3a0a16]/90 text-[#ffd84d] shadow-[0_0_22px_-4px_rgba(255,45,85,0.8)]'
          : 'border-[#ffd84d]/45 bg-[#2a2205]/70 text-[#ffd84d]'
      }`}
    >
      <Crosshair
        className={`h-4 w-4 ${locked ? 'animate-spin' : ''}`}
        style={locked ? { animationDuration: '3s' } : undefined}
        strokeWidth={2.2}
      />
      {locked ? 'Locked' : 'Lock On'}
    </button>
  );
}