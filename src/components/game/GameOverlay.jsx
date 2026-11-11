import { AnimatePresence } from 'framer-motion';
import MainMenu from '@/components/game/MainMenu';
import ClassSelect from '@/components/game/ClassSelect';
import NameHero from '@/components/game/NameHero';
import RunResult from '@/components/game/RunResult';
import PauseMenu from '@/components/game/PauseMenu';

// Scene pipeline: Main Menu -> Class Selection -> Name Your Hero -> World (pause menu on top) -> Result -> back to the cottage.
export default function GameOverlay({ phase, stats, menu, continueInfo, classId, actions }) {
  return (
    <AnimatePresence mode="wait">
      {phase === 'menu' && (
        <MainMenu key="menu" onEnter={actions.enter} onContinue={actions.continue} continueInfo={continueInfo} />
      )}
      {phase === 'select' && <ClassSelect key="select" onPick={actions.pick} />}
      {phase === 'name' && <NameHero key="name" classId={classId} onSubmit={actions.name} onBack={actions.back} />}
      {phase === 'paused' && (
        <PauseMenu
          key="paused"
          data={menu}
          onResume={actions.resume}
          onEquip={actions.equip}
          onDiscard={actions.discard}
          onUsePotion={actions.potion}
          onVolume={actions.volume}
          onSaveQuit={actions.saveQuit}
        />
      )}
      {(phase === 'won' || phase === 'dead') && (
        <RunResult key="result" won={phase === 'won'} stats={stats} onRestart={actions.respawn} />
      )}
    </AnimatePresence>
  );
}