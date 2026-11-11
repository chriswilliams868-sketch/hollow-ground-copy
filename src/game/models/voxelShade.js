import * as THREE from 'three';

const VERTEX = /* glsl */ `
attribute vec3 voxCell;
varying vec3 vVoxCell;
`;

const FRAGMENT = /* glsl */ `
varying vec3 vVoxCell;
uniform vec2 voxEtch;
uniform vec3 voxEtchScale;
uniform vec2 voxVein;
uniform vec3 voxVeinScale;
uniform vec3 voxVeinColor;
uniform float voxPulse;
float voxHash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float voxNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec2 e = vec2(1.0, 0.0);
  return mix(
    mix(mix(voxHash(i), voxHash(i + e.xyy), f.x), mix(voxHash(i + e.yxy), voxHash(i + e.xxy), f.x), f.y),
    mix(mix(voxHash(i + e.yyx), voxHash(i + e.xyx), f.x), mix(voxHash(i + e.yxx), voxHash(i + e.xxx), f.x), f.y),
    f.z
  );
}
`;

// Runs right after the vertex colours are applied: every voxel cube gets its own +/-5% brightness and saturation,
// then the material's optional etched cracks / ridges and glowing veins are traced over the voxel grid.
const SURFACE = /* glsl */ `
vec3 voxId = floor(vVoxCell);
float voxBright = 1.0 + (voxHash(voxId) - 0.5) * 0.22;
float voxLum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
diffuseColor.rgb = mix(vec3(voxLum), diffuseColor.rgb, 1.0 + (voxHash(voxId + 71.0) - 0.5) * 0.1) * voxBright;
totalEmissiveRadiance *= voxBright;
if (voxEtch.x != 0.0) {
  float voxCrack = 1.0 - step(voxEtch.y, abs(voxNoise((voxId + 0.5) * voxEtchScale) - 0.5));
  if (voxEtch.x < 0.0) {
    diffuseColor.rgb *= 1.0 + voxEtch.x * voxCrack;
    totalEmissiveRadiance *= 1.0 + voxEtch.x * voxCrack;
  } else {
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), voxEtch.x * voxCrack);
  }
}
if (voxVein.x > 0.0) {
  float voxRun = 1.0 - step(voxVein.y, abs(voxNoise((voxId + 0.5) * voxVeinScale + 17.3) - 0.5));
  diffuseColor.rgb = mix(diffuseColor.rgb, voxVeinColor, voxRun * 0.7);
  totalEmissiveRadiance += voxVeinColor * (voxVein.x * voxPulse * voxRun);
}
`;

const scale3 = (s) => (Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s));

// Voxel surface shading for a standard material used on voxel geometry (idempotent). Optional procedural patterns,
// both traced along the voxel grid in the model's own space (`scale` = pattern frequency per voxel, per axis):
// - etch { tone, scale, width }: dark cracks / bark grooves (tone < 0) or pale frost and crystal ridges (tone > 0)
// - veins { color, glow, scale, width }: glowing runic veins that brighten and fade with the material's emissive
//   (hit flashes, enrage, death fade)
export function shadeVoxels(material, { etch, veins } = {}) {
  if (!material.isMeshStandardMaterial || material.userData.voxels) return material;
  material.userData.voxels = true;
  const rest = material.emissiveIntensity || 1;
  const uniforms = {
    voxEtch: { value: new THREE.Vector2(etch?.tone ?? 0, etch?.width ?? 0.08) },
    voxEtchScale: { value: scale3(etch?.scale ?? 0.2) },
    voxVein: { value: new THREE.Vector2(veins?.glow ?? 0, veins?.width ?? 0.05) },
    voxVeinScale: { value: scale3(veins?.scale ?? 0.15) },
    voxVeinColor: { value: new THREE.Color(veins?.color ?? '#000000') },
    voxPulse: {
      get value() {
        return Math.min(3, material.emissiveIntensity / rest);
      },
    },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX}`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvVoxCell = voxCell;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${SURFACE}`);
  };
  return material;
}