import * as THREE from 'three';
import { glowing, gem, node, rot } from '../kit';
import { V, vox, voxMat } from '../voxel';
import { approach } from '../../math';
import { voxCloth, flutter } from '../cloth';
import { THIGH, SHIN, TASSET, TORSO, EMBLEM, pauldron, HELM, VISOR, CROWN, ARMS } from './kingArmor';
import { Flames } from '../flames';
import { bossRoot } from './rig';
import { buildKingSword } from './kingSword';

const STANDARD = 1.8; // height of a standard enemy
const HEIGHT = 3.0; // model height at scale 1
const SCALES = [(2.5 * STANDARD) / HEIGHT, (3 * STANDARD) / HEIGHT]; // phase I 2.5x, phase II 3x
const FOOTPRINT = 1.0;
const EMBER = new THREE.Color('#9a1c10');

// AI arm angle -> sword rig angle: leveled lance for the charge, overhead raise, slammed into the ground.
function swing(a) {
  if (a >= 0) return a * 0.6;
  if (a >= -1.1) return a * 0.476;
  return -0.5236 + (a + 1.1) * 2.627;
}

// The Hollow King in voxel plate: stepped dark-iron armour, a spiked gold crown with swept horns, a tattered shadow
// cape of voxel strips and a two-handed Void Greatsword.
export function buildKing() {
  const { group } = bossRoot(1.3);
  const iron = voxMat({ roughness: 0.4, metalness: 0.6, emissive: '#5a1020', emissiveIntensity: 0.3 });
  const capeMat = voxMat({ roughness: 0.95, emissive: '#2a0a2e', emissiveIntensity: 0.4 });
  const eye = glowing('#ff1f2d', 3);
  const coreMat = gem('#a855f7', 2.2);

  // Jointed legs: hip pivot under the tassets, knee pivot carrying the greave and sabaton.
  const legs = [-1, 1].map((s) => {
    const knee = node(0, -0.52, 0, vox(SHIN, iron));
    const hip = node(s * 0.22, 1.17, 0, vox(THIGH, iron), knee);
    group.add(hip);
    return { hip, knee };
  });
  for (let i = 0; i < 6; i += 1) group.add(rot(node(0, 1.08, 0, rot(vox(TASSET, iron, 0, 0, 0.36), -0.15)), 0, (i / 6) * Math.PI * 2, 0));

  const body = node(0, 1.2, 0, vox(TORSO, iron), vox(EMBLEM, eye));
  const anchors = [];
  [-1, 1].forEach((s) => {
    const plate = rot(node(s * 0.55, 0.82, 0, vox(pauldron(s), iron)), 0, 0, -s * 0.3);
    anchors.push(plate);
    body.add(plate);
  });

  const head = node(0, 1.08, 0.02, vox(HELM, iron), vox(VISOR, eye));
  const core = node(0, 0.06, 0.25, vox([[1.8, 1.8, 1.8, 0, 0, 0, '#a855f7']], coreMat));
  const crown = node(0, 0.2, 0, vox(CROWN, iron), core);
  head.add(crown);
  body.add(head);
  anchors.push(crown);

  // Both arms and the sword move as one rig from the shoulder line.
  const grip = new THREE.Vector3(0, -0.6, 0.62);
  const rig = node(0, 0.75, 0, vox(ARMS, iron));
  const sword = buildKingSword();
  sword.group.position.copy(grip);
  sword.group.rotation.x = 0.5236;
  rig.add(sword.group);
  body.add(rig);
  anchors.push(sword.mid);

  const strips = [-0.45, -0.27, -0.09, 0.09, 0.27, 0.45].map((x, i) => {
    const rows = Math.round((1.5 + ((i * 7) % 4) * 0.15) / (1.6 * V));
    const strip = voxCloth(2, rows, 1.6, capeMat, (c, r) => (r >= rows - 2 && (c + r + i) % 2 ? null : (c + r) % 2 ? '#0b0710' : '#170d1f'));
    strip.position.set(x, 0.85, -0.42 - Math.abs(x) * 0.1);
    strip.rotation.set(0.15, x * 0.4, 0);
    body.add(strip);
    return strip;
  });
  group.add(body);
  group.scale.setScalar(SCALES[0]);

  const arms = [new THREE.Object3D(), new THREE.Object3D()]; // AI-driven proxies mapped onto the sword rig
  const last = { tip: new THREE.Vector3(), mid: new THREE.Vector3(), ready: false };
  const tmp = new THREE.Vector3();
  let t = 0;
  let scale = SCALES[0];
  let emit = 0;
  let flames = null;

  const trail = (marker, prev, size) => {
    const now = marker.getWorldPosition(tmp);
    const distance = now.distanceTo(prev);
    if (distance > 0.15) {
      const steps = Math.min(12, Math.ceil(distance / 0.25));
      for (let i = 1; i <= steps; i += 1) flames.emit(prev.clone().lerp(now, i / steps), { size, life: 0.45, rise: 0.4, spread: 0.3 });
    }
    prev.copy(now);
  };

  const animate = (engine, boss, dt) => {
    t += dt;
    rig.rotation.x = approach(rig.rotation.x, swing(arms[0].rotation.x), 18, dt);
    strips.forEach((strip, i) => flutter(strip, t + i * 0.9, 0.16, 3.5));
    scale = approach(scale, SCALES[boss.phase === 2 ? 1 : 0], 3, dt);
    group.scale.setScalar(scale);
    boss.radius = FOOTPRINT * scale;
    boss.stats.plate = (HEIGHT + 0.4) * scale;

    const burning = boss.phase === 2 && !boss.dead;
    eye.emissiveIntensity = boss.dead ? Math.max(0, eye.emissiveIntensity - dt * 2) : (burning ? 4 : 3) + Math.sin(t * 4) * 0.6;
    sword.fuller.emissiveIntensity = burning ? 2.8 + Math.sin(t * 9) * 0.6 : 1.8;
    if (burning) {
      if (!flames) flames = new Flames(engine.scene);
      iron.emissive.copy(EMBER);
      emit += dt * 45;
      while (emit >= 1) {
        emit -= 1;
        const at = anchors[Math.floor(Math.random() * anchors.length)].getWorldPosition(tmp);
        at.x += (Math.random() - 0.5) * scale * 0.5;
        at.z += (Math.random() - 0.5) * scale * 0.5;
        flames.emit(at, { size: 0.3 * scale, life: 0.8, rise: 1.6 * scale, spread: 0.6 });
      }
      if (last.ready) {
        trail(sword.tip, last.tip, 0.3 * scale);
        trail(sword.mid, last.mid, 0.24 * scale);
      } else {
        sword.tip.getWorldPosition(last.tip);
        sword.mid.getWorldPosition(last.mid);
        last.ready = true;
      }
    }
    flames?.update(dt);
  };

  // Heavy, lumbering gait: long slow strides, the torso sinking onto each planted foot,
  // rolling over it and twisting the shoulders against the hips. Settles back to a stand when still.
  let stride = 0;
  let gait = 0;
  const walk = (dt, moved) => {
    gait = approach(gait, moved > 0.0005 ? 1 : 0, 4, dt);
    stride += (moved / (1.4 * scale)) * Math.PI;
    const s = Math.sin(stride);
    const c = Math.cos(stride);
    legs.forEach(({ hip, knee }, i) => {
      const side = i ? -1 : 1;
      hip.rotation.x = -s * side * 0.5 * gait;
      knee.rotation.x = Math.max(0, c * side) * 0.75 * gait;
    });
    body.position.y = 1.2 - Math.abs(s) * 0.08 * gait;
    body.rotation.z = s * 0.07 * gait;
    body.rotation.y = -s * 0.1 * gait;
  };

  return {
    group,
    height: HEIGHT * SCALES[0],
    radius: FOOTPRINT * SCALES[0],
    parts: { body, head, core, arms, bodyMat: iron, coreMat, animate, walk, dispose: () => flames?.dispose() },
  };
}