import * as THREE from 'three';
import { SEE_THROUGH, approach } from './fades';

const HEIGHT = '1.9'; // hero height the window covers, metres

const FRAGMENT = /* glsl */ `
uniform vec3 occBase;
uniform vec3 occView;
uniform float occFade;
varying vec3 vOccWorld;
// 1 where this fragment stands between the camera and the hero (inside a soft upright cylinder round the hero, seen
// along the view, and in front of it), 0 elsewhere.
float occWeight() {
  vec3 d = vOccWorld - occBase;
  float k = occView.y;
  float t = (d.y - dot(d, occView) * k) / (1.0 - k * k);
  vec3 e = d - vec3(0.0, clamp(t, 0.0, ${HEIGHT}), 0.0);
  float s = dot(e, occView);
  float lateral = length(e - occView * s);
  return smoothstep(0.05, 0.2, s) * smoothstep(-0.05, 0.1, t) * (1.0 - smoothstep(${HEIGHT} - 0.1, ${HEIGHT} + 0.2, t))
    * (1.0 - smoothstep(0.45, 0.8, lateral));
}
`;

// The terrain material twice over: the solid pass leaves out the window in front of the hero, and the veil (drawn
// after the hero, marking the stencil for its glow) fills the window back in see-through.
function cutMaterial(base, uniforms, veil) {
  const material = base.clone();
  if (veil) Object.assign(material, { transparent: true, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilZPass: THREE.ReplaceStencilOp });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vOccWorld;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOccWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT}`)
      .replace(
        '#include <clipping_planes_fragment>',
        veil ? '#include <clipping_planes_fragment>\nfloat occW = occWeight();\nif (occW < 0.002) discard;' : '#include <clipping_planes_fragment>\nif (occWeight() >= 0.002) discard;'
      )
      .replace('#include <color_fragment>', veil ? '#include <color_fragment>\ndiffuseColor.a *= mix(1.0, occFade, occW);' : '#include <color_fragment>');
  };
  material.customProgramCacheKey = () => (veil ? 'occlusion-veil' : 'occlusion-solid');
  return material;
}

// Terrain steps in front of the hero: the chunks hiding it draw that stretch see-through, through a soft window that
// follows the hero, until it steps clear and the window has faded shut.
export class TerrainCut {
  constructor(material) {
    this.base = material;
    this.uniforms = { occBase: { value: new THREE.Vector3() }, occView: { value: new THREE.Vector3(0, 1, 0) }, occFade: { value: 1 } };
    this.solid = cutMaterial(material, this.uniforms, false);
    this.veil = cutMaterial(material, this.uniforms, true);
    this.cut = new Map();
    this.alpha = 1;
  }

  // `chunks`: the terrain chunk meshes hiding the hero this frame; `view`: unit vector toward the camera.
  update(chunks, feet, view, dt) {
    chunks.forEach((mesh) => {
      if (this.cut.has(mesh)) return;
      const veil = new THREE.Mesh(mesh.geometry, this.veil);
      veil.receiveShadow = true;
      mesh.add(veil);
      mesh.material = this.solid;
      this.cut.set(mesh, veil);
    });
    if (!this.cut.size) return;
    this.alpha = approach(this.alpha, chunks.size ? SEE_THROUGH : 1, dt);
    this.uniforms.occBase.value.copy(feet);
    this.uniforms.occView.value.copy(view);
    this.uniforms.occFade.value = this.alpha;
    if (!chunks.size && this.alpha >= 1) this.restore();
  }

  restore() {
    this.cut.forEach((veil, mesh) => {
      mesh.remove(veil);
      mesh.material = this.base;
    });
    this.cut.clear();
  }

  dispose() {
    this.restore();
    this.solid.dispose();
    this.veil.dispose();
  }
}