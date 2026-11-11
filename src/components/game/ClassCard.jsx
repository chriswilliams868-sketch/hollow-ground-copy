import { motion } from 'framer-motion';
import ClassIcon from '@/components/game/ClassIcon';
import ClassStats from '@/components/game/ClassStats';

export default function ClassCard({ cls, portrait, selected, index, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: 0.12 + index * 0.08, duration: 0.45, ease: 'easeOut' }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border text-left transition-colors duration-200 ${
        selected ? 'bg-white/[0.07]' : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.05]'
      }`}
      style={selected ? { borderColor: cls.accent, boxShadow: `0 0 44px -14px ${cls.accent}` } : undefined}
    >
      <div
        className="relative aspect-[5/4] w-full sm:aspect-[4/5] lg:aspect-square short:aspect-[16/10]"
        style={{ background: `radial-gradient(circle at 50% 62%, ${cls.accent}33, transparent 68%)` }}
      >
        {portrait && <img src={portrait} alt={`${cls.name} model`} className="absolute inset-0 h-full w-full object-contain" />}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 py-0.5 font-display text-[8px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-[9px]">
          <span style={{ color: cls.accent }}>
            <ClassIcon id={cls.id} className="h-3 w-3" strokeWidth={2.4} />
          </span>
          {cls.role}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4 short:p-2.5">
        <h3 className="font-display text-base font-bold uppercase tracking-[0.14em] text-white sm:text-xl short:text-sm">{cls.name}</h3>
        <ClassStats bars={cls.bars} accent={cls.accent} />
        <p className="mt-3 hidden text-[12px] leading-relaxed text-white/55 sm:block short:hidden">{cls.blurb}</p>
        <div className="mt-auto hidden flex-wrap gap-1 pt-3 sm:flex short:hidden">
          {cls.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase text-white/60"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}