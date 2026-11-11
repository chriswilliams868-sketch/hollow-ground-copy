import * as THREE from 'three';
import { livingTargets } from './targets';
import { groundHeight } from './terrain';

const tailGeometry = new THREE.BoxGeometry(0.09, 0.09, 1).translate(0, 0, -0.5);
const glow = (color, opacity) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });

// Shot looks: blunderbuss pellets, pistol bullets, piercing sniper slugs and thrown knives.
const LOOKS = {
  pellet: { geometry: new THREE.SphereGeometry(0.1, 8, 6), head: '#fff1c2', tail: '#ff9a3c', size: 1, tailMax: 2.4 },
  bullet: { geometry: new THREE.SphereGeometry(0.1, 8, 6), head: '#fff7d6', tail: '#facc15', size: 0.7, tailMax: 1.4 },
  slug: { geometry: new THREE.SphereGeometry(0.1, 8, 6), head: '#e0f2fe', tail: '#38bdf8', size: 1.7, tailMax: 5 },
  knife: { geometry: new THREE.BoxGeometry(0.06, 0.03, 0.42), head: '#f5d0fe', tail: '#a855f7', size: 1, tailMax: 1.1 },
};
Object.values(LOOKS).forEach((look) => {
  look.headMat = glow(look.head, 1);
  look.tailMat = glow(look.tail, 0.75);
});

// Fast shots with a glowing tail; the first enemy touched takes the hit, piercing shots hit everyone in line.
export class Projectiles {
  constructor(engine) {
    this.engine = engine;
    this.items = [];
  }

  spawn(origin, dir, { speed, range, damage, hit, look = 'pellet', pierce = false }) {
    const style = LOOKS[look];
    const group = new THREE.Group();
    const head = new THREE.Mesh(style.geometry, style.headMat);
    head.scale.setScalar(style.size);
    const tail = new THREE.Mesh(tailGeometry, style.tailMat);
    tail.scale.set(style.size, style.size, 0.01);
    group.add(head, tail);
    group.position.copy(origin);
    group.rotation.y = Math.atan2(dir.x, dir.z);
    this.engine.scene.add(group);
    const lift = origin.y - groundHeight(origin.x, origin.z);
    this.items.push({ group, tail, dir, speed, range, damage, hit, style, lift, traveled: 0, struck: pierce ? new Set() : null });
  }

  // A spread of shots centred on a facing angle (knife fans).
  fan(origin, facing, count, spread, options) {
    for (let i = 0; i < count; i += 1) {
      const angle = facing + (i - (count - 1) / 2) * spread;
      this.spawn(origin, new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)), options);
    }
  }

  victims(pos) {
    return livingTargets(this.engine).filter(
      (actor) => Math.hypot(actor.group.position.x - pos.x, actor.group.position.z - pos.z) < actor.radius + 0.3
    );
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const shot = this.items[i];
      const step = shot.speed * dt;
      const pos = shot.group.position;
      pos.addScaledVector(shot.dir, step);
      // Shots skim the hills at their firing height; out over the sea they simply fly on
      const floor = groundHeight(pos.x, pos.z);
      if (floor > -0.7) pos.y = floor + shot.lift;
      shot.traveled += step;
      shot.tail.scale.z = Math.min(shot.traveled, shot.style.tailMax);
      const hits = this.victims(shot.group.position);
      let spent = shot.traveled >= shot.range;
      if (shot.struck) {
        hits.forEach((target) => {
          if (shot.struck.has(target)) return;
          shot.struck.add(target);
          this.impact(shot, target);
        });
      } else if (hits.length) {
        this.impact(shot, hits[0]);
        spent = true;
      }
      if (spent) this.remove(i);
    }
  }

  impact(shot, target) {
    const engine = this.engine;
    const pos = shot.group.position;
    engine.damageActor(target, shot.damage, shot.dir.clone(), shot.hit);
    engine.effects.spark(pos.clone(), shot.style.tail);
    engine.effects.ring(pos, 1.1, shot.style.tail, 0.25);
  }

  remove(index) {
    this.engine.scene.remove(this.items[index].group);
    this.items.splice(index, 1);
  }

  clear() {
    this.items.forEach((shot) => this.engine.scene.remove(shot.group));
    this.items = [];
  }
}