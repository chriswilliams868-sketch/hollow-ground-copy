import * as THREE from 'three';
import { mulberry32 } from '../random';
import { subSeed } from '../seed';
import { WORLD } from '../worldData';
import { disposeGroup } from '../actors';
import { ChunkStreamer } from './chunks';
import { buildProps } from './props';
import { buildShore } from './shore';
import { buildGateway } from './gateway';
import { buildLairs } from './lairs';
import { buildArena } from './arena';
import { buildAmbient } from './ambient';
import { buildCottage } from './cottage';

// Everything on the island for the current world seed. Terrain streams in chunks around the camera view.
export function createWorld(scene) {
  const rand = mulberry32(subSeed(1105));
  const group = new THREE.Group();
  scene.add(group);

  const shore = buildShore(rand);
  const props = buildProps(rand);
  const terrain = new ChunkStreamer(group, (chunks) => props.show(chunks));
  group.add(props.group, shore.group);
  const gate = buildGateway(group);
  const lairs = buildLairs(group);
  const arena = buildArena(group, WORLD.lair);
  const cottage = buildCottage(group);
  const ambient = buildAmbient(rand);
  group.add(ambient.points);

  return {
    group,
    props,
    terrain,
    gate,
    lairs,
    arena,
    colliders: [...gate.colliders, ...cottage.colliders],
    update(time, dt, focus, camera) {
      terrain.update(camera);
      ambient.update(time, dt, focus);
      shore.update(time);
      gate.update(time, dt);
      cottage.update(time);
      Object.values(lairs).forEach((lair) => lair.update(time));
      arena.update(time, dt);
    },
    dispose() {
      terrain.dispose();
      scene.remove(group);
      disposeGroup(group);
    },
  };
}