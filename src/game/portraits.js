import * as THREE from 'three';
import { buildHero } from './heroes';
import { disposeGroup } from './actors';

let cache = null;

// How far each hero turns for its card; the Paladin shows its shield side so the raised hammer clears its visor.
const TURN = { paladin: 1.0 };

// Renders each hero model once (offscreen) into an image for the class selection cards.
export function renderPortraits(ids) {
  if (cache) return cache;
  const width = 400;
  const height = 500;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const key = new THREE.DirectionalLight('#ffd9b8', 2.6);
  key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight('#8b7bff', 2);
  rim.position.set(-4, 3, -3);
  scene.add(new THREE.HemisphereLight('#a99bff', '#120c1e', 1.2), key, rim);

  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);
  camera.position.set(2.5, 1.9, 4.1);
  camera.lookAt(0, 1.02, 0);

  cache = {};
  ids.forEach((id) => {
    const { group } = buildHero(id);
    group.rotation.y = TURN[id] ?? 0.3;
    scene.add(group);
    renderer.render(scene, camera);
    cache[id] = renderer.domElement.toDataURL('image/png');
    scene.remove(group);
    disposeGroup(group);
  });
  renderer.dispose();
  renderer.forceContextLoss();
  return cache;
}