import { useMemo } from 'react';
import InspectorModal from '@/components/game/InspectorModal';
import InspectorViewport from '@/components/game/InspectorViewport';
import CodexDetails from '@/components/game/CodexDetails';
import { creatureSubject } from '@/game/inspect/subjects';

// A Codex page: the enemy's voxel model on a turntable beside its lore, stats, attacks and drops.
export default function CodexModal({ entry, onClose }) {
  const subject = useMemo(() => creatureSubject(entry.id), [entry.id]);
  return (
    <InspectorModal
      title={entry.name}
      subtitle={`${entry.rank} · ${entry.biome}`}
      color={entry.color}
      onClose={onClose}
      viewport={<InspectorViewport subject={subject} color={entry.color} />}
    >
      <CodexDetails entry={entry} />
    </InspectorModal>
  );
}