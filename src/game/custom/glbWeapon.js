import * as THREE from 'three';
import { withModel } from './glbLibrary';

const WHITE = new THREE.Color('#ffffff');

// Each weapon gets its own material copy; `glow` lights the model's own colours.
function prepare(material, glow) {
  const copy = material.clone();
  if (glow > 0 && copy.emissive) {
    copy.emissive.copy(copy.map ? WHITE : copy.color);
    copy.emissiveMap = copy.map;
    copy.emissiveIntensity = glow;
  }
  return copy;
}

// Model space -> hand space: the longest side runs out along +Z from the fist (tip forward), the widest side lies
// across X like the built-in blades, scaled to `length`, with the point `grip` of the way up the handle at the fist.
function fitMatrix(scene, { length, grip, flip, spin = 0 }) {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3()).toArray();
  const [long, wide, thin] = [0, 1, 2].sort((a, b) => size[b] - size[a]);
  const axes = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  axes[long].set(0, 0, flip ? -1 : 1);
  axes[wide].set(1, 0, 0);
  axes[thin].set(0, 1, 0);
  if (axes[0].clone().cross(axes[1]).dot(axes[2]) < 0) axes[thin].negate();
  const anchor = box.getCenter(new THREE.Vector3()).toArray();
  anchor[long] = (flip ? box.max : box.min).getComponent(long) + (flip ? -1 : 1) * grip * size[long];
  const scale = length / size[long];
  return new THREE.Matrix4()
    .makeRotationZ(THREE.MathUtils.degToRad(spin))
    .multiply(new THREE.Matrix4().makeBasis(...axes))
    .scale(new THREE.Vector3(scale, scale, scale))
    .multiply(new THREE.Matrix4().makeTranslation(-anchor[0], -anchor[1], -anchor[2]));
}

// Fits a .glb weapon into a hand pivot. Returns its reach (for swing trails) and, when it glows, the material the
// charge effects brighten. A model still downloading drops into the hand the moment it arrives.
export function addGlbWeapon(pivot, url, fit) {
  const result = { reach: fit.length * (1 - fit.grip), glow: null };
  withModel(url, (scene) => {
    const place = fitMatrix(scene, fit);
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const material = Array.isArray(child.material) ? child.material.map((m) => prepare(m, fit.glow)) : prepare(child.material, fit.glow);
      const mesh = new THREE.Mesh(child.geometry.clone(), material);
      new THREE.Matrix4().multiplyMatrices(place, child.matrixWorld).decompose(mesh.position, mesh.quaternion, mesh.scale);
      mesh.castShadow = true;
      if (fit.glow > 0 && !result.glow) result.glow = [].concat(material)[0];
      pivot.add(mesh);
    });
  });
  return result;
}