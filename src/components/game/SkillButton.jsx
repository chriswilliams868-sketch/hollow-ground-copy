import { Shield, ShieldHalf, CloudFog, Bomb } from 'lucide-react';
import { ELEMENTS } from '@/game/elements';

const ICONS = { parry: Shield, bulwark: ShieldHalf, smoke: CloudFog, satchel: Bomb };

// Class secondary skill: icon, cooldown sweep + timer, hover tooltip; reports press and release for hold skills.
export default function SkillButton({ skill, weapon, cooldown = 0, max = 1, active, disabled, onPress, onRelease, showKey }) {
  const Icon = ICONS[skill.id] || Shield;
  const pct = cooldown > 0 ? Math.min(1, cooldown / max) : 0;
  const release = (event) => {
    event.preventDefault();
    onRelease();
  };

  return (
    <div className="group pointer-events-auto relative flex flex-col items-center">
      <button
        type="button"
        aria-label={skill.name}
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          if (!disabled) onPress();
        }}
        onPointerUp={release}
        onPointerCancel={release}
        className="relative grid h-16 w-16 touch-none short:h-[52px] short:w-[52px] place-items-center overflow-hidden rounded-full border backdrop-blur-md transition-transform active:scale-90"
        style={{
          borderColor: active ? skill.color : `${skill.color}66`,
          background: active ? `${skill.color}33` : 'rgba(10,10,20,0.7)',
          boxShadow: active ? `0 0 24px -4px ${skill.color}` : undefined,
        }}
      >
        <Icon className={`h-6 w-6 short:h-5 short:w-5 ${cooldown > 0 ? 'opacity-30' : ''}`} style={{ color: skill.color }} strokeWidth={2} />
        {cooldown > 0 && (
          <>
            <span className="absolute inset-0" style={{ background: `conic-gradient(rgba(0,0,0,0.6) ${pct * 360}deg, transparent 0)` }} />
            <span className="absolute inset-0 grid place-items-center font-mono text-[12px] font-semibold text-white">{cooldown.toFixed(1)}</span>
          </>
        )}
        {showKey && <span className="absolute bottom-0.5 rounded bg-black/70 px-1 font-mono text-[9px] text-white/70">F</span>}
      </button>
      {!showKey && <span className="mt-1 max-w-[80px] text-center font-display text-[8px] uppercase leading-tight tracking-[0.12em] text-white/55 short:hidden">{skill.name}</span>}
      <div className="pointer-events-none absolute bottom-full left-0 mb-2 hidden w-56 rounded-lg border border-white/10 bg-black/85 p-2.5 text-left [@media(hover:hover)]:group-hover:block">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: skill.color }}>{skill.name}</p>
        <p className="mt-1 text-[11px] leading-snug text-white/65">{skill.desc}</p>
        {weapon && (
          <p className="mt-1.5 text-[11px] leading-snug text-white/85">
            <span className="text-white/45">{weapon.name}:</span> {weapon.link}
          </p>
        )}
        {weapon?.element && (
          <p className="mt-1 text-[11px] leading-snug" style={{ color: ELEMENTS[weapon.element].color }}>
            Channels {ELEMENTS[weapon.element].label}: {ELEMENTS[weapon.element].effect}
          </p>
        )}
      </div>
    </div>
  );
}