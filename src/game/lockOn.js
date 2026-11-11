import * as THREE from 'three';
import { LOCK } from './constants';
import { buildReticle } from './reticle';
import { sfx } from './audio';
import { groundHeight } from './terrain';
import { slopeQuaternion } from './grounding';

const UP = new THREE.Vector3(0, 1, 0);
const tilt = new THREE.Quaternion();

export class LockOn {
  constructor(engine) {
    this.engine = engine;
    this.target = null;
    this.lastTap = -10;
    this.pop = 0;
    this.spin = 0;
    this.reticle = buildReticle();
    this.reticle.group.visible = false;
    engine.scene.add(this.reticle.group);
  }

  distanceTo(actor) {
    const a = actor.group.position;
    const p = this.engine.player.group.position;
    return Math.hypot(a.x - p.x, a.z - p.z);
  }

  // Living enemies in range, nearest first.
  candidates() {
    const { enemies, boss } = this.engine;
    const list = enemies.filter((enemy) => !enemy.dead);
    if (boss && !boss.dead) list.push(boss);
    return list
      .map((actor) => ({ actor, distance: this.distanceTo(actor) }))
      .filter((entry) => entry.distance <= LOCK.range)
      .sort((a, b) => a.distance - b.distance)
      .map((entry) => entry.actor);
  }

  // Tap: lock nearest, or cycle to the next one. Double-tap: release.
  tap() {
    const now = this.engine.time;
    if (this.target && now - this.lastTap < LOCK.doubleTap) {
      this.lastTap = -10;
      this.release();
      return;
    }
    this.lastTap = now;
    const list = this.candidates();
    if (!list.length) {
      if (!this.target) this.engine.setHint('No target in range', 1);
      return;
    }
    this.set(list[(list.indexOf(this.target) + 1) % list.length]);
  }

  set(actor) {
    this.target = actor;
    this.pop = 1;
    this.reticle.group.visible = true;
    sfx.lock();
  }

  release() {
    if (!this.target) return;
    this.clear();
    sfx.unlock();
  }

  clear() {
    this.target = null;
    this.reticle.group.visible = false;
  }

  update(dt) {
    if (!this.target) return;
    const engine = this.engine;
    if (engine.player.dead) {
      this.release();
      return;
    }
    if (this.target.dead) {
      const next = this.candidates()[0];
      if (!next) {
        this.release();
        return;
      }
      this.set(next);
    }
    if (this.distanceTo(this.target) > LOCK.breakRange) {
      this.release();
      return;
    }

    const isBoss = this.target === engine.boss;
    const pos = this.target.group.position;
    const { group, ring, marker } = this.reticle;
    this.pop = Math.max(0, this.pop - dt * 4);
    group.position.set(pos.x, groundHeight(pos.x, pos.z), pos.z);
    // The ground ring spins while lying on the slope; the marker above stays upright
    this.spin += dt * 1.8;
    ring.quaternion.setFromAxisAngle(UP, this.spin).premultiply(slopeQuaternion(pos.x, pos.z, tilt));
    ring.scale.setScalar((isBoss ? this.target.radius * 1.3 : 0.6 + this.target.radius * 0.8) * (1 + this.pop * 0.6 + Math.sin(engine.time * 6) * 0.04));
    marker.position.y = this.target.stats.plate + 0.75 + Math.sin(engine.time * 4) * 0.12;
    marker.rotation.y += dt * 3;
  }

  // Shift the camera focus part-way toward the target so both stay framed.
  cameraOffset(out) {
    if (!this.target) return out.set(0, 0, 0);
    const t = this.target.group.position;
    const p = this.engine.player.group.position;
    out.set((t.x - p.x) * LOCK.camBias, 0, (t.z - p.z) * LOCK.camBias);
    if (out.length() > LOCK.camMax) out.setLength(LOCK.camMax);
    return out;
  }
}