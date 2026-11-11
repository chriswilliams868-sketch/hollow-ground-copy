import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const SWALLOWED = ['Escape', 'KeyP', 'Tab'];

// Focal 3D inspector over the pause menu: the turntable viewport beside (or above, on phones) a scrolling details panel.
// Esc closes it without resuming the game.
export default function InspectorModal({ title, subtitle, color, viewport, children, onClose }) {
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const onKey = (event) => {
      if (!SWALLOWED.includes(event.code)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.code === 'Escape' && !event.repeat) close.current();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="pad-safe absolute inset-0 z-50 flex items-center justify-center bg-[#05040a]/95 [--pad:0.5rem] sm:[--pad:1.5rem] short:[--pad:0.375rem]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-full max-h-[720px] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border bg-[#0d0b16] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] short:rounded-xl"
        style={{ borderColor: `${color}55` }}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 short:py-1.5">
          <div className="min-w-0">
            <p className="truncate font-display text-[10px] uppercase tracking-[0.3em]" style={{ color }}>{subtitle}</p>
            <h3 className="truncate font-display text-lg font-bold uppercase tracking-[0.1em] text-white short:text-base">{title}</h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 text-white/70 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(220px,46%)_minmax(0,1fr)] gap-3 p-3 md:grid-cols-[minmax(0,1fr)_340px] md:grid-rows-1 md:gap-4 md:p-4 short:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] short:grid-rows-1 short:gap-2 short:p-2">
          {viewport}
          <div data-scroll className="min-h-0 overflow-y-auto overscroll-contain pr-1">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}