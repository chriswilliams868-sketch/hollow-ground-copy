import * as THREE from 'three';
import { disposeGroup } from '../actors';
import { Orbit } from './orbit';

const listeners = new Set();
const emit = (active) => listeners.forEach((fn) => fn(active));

// The game listens so it can stop redrawing the paused world while an inspector viewport is on screen.
export function onInspectorActive(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// One lightweight overlay renderer shared by every 3D inspector (Codex turntable, weapon inspect). Its canvas moves
// into whichever viewport is mounted and only draws while one is.
class Inspector {
  constructor() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' });
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    const key = new THREE.DirectionalLight('#ffd9b8', 2.6);
    key.position.set(3, 5, 4);
    const rim = new THREE.DirectionalLight('#8b7bff', 2);
    rim.position.set(-4, 3, -3);
    this.scene.add(new THREE.HemisphereLight('#a99bff', '#120c1e', 1.2), key, rim);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    this.orbit = new Orbit(renderer.domElement);
    this.clock = new THREE.Clock();
    this.resizer = new ResizeObserver(() => this.resize());
    this.size = new THREE.Vector3(1, 1, 1);
    this.distance = 5;
    this.t = 0;
    this.loop = this.loop.bind(this);
  }

  mount(host) {
    this.host = host;
    host.appendChild(this.renderer.domElement);
    this.resizer.observe(host);
    this.resize();
    this.clock.getDelta();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
    emit(true);
  }

  unmount(host) {
    if (this.host !== host) return;
    cancelAnimationFrame(this.raf);
    this.resizer.disconnect();
    this.renderer.domElement.remove();
    this.clear();
    this.host = null;
    emit(false);
  }

  // subject: { build() -> { object, animate?, dispose? }, yaw?, pitch, spin, hover? }
  show(subject) {
    this.clear();
    this.subject = subject;
    this.view = subject.build();
    const holder = new THREE.Group();
    holder.add(this.view.object);
    holder.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(holder);
    box.getSize(this.size);
    holder.position.copy(box.getCenter(new THREE.Vector3())).negate();
    this.pivot.add(holder);
    this.holder = holder;
    // Without a set angle, turn the broad face (sword flat, gun profile) toward the camera, then a little past it
    const yaw = subject.yaw ?? (this.size.x < this.size.z ? Math.PI / 2 : 0) + 0.4;
    this.orbit.reset(yaw, subject.pitch);
    this.fit();
  }

  clear() {
    if (!this.holder) return;
    this.pivot.remove(this.holder);
    disposeGroup(this.holder);
    this.view.dispose?.();
    this.holder = null;
    this.view = null;
  }

  // Camera distance that keeps the whole model in frame at any spin angle.
  fit() {
    const vertical = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const horizontal = Math.atan(Math.tan(vertical) * this.camera.aspect);
    const halfWidth = Math.hypot(this.size.x, this.size.z) / 2;
    this.distance = Math.max(this.size.y / 2 / Math.tan(vertical), halfWidth / Math.tan(horizontal)) * 1.1 + halfWidth * 0.5;
    this.camera.near = this.distance / 40;
    this.camera.far = this.distance * 8;
    this.camera.updateProjectionMatrix();
  }

  resize() {
    const width = this.host?.clientWidth;
    const height = this.host?.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.fit();
  }

  loop() {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.t += dt;
    const subject = this.subject;
    this.orbit.update(dt, subject?.spin ?? 0.4);
    if (this.view) {
      this.view.animate?.(dt);
      this.pivot.rotation.y = this.orbit.yaw;
      this.pivot.position.y = subject.hover ? Math.sin(this.t * 1.8) * this.size.y * 0.035 : 0;
    }
    const distance = this.distance * this.orbit.zoom;
    this.camera.position.set(0, Math.sin(this.orbit.pitch) * distance, Math.cos(this.orbit.pitch) * distance);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
}

let instance = null;
export const getInspector = () => instance || (instance = new Inspector());