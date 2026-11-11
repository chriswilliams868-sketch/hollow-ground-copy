import { useEffect, useMemo, useRef, useState } from 'react';
import GameEngine from '@/game/GameEngine';
import { CLASSES, CLASS_ORDER } from '@/game/classes';
import { renderPortraits } from '@/game/portraits';
import { loadSave } from '@/game/save';
import { setVolume } from '@/game/audio';
import GameHud from '@/components/game/GameHud';
import TouchControls from '@/components/game/TouchControls';
import GameOverlay from '@/components/game/GameOverlay';
import RelicModal from '@/components/game/RelicModal';
import ShopModal from '@/components/game/ShopModal';
import PotionButton from '@/components/game/PotionButton';
import SkillButton from '@/components/game/SkillButton';
import { SKILL_DEFS } from '@/game/skills/defs';

const INITIAL_HUD = { hp: 100, maxHp: 100, stamina: 100, maxStamina: 100, boss: null, hint: '', classId: 'vanguard', gems: [] };

const ATTACK_HINT = {
  vanguard: 'J / click attack (hold: heavy)',
  sharpshooter: 'J / click fire',
};

export default function Game() {
  const hostRef = useRef(null);
  const engineRef = useRef(null);
  const [phase, setPhase] = useState('menu');
  const [hud, setHud] = useState(INITIAL_HUD);
  const [menu, setMenu] = useState(null);
  const [relicChoices, setRelicChoices] = useState([]);
  const [stats, setStats] = useState({ kills: 0, level: 1, time: '0:00' });
  const [save, setSave] = useState(() => loadSave());
  const [shop, setShop] = useState(null);
  const [pendingClass, setPendingClass] = useState('vanguard');

  const isTouch = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const engine = new GameEngine(hostRef.current, {
      onHud: setHud,
      onPhase: setPhase,
      onStats: setStats,
      onRelics: setRelicChoices,
      onMenu: setMenu,
      onShop: setShop,
    });
    engineRef.current = engine;
    const warm = setTimeout(() => renderPortraits(CLASS_ORDER), 700);
    return () => {
      clearTimeout(warm);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase === 'menu') setSave(loadSave());
  }, [phase]);

  const engine = () => engineRef.current;
  const actions = {
    enter: () => engine()?.openSelect(),
    continue: () => engine()?.continueGame(),
    pick: (id) => {
      setPendingClass(id);
      engine()?.pickClass(id);
    },
    name: (name) => engine()?.start(name),
    back: () => engine()?.backToSelect(),
    respawn: () => engine()?.respawn(),
    resume: () => engine()?.resume(),
    equip: (id) => engine()?.equipItem(id),
    discard: (id) => engine()?.discardItem(id),
    potion: () => engine()?.drinkPotion(),
    volume: (kind, value) => setVolume(kind, value),
    saveQuit: () => engine()?.saveAndQuit(),
  };
  const continueInfo = save ? { name: save.name, className: CLASSES[save.classId].name, level: save.level, gems: save.gems?.length || 0 } : null;
  const skillInfo = SKILL_DEFS[hud.classId] || SKILL_DEFS.vanguard;
  const inWorld = phase === 'playing' || phase === 'paused' || phase === 'relic' || phase === 'shop';

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-[#07060d]">
      <div ref={hostRef} className="absolute inset-0 touch-none" />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: 'radial-gradient(120% 90% at 50% 42%, transparent 32%, rgba(4,3,10,0.6) 100%)' }}
      />

      {inWorld && <GameHud hud={hud} onPause={() => engine()?.togglePause()} />}

      {isTouch ? (
        inWorld && (
          <TouchControls
            disabled={phase !== 'playing'}
            onMove={(v) => engine()?.setMoveInput(v)}
            onAttackPress={() => engine()?.attackPress()}
            onAttackRelease={() => engine()?.attackRelease()}
            onLockOn={() => engine()?.lockOn()}
            onDodge={() => engine()?.dodge()}
            onSkillPress={() => engine()?.skillPress()}
            onSkillRelease={() => engine()?.skillRelease()}
            onPotion={actions.potion}
            interact={hud.interact}
            onInteract={() => engine()?.interact()}
            potions={hud.potions}
            skill={hud.skill}
            charge={hud.charge}
            locked={hud.locked}
            classId={hud.classId}
            reload={hud.reloadMax ? hud.reload / hud.reloadMax : 0}
          />
        )
      ) : (
        phase === 'playing' && (
          <>
            <div className="absolute bottom-5 left-5 z-20 flex items-end gap-3">
              <PotionButton count={hud.potions ?? 0} onUse={actions.potion} showKey />
              <SkillButton
                skill={skillInfo}
                weapon={hud.weapon}
                cooldown={hud.skill?.cooldown}
                max={hud.skill?.max}
                active={hud.skill?.active}
                onPress={() => engine()?.skillPress()}
                onRelease={() => engine()?.skillRelease()}
                showKey
              />
            </div>
            <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-4 py-1.5 font-display text-[9px] uppercase tracking-[0.24em] text-white/40 backdrop-blur-sm">
              WASD move · {ATTACK_HINT[hud.classId] || 'J / click attack'} · Shift dash · F {skillInfo.name} · Space lock on · Q potion · E talk · Tab inventory · P pause
            </div>
          </>
        )
      )}

      {phase === 'relic' && <RelicModal choices={relicChoices} onPick={(id) => engine()?.chooseRelic(id)} />}

      {phase === 'shop' && shop && (
        <ShopModal
          data={shop}
          onClose={() => engine()?.closeShop()}
          onBuy={(id) => engine()?.buyItem(id)}
          onCraft={(gem) => engine()?.craftWeapon(gem)}
          onDeliver={() => engine()?.deliverGem()}
        />
      )}

      <GameOverlay phase={phase} stats={stats} menu={menu} continueInfo={continueInfo} classId={pendingClass} actions={actions} />
    </div>
  );
}