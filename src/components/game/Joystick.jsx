import { useRef, useState } from 'react';

// Virtual stick. Knob travel scales with the pad, so the compact landscape size feels the same.
export default function Joystick({ onMove, disabled }) {
  const baseRef = useRef(null);
  const activePointer = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const updateFromEvent = (event) => {
    const rect = baseRef.current?.getBoundingClientRect();
    if (!rect) return;
    const radius = rect.width * 0.37;
    let dx = event.clientX - (rect.left + rect.width / 2);
    let dy = event.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }
    setKnob({ x: dx, y: dy });
    const nx = dx / radius;
    const ny = dy / radius;
    onMove({ x: Math.abs(nx) < 0.14 ? 0 : nx, y: Math.abs(ny) < 0.14 ? 0 : -ny });
  };

  const start = (event) => {
    if (disabled) return;
    event.preventDefault();
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateFromEvent(event);
  };

  const move = (event) => {
    if (activePointer.current !== event.pointerId) return;
    event.preventDefault();
    updateFromEvent(event);
  };

  const end = (event) => {
    if (activePointer.current !== event.pointerId) return;
    event.preventDefault();
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      className="pointer-events-auto relative h-[124px] w-[124px] touch-none rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm active:border-white/30 short:h-[100px] short:w-[100px]"
      style={{ boxShadow: 'inset 0 0 40px rgba(255,255,255,0.06)' }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-[3px] w-[3px] rounded-full bg-white/20" />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full border border-white/[0.06]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 grid h-14 w-14 place-items-center rounded-full border border-[#ff8a4c]/40 bg-[#ff6b35]/25 backdrop-blur-md short:h-12 short:w-12"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      >
        <div className="h-6 w-6 rounded-full border border-[#ffb98a]/50 short:h-5 short:w-5" />
      </div>
    </div>
  );
}