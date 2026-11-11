import { motion } from 'framer-motion';

// Centered full-screen card; scrolls (by touch too) when a short landscape screen can't fit it.
export default function OverlayShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="pointer-events-auto absolute inset-0 z-40"
    >
      <div className="absolute inset-0 bg-[#06050c]/80 backdrop-blur-[6px]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,107,53,0.16), transparent 58%)' }}
      />
      <div data-scroll className="relative h-full overflow-y-auto overscroll-contain">
        <div className="pad-safe flex min-h-full items-center justify-center [--pad:1.25rem] short:[--pad:0.75rem]">
          <div className="w-full max-w-[440px] text-center">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}