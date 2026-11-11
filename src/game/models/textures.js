import * as THREE from 'three';

const cache = {};

// Small procedural canvas textures, generated once and shared by every model.
function make(key, size, draw) {
  if (cache[key]) return cache[key];
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext('2d'), size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  cache[key] = texture;
  return texture;
}

// Soft radial dot: contact shadows and flame sprites.
export const softDot = () =>
  make('dot', 64, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });

// Vertical bark grooves with knots (twisted along with the trunk geometry).
export const barkTexture = () =>
  make('bark', 128, (ctx, s) => {
    ctx.fillStyle = '#d6d6d6';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 34; i += 1) {
      ctx.fillStyle = `rgba(30,20,12,${0.3 + Math.random() * 0.45})`;
      ctx.fillRect(Math.random() * s, 0, 1 + Math.random() * 4, s);
    }
    for (let i = 0; i < 14; i += 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(Math.random() * s, 0, 1, s);
      ctx.fillStyle = 'rgba(20,12,6,0.5)';
      ctx.fillRect(Math.random() * s, Math.random() * s, 6 + Math.random() * 8, 2);
    }
  });

// Overlapping diagonal bandage wraps.
export const wrapTexture = () =>
  make('wrap', 128, (ctx, s) => {
    ctx.fillStyle = '#ece4d0';
    ctx.fillRect(0, 0, s, s);
    ctx.lineWidth = 2;
    for (let y = -s; y < s * 2; y += 14) {
      ctx.fillStyle = `rgba(120,90,50,${Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(s, y + 26);
      ctx.lineTo(s, y + 38);
      ctx.lineTo(0, y + 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(70,50,25,0.55)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(s, y + 26);
      ctx.stroke();
    }
  });

// Sandstone strata with speckles.
export const stoneTexture = () =>
  make('stone', 128, (ctx, s) => {
    for (let y = 0; y < s; y += 6) {
      const v = 190 + Math.floor(Math.random() * 50);
      ctx.fillStyle = `rgb(${v},${v - 8},${v - 20})`;
      ctx.fillRect(0, y, s, 6);
    }
    for (let i = 0; i < 260; i += 1) {
      ctx.fillStyle = `rgba(60,40,20,${Math.random() * 0.4})`;
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
  });