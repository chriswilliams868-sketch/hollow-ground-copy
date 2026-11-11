import * as THREE from 'three';

const MAX = 20;
const LIFE = 0.22;

// Fading ribbon swept by the weapon (base-to-tip) during a swing, plus embers shed from the tip on sweeps.
export class WeaponTrail {
  constructor(scene, effects) {
    this.effects = effects;
    this.samples = [];
    this.color = new THREE.Color();
    this.positions = new Float32Array(MAX * 6);
    this.colors = new Float32Array(MAX * 6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    const index = [];
    for (let i = 0; i < MAX - 1; i += 1) {
      const k = i * 2;
      index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
    geometry.setIndex(index);
    geometry.setDrawRange(0, 0);
    this.geometry = geometry;
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    scene.add(this.mesh);
  }

  sample(player, set, motion, color) {
    const { parts } = player;
    const tip = set.main || !parts.offTip ? parts.tip : parts.offTip;
    const base = set.main || !parts.offTip ? parts.tipBase : parts.offTipBase;
    if (!tip) return;
    player.group.updateMatrixWorld(true);
    this.color.set(color);
    this.samples.unshift({ a: base.getWorldPosition(new THREE.Vector3()), b: tip.getWorldPosition(new THREE.Vector3()), age: 0 });
    if (this.samples.length > MAX) this.samples.length = MAX;
    if (motion === 'sweep' && Math.random() < 0.7) this.ember(this.samples[0].b, color);
  }

  ember(position, color) {
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.05, 0),
      new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    mesh.position.copy(position);
    const v = new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.4 + Math.random(), (Math.random() - 0.5) * 1.6);
    this.effects.add(mesh, 0.45, (obj, p, dt) => {
      v.y -= 3 * dt;
      obj.position.addScaledVector(v, dt);
      obj.material.opacity = 1 - p;
      obj.scale.setScalar(1 - p * 0.7);
    });
  }

  update(dt) {
    this.samples.forEach((s) => {
      s.age += dt;
    });
    while (this.samples.length && this.samples[this.samples.length - 1].age > LIFE) this.samples.pop();
    const { r, g, b } = this.color;
    this.samples.forEach((s, i) => {
      const f = Math.max(0, 1 - s.age / LIFE) * (1 - i / MAX);
      const k = i * 6;
      this.positions.set([s.a.x, s.a.y, s.a.z, s.b.x, s.b.y, s.b.z], k);
      this.colors.set([r * f * 0.3, g * f * 0.3, b * f * 0.3, r * f, g * f, b * f], k);
    });
    const n = this.samples.length;
    this.geometry.setDrawRange(0, n > 1 ? (n - 1) * 6 : 0);
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  clear() {
    this.samples = [];
    this.geometry.setDrawRange(0, 0);
  }
}