import * as THREE from 'three';
import { STATUS_COLORS } from './elements';

const TICK = 0.5;

// Refreshes the duration and keeps the strongest value of a status (poison, burn, slow, freeze).
export function applyStatus(actor, kind, { time, dps = 0, amount = 0 }) {
  if (actor.dead) return;
  actor.status = actor.status || {};
  const current = actor.status[kind];
  actor.status[kind] = {
    time: Math.max(current?.time || 0, time),
    dps: Math.max(current?.dps || 0, dps),
    amount: Math.max(current?.amount || 0, amount),
    tick: current?.tick ?? TICK,
    fx: current?.fx ?? 0,
  };
}

export function speedFactor(actor) {
  const status = actor.status;
  if (!status) return 1;
  if (status.freeze) return 0;
  return status.slow ? 1 - status.slow.amount : 1;
}

export function clearStatus(actor) {
  actor.status = {};
  if (actor.ice) actor.ice.visible = false;
}

function iceShell(actor) {
  if (!actor.ice) {
    actor.ice = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshStandardMaterial({
        color: '#cffafe', emissive: '#22d3ee', emissiveIntensity: 0.7, transparent: true, opacity: 0.42, roughness: 0.15, flatShading: true, depthWrite: false,
      })
    );
    actor.ice.scale.set(actor.radius * 1.9, actor.stats.plate * 0.5, actor.radius * 1.9);
    actor.ice.position.y = actor.stats.plate * 0.38;
    actor.group.add(actor.ice);
  }
  return actor.ice;
}

// Ticks damage-over-time, expires effects and drives their visuals.
export function updateStatus(engine, actor, dt) {
  const status = actor.status;
  if (!status || actor.dead) return;
  for (const kind of Object.keys(status)) {
    const effect = status[kind];
    effect.time -= dt;
    if (effect.dps > 0) {
      effect.tick -= dt;
      if (effect.tick <= 0) {
        effect.tick += TICK;
        engine.dotDamage(actor, effect.dps * TICK, kind);
        if (actor.dead) return;
      }
      effect.fx -= dt;
      if (effect.fx <= 0) {
        effect.fx = 0.25;
        engine.effects.mote(actor.group.position, STATUS_COLORS[kind], actor.stats.plate * 0.6);
      }
    }
    if (effect.time <= 0) delete status[kind];
  }
  if (actor.ice || status.freeze) iceShell(actor).visible = !!status.freeze;
}