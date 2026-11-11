import * as THREE from 'three';

// Full-screen black plane parented to the camera, for scene transitions (descending the stairs).
export class Fade {
  constructor(camera, scene) {
    this.material = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), this.material);
    this.mesh.position.z = -1;
    this.mesh.renderOrder = 999;
    this.mesh.visible = false;
    camera.add(this.mesh);
    scene.add(camera);
    this.phase = null;
    this.t = 0;
    this.onBlack = null;
  }

  get active() {
    return !!this.phase;
  }

  run(onBlack) {
    this.phase = 'out';
    this.t = 0;
    this.onBlack = onBlack;
    this.mesh.visible = true;
  }

  update(dt) {
    if (!this.phase) return;
    this.t += dt;
    if (this.phase === 'out') {
      this.material.opacity = Math.min(1, this.t / 0.45);
      if (this.t >= 0.45) {
        this.onBlack?.();
        this.phase = 'in';
        this.t = 0;
      }
      return;
    }
    this.material.opacity = Math.max(0, 1 - this.t / 0.7);
    if (this.t >= 0.7) {
      this.phase = null;
      this.mesh.visible = false;
    }
  }
}