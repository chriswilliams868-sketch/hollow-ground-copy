import * as THREE from 'three';
import { sfx } from '../audio';
import { targetsNear } from '../targets';
import { ELEMENTS } from '../elements';
import { groundHeight } from '../terrain';
import { above } from '../grounding';

// Lobbed in an arc, blinks on its fuse, then bursts into a fiery shockwave infused with the weapon's element.
export function satchelBomb(engine, from, to, { flight, fuse, radius, damage, poise, knockback, expose = 0 }) {
  const blastColor = engine.affix ? ELEMENTS[engine.affix.element].color : '#ff6b35';
  const group = new THREE.Group();
  const bagGeo = new THREE.BoxGeometry(0.36, 0.26, 0.28);
  const bagMat = new THREE.MeshStandardMaterial({ color: '#7c4a1e', roughness: 0.8 });
  const lightGeo = new THREE.SphereGeometry(0.07, 8, 6);
  const lightMat = new THREE.MeshBasicMaterial({ color: '#ff3b1c' });
  const light = new THREE.Mesh(lightGeo, lightMat);
  light.position.y = 0.17;
  group.add(new THREE.Mesh(bagGeo, bagMat), light);
  group.position.copy(from);
  engine.scene.add(group);
  engine.effects.warning(to, radius, fuse, '#ff6b35');

  const explode = () => {
    const center = new THREE.Vector3(to.x, 0, to.z);
    engine.effects.blast(center, radius, blastColor);
    engine.effects.ring(center, radius * 1.3, '#ffd166', 0.5);
    engine.effects.spark(above(center, 0.6), '#ffd166');
    engine.effects.smoke(center);
    engine.effects.smoke(center);
    engine.shake = Math.min(1, engine.shake + 0.7);
    sfx.explosion();
    targetsNear(engine, center, radius).forEach((actor) => {
      const dir = new THREE.Vector3().subVectors(actor.group.position, center).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
      engine.damageActor(actor, damage, dir.normalize(), { hitStop: 0.1, shake: 0, knockback, stagger: 1, poise, color: '#fb923c', infused: true, sure: true });
      // Sniper satchel: survivors take double damage for a moment
      if (expose && !actor.dead && actor !== engine.boss) actor.vulnerable = Math.max(actor.vulnerable, expose);
    });
  };

  // Lands on the ground at the target, uphill or down
  const landY = groundHeight(to.x, to.z) + 0.16;
  let age = 0;
  return {
    update(dt) {
      age += dt;
      const t = Math.min(1, age / flight);
      group.position.set(
        from.x + (to.x - from.x) * t,
        from.y + (landY - from.y) * t + Math.sin(t * Math.PI) * 2.2,
        from.z + (to.z - from.z) * t
      );
      group.rotation.x = t < 1 ? group.rotation.x + dt * 9 : 0;
      light.visible = Math.sin(age * (10 + (age / fuse) * 30)) > 0;
      if (age < fuse) return true;
      explode();
      return false;
    },
    dispose() {
      engine.scene.remove(group);
      [bagGeo, bagMat, lightGeo, lightMat].forEach((item) => item.dispose());
    },
  };
}