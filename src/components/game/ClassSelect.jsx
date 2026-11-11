import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CLASSES, CLASS_ORDER } from '@/game/classes';
import { renderPortraits } from '@/game/portraits';
import ClassCard from '@/components/game/ClassCard';

// Full-screen class picker: tap a card to select it, tap it again (or the button) to descend.
export default function ClassSelect({ onPick }) {
  const [selected, setSelected] = useState('vanguard');
  const [portraits] = useState(() => renderPortraits(CLASS_ORDER));
  const cls = CLASSES[selected];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      data-scroll
      className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto overscroll-contain bg-[#06050c]/90 backdrop-blur-md"
    >
      <div
        className="pointer-events-none fixed inset-0 transition-[background] duration-500"
        style={{ background: `radial-gradient(circle at 50% 40%, ${cls.accent}1f, transparent 60%)` }}
      />
      <div className="relative mx-auto flex min-h-full w-full max-w-[1180px] flex-col justify-center pad-safe [--pad:1rem] sm:[--pad:2.5rem] short:[--pad:0.75rem]">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.44em] text-[#ff9a5a]/80">
            Choose your vessel
          </p>
          <h2 className="mt-2 font-display text-[28px] font-bold uppercase leading-none tracking-[0.06em] text-white sm:text-5xl short:text-[26px]">
            Class Selection
          </h2>
        </motion.header>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-4 lg:grid-cols-4 short:mt-4 short:grid-cols-4 short:gap-2.5">
          {CLASS_ORDER.map((id, index) => (
            <ClassCard
              key={id}
              cls={CLASSES[id]}
              portrait={portraits[id]}
              selected={id === selected}
              index={index}
              onSelect={() => (id === selected ? onPick(id) : setSelected(id))}
            />
          ))}
        </div>

        <p className="mx-auto mt-4 max-w-[420px] text-center text-[12px] leading-relaxed text-white/55 sm:hidden">
          {cls.blurb}
        </p>

        <button
          type="button"
          onClick={() => onPick(selected)}
          className="mx-auto mt-5 inline-flex w-full max-w-[420px] items-center justify-center gap-2 rounded-xl py-4 font-display text-[13px] font-bold uppercase tracking-[0.28em] text-[#140904] transition-transform active:scale-[0.98] sm:mt-8 short:mt-3 short:py-3"
          style={{ background: cls.accent, boxShadow: `0 18px 45px -16px ${cls.accent}` }}
        >
          Enter as {cls.name}
          <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
        </button>
      </div>
    </motion.div>
  );
}