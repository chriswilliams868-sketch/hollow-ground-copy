const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const ZOOM = [0.55, 1.8];

// Turntable controls for the inspector canvas: drag to spin (with inertia) and tilt, scroll or pinch to zoom.
// When left alone the auto-spin eases back in.
export class Orbit {
  constructor(element) {
    this.pointers = new Map();
    this.reset(0, 0.2);

    element.addEventListener('pointerdown', (event) => {
      element.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.velocity = 0;
      element.style.cursor = 'grabbing';
    });
    element.addEventListener('pointermove', (event) => {
      const last = this.pointers.get(event.pointerId);
      if (!last) return;
      if (this.pointers.size === 1) {
        const dx = (event.clientX - last.x) * 0.012;
        this.yaw += dx;
        this.pitch = clamp(this.pitch + (event.clientY - last.y) * 0.006, -0.3, 1.1);
        this.velocity = clamp(dx * 60, -8, 8);
        last.x = event.clientX;
        last.y = event.clientY;
        return;
      }
      const before = this.spread();
      last.x = event.clientX;
      last.y = event.clientY;
      const after = this.spread();
      if (before > 0 && after > 0) this.zoom = clamp((this.zoom * before) / after, ...ZOOM);
    });
    const release = (event) => {
      this.pointers.delete(event.pointerId);
      this.idle = 0;
      if (!this.pointers.size) element.style.cursor = 'grab';
    };
    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);
    element.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        this.zoom = clamp(this.zoom * Math.exp(event.deltaY * 0.0012), ...ZOOM);
      },
      { passive: false }
    );
  }

  spread() {
    const [a, b] = [...this.pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  reset(yaw, pitch) {
    this.yaw = yaw;
    this.pitch = pitch;
    this.zoom = 1;
    this.velocity = 0;
    this.idle = 1;
  }

  update(dt, spin) {
    if (this.pointers.size) {
      this.velocity *= Math.exp(-12 * dt);
      return;
    }
    this.idle += dt;
    this.yaw += this.velocity * dt;
    this.velocity *= Math.exp(-3.5 * dt);
    this.yaw += spin * dt * clamp(this.idle - 0.6, 0, 1);
  }
}