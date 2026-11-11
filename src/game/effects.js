import * as THREE from 'three';
import { groundHeight } from './terrain';
import { settle } from './grounding';

function disposeObject(object) {
  object.traverse?.((child) => {
    if (child.isSprite) {
      if (child.material?.map) child.material.map.dispose();
      child.material?.dispose();
      return;
    }
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
  }

  add(object, life, update) {
    this.scene.add(object);
    this.items.push({ object, life, max: life, update });
  }

  popup(position, text, color = '#ffd166') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 84px "Chakra Petch", system-ui, sans-serif';
    const fit = Math.min(84, Math.floor((84 * 236) / Math.max(1, ctx.measureText(String(text)).width)));
    ctx.font = `bold ${fit}px "Chakra Petch", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(6,3,12,0.85)';
    ctx.strokeText(String(text), 128, 68);
    ctx.fillStyle = color;
    ctx.fillText(String(text), 128, 68);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
    );
    sprite.scale.set(1.7, 0.85, 1);
    sprite.position.copy(position);
    sprite.renderOrder = 30;
    const startY = position.y;

    this.add(sprite, 0.85, (obj, p) => {
      obj.position.y = startY + Math.pow(p, 0.6) * 1.7;
      obj.material.opacity = p < 0.65 ? 1 : 1 - (p - 0.65) / 0.35;
      const pop = 1 + (1 - Math.min(1, p * 6)) * 0.5;
      obj.scale.set(1.7 * pop, 0.85 * pop, 1);
    });
  }

  spark(position, color = '#ffb27a') {
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    flash.position.copy(position);
    this.add(flash, 0.22, (obj, p) => {
      const s = 1 + p * 4;
      obj.scale.set(s, s, s);
      obj.material.opacity = 1 - p;
    });

    const shards = new THREE.Group();
    shards.position.copy(position);
    const shardMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const geometry = new THREE.TetrahedronGeometry(0.09);
    const velocities = [];
    for (let i = 0; i < 6; i += 1) {
      const mesh = new THREE.Mesh(geometry, shardMat);
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.4 + Math.random() * 3;
      velocities.push(new THREE.Vector3(Math.cos(angle) * speed, 1.5 + Math.random() * 2.4, Math.sin(angle) * speed));
      shards.add(mesh);
    }
    this.add(shards, 0.4, (obj, p, dt) => {
      obj.children.forEach((child, i) => {
        const v = velocities[i];
        v.y -= 14 * dt;
        child.position.addScaledVector(v, dt);
        child.rotation.x += dt * 9;
        child.rotation.y += dt * 7;
      });
      obj.children.forEach((child) => child.scale.setScalar(1 - p));
    });
  }

  ring(position, maxRadius = 3, color = '#ff6b35', duration = 0.45) {
    const geometry = new THREE.RingGeometry(0.78, 1, 44);
    geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    settle(mesh, position.x, position.z, 0.12);
    this.add(mesh, duration, (obj, p) => {
      const s = 0.25 + p * maxRadius;
      obj.scale.set(s, 1, s);
      obj.material.opacity = 0.9 * (1 - p);
    });
  }

  slash(position, facing, arc, color = '#ffb27a', radius = 2.15) {
    const geometry = new THREE.RingGeometry(
      0.75,
      radius,
      26,
      1,
      facing - Math.PI / 2 - arc / 2,
      arc
    );
    geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(position.x, groundHeight(position.x, position.z) + 1, position.z);
    this.add(mesh, 0.24, (obj, p) => {
      obj.scale.setScalar(1 + p * 0.18);
      obj.material.opacity = 0.85 * (1 - p);
    });
  }

  warning(position, radius, duration, color = '#ff2d55') {
    const geometry = new THREE.CircleGeometry(1, 40);
    geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        // Telegraphs stay readable across stepped voxel terraces
        depthTest: false,
        side: THREE.DoubleSide,
      })
    );
    settle(mesh, position.x, position.z, 0.09);
    const ringGeometry = new THREE.RingGeometry(0.92, 1, 48);
    ringGeometry.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      })
    );
    mesh.add(ringMesh);

    this.add(mesh, duration, (obj, p) => {
      const s = radius * (0.35 + p * 0.65);
      obj.scale.set(s, 1, s);
      obj.material.opacity = 0.14 + Math.abs(Math.sin(p * Math.PI * 4)) * 0.14;
      ringMesh.scale.setScalar(1);
      obj.children[0].material.opacity = 0.45 + Math.abs(Math.sin(p * Math.PI * 4)) * 0.4;
    });
  }

  blast(position, radius, color = '#ff2d55') {
    this.ring(position, radius, color, 0.55);
    this.ring(position, radius * 0.6, '#ffe3ea', 0.35);
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(1, 40),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    settle(mesh, position.x, position.z, 0.14);
    this.add(mesh, 0.5, (obj, p) => {
      obj.scale.setScalar(radius * (0.5 + p * 0.55));
      obj.material.opacity = 0.55 * (1 - p);
    });
  }

  chargeDust(position, color = '#ff8ba7') {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.6, 14),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    settle(mesh, position.x, position.z, 0.15);
    this.add(mesh, 0.3, (obj, p) => {
      obj.scale.setScalar(1 + p * 1.6);
      obj.material.opacity = 0.6 * (1 - p);
    });
  }

  // Small rising status mote (poison, burn) above an afflicted actor.
  mote(position, color, height = 1) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 6, 5),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const y = groundHeight(position.x, position.z) + height * (0.6 + Math.random() * 0.5);
    mesh.position.set(position.x + (Math.random() - 0.5) * 0.6, y, position.z + (Math.random() - 0.5) * 0.6);
    this.add(mesh, 0.6, (obj, p) => {
      obj.position.y = y + p * 0.7;
      obj.material.opacity = 0.9 * (1 - p);
    });
  }

  smoke(position) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 6, 5),
      new THREE.MeshBasicMaterial({ color: '#8d86a8', transparent: true, opacity: 0.45, depthWrite: false })
    );
    const x = position.x + (Math.random() - 0.5) * 0.4;
    const z = position.z + (Math.random() - 0.5) * 0.4;
    const y = groundHeight(x, z) + 0.25;
    mesh.position.set(x, y, z);
    this.add(mesh, 0.5, (obj, p) => {
      obj.scale.setScalar(1 + p * 2.2);
      obj.position.y = y + p * 0.6;
      obj.material.opacity = 0.45 * (1 - p);
    });
  }

  parryBurst(position) {
    this.spark(position, '#5ee7ff');
    this.spark(position, '#e0fbff');
    this.ring(position, 3.2, '#5ee7ff', 0.4);
    this.popup(position.clone().setY(position.y + 1.3), 'PARRY', '#5ee7ff');
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      item.life -= dt;
      const progress = 1 - Math.max(0, item.life) / item.max;
      item.update?.(item.object, Math.min(1, progress), dt);
      if (item.life <= 0) {
        this.scene.remove(item.object);
        disposeObject(item.object);
        this.items.splice(i, 1);
      }
    }
  }

  clear() {
    this.items.forEach((item) => {
      this.scene.remove(item.object);
      disposeObject(item.object);
    });
    this.items = [];
  }
}