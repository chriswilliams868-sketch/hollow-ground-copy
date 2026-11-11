import ClassIcon from '@/components/game/ClassIcon';

const RING = 289; // circumference of r=46 in a 100x100 viewBox

function ProgressRing({ value, color }) {
  return (
    <svg className="pointer-events-none absolute inset-0 -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${value * RING} ${RING}`}
      />
    </svg>
  );
}

// charge: heavy charge level (0-1). reload: fraction of the reload still remaining (0-1).
export default function AttackButton({ classId, charge = 0, reload = 0, disabled, onPress, onRelease }) {
  const release = (event) => {
    event.preventDefault();
    onRelease();
  };

  return (
    <button
      type="button"
      aria-label="Attack"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        if (!disabled) onPress();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      className={`pointer-events-auto relative grid h-[88px] w-[88px] touch-none short:h-[72px] short:w-[72px] place-items-center rounded-full border backdrop-blur-md transition-transform active:scale-90 ${
        charge > 0
          ? 'border-[#ff3b1c] bg-[#5c1509]/85 text-[#ffd59a]'
          : 'border-[#ff9a5a]/50 bg-[#3a1409]/70 text-[#ffc79a]'
      }`}
      style={{ boxShadow: `0 0 ${30 + charge * 34}px -8px rgba(255,${Math.round(107 - charge * 70)},53,0.75)` }}
    >
      <span className={reload > 0 ? 'opacity-30' : ''}>
        <ClassIcon id={classId} className="h-8 w-8 short:h-7 short:w-7" />
      </span>
      {charge > 0 && <ProgressRing value={charge} color="#ff6b35" />}
      {reload > 0 && <ProgressRing value={1 - reload} color="#4ade80" />}
    </button>
  );
}