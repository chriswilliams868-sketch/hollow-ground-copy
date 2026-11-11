import * as THREE from 'three';
import { buildGerald } from './models/gerald';
import { WORLD, GEM_ORDER } from './worldData';
import { sfx } from './audio';

const RANGE = 3.2;

// Canvas label sprite floating in world space.
function labelSprite(text, color, width) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.font = '700 38px "Chakra Petch", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = Math.min(500, ctx.measureText(text).width + 48);
  ctx.fillStyle = 'rgba(8,6,14,0.8)';
  ctx.beginPath();
  ctx.roundRect(256 - w / 2, 14, w, 68, 20);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 50);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
  sprite.scale.set(width, width * (96 / 512), 1);
  sprite.renderOrder = 25;
  return sprite;
}

// Gerald the Blacksmith by the cottage forge: name tag, quest marker and an interact prompt in range.
export class Gerald {
  constructor(engine) {
    this.engine = engine;
    const { x, z, facing } = WORLD.gerald;
    this.model = buildGerald();
    this.model.group.position.set(x, 0, z);
    this.model.group.rotation.y = facing;
    this.anvil = new THREE.Vector3(x + Math.sin(facing), 0.86, z + Math.cos(facing));
    this.title = labelSprite('GERALD THE BLACKSMITH', '#ffd27a', 3.4);
    this.prompt = labelSprite('INTERACT  [E / TAP]', '#5eead4', 3.1);
    this.marker = labelSprite('! QUEST READY', '#ffcf4d', 2.6);
    this.title.position.set(x, 2.55, z);
    this.prompt.position.set(x, 2.15, z);
    this.marker.position.set(x, 2.95, z);
    engine.scene.add(this.model.group, this.title, this.prompt, this.marker);
    this.near = false;
    this.time = 0;
  }

  update(dt) {
    const { engine } = this;
    this.time += dt;
    const struck = this.model.update(this.time);
    const player = engine.player;
    const pos = this.model.group.position;
    const distance = player ? Math.hypot(player.group.position.x - pos.x, player.group.position.z - pos.z) : Infinity;
    this.near = engine.state === 'playing' && engine.zone === 'world' && !player.dead && distance < RANGE;
    this.prompt.visible = this.near;
    this.prompt.position.y = 2.15 + Math.sin(this.time * 3) * 0.05;
    const next = GEM_ORDER[engine.quest];
    this.marker.visible = !!next && engine.gems.includes(next);
    if (struck) {
      engine.effects.spark(this.anvil, '#ffb347');
      if (distance < 13 && engine.state === 'playing') sfx.anvil();
    }
  }
}