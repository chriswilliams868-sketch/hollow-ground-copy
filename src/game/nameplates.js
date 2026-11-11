import * as THREE from 'three';
import { groundHeight } from './terrain';

const W = 320;
const H = 64;
const BAR = 204; // health bar frame width (px)

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const barColor = (pct) => (pct > 0.6 ? '#4ade80' : pct > 0.3 ? '#facc15' : '#ef4444');

// Canvas-sprite overhead frames (name, level, health bar) that follow each enemy in world space.
export class Nameplates {
  constructor(scene) {
    this.scene = scene;
    this.plates = new Map();
  }

  attach(actor, name, level, boss = false) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
    const px = (boss ? 3.8 : 2.6) / 256; // world units per canvas pixel
    sprite.scale.set(W * px, H * px, 1);
    sprite.renderOrder = 20;
    this.scene.add(sprite);
    this.plates.set(actor, { actor, sprite, canvas, texture, boss, label: `${name} - Lvl ${level}`, hp: null, flash: null });
  }

  draw(plate) {
    const { canvas, actor, boss } = plate;
    const ctx = canvas.getContext('2d');
    const pct = Math.max(0, actor.hp / actor.maxHp);
    ctx.clearRect(0, 0, W, H);
    ctx.font = '600 21px "Chakra Petch", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(6,3,12,0.92)';
    // maxWidth condenses a label that still would not fit instead of clipping its ends
    ctx.strokeText(plate.label, W / 2, 17, W - 12);
    ctx.fillStyle = boss ? '#ffd166' : '#f5f0ff';
    ctx.fillText(plate.label, W / 2, 17, W - 12);
    const left = (W - BAR) / 2;
    ctx.fillStyle = 'rgba(6,3,12,0.88)';
    roundRect(ctx, left, 35, BAR, 18, 6);
    ctx.fill();
    if (pct > 0) {
      ctx.fillStyle = actor.flash > 0 ? '#ffffff' : barColor(pct);
      roundRect(ctx, left + 3, 38, Math.max(8, (BAR - 6) * pct), 12, 4);
      ctx.fill();
    }
    plate.texture.needsUpdate = true;
  }

  update() {
    this.plates.forEach((plate) => {
      const { actor, sprite } = plate;
      sprite.visible = !actor.dead && actor.group.visible;
      if (!sprite.visible) return;
      const pos = actor.group.position;
      // Read live so growing bosses (Hollow King phase II) keep their frame above the head
      sprite.position.set(pos.x, Math.max(groundHeight(pos.x, pos.z), pos.y) + actor.stats.plate, pos.z);
      const flash = actor.flash > 0;
      if (plate.hp !== actor.hp || plate.flash !== flash) {
        plate.hp = actor.hp;
        plate.flash = flash;
        this.draw(plate);
      }
    });
  }

  detach(actor) {
    const plate = this.plates.get(actor);
    if (!plate) return;
    this.scene.remove(plate.sprite);
    plate.texture.dispose();
    plate.sprite.material.dispose();
    this.plates.delete(actor);
  }

  clear() {
    [...this.plates.keys()].forEach((actor) => this.detach(actor));
  }
}