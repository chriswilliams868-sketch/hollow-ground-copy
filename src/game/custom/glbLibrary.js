import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const models = new Map(); // url -> { scene, waiting }

// Loads each .glb once and shares it: `ready(scene)` runs as soon as the file is in (straight away once it is).
export function withModel(url, ready) {
  let entry = models.get(url);
  if (!entry) {
    entry = { scene: null, waiting: [] };
    models.set(url, entry);
    loader.load(url, ({ scene }) => {
      scene.updateMatrixWorld(true);
      entry.scene = scene;
      entry.waiting.forEach((fn) => fn(scene));
      entry.waiting = [];
    });
  }
  if (!ready) return;
  if (entry.scene) ready(entry.scene);
  else entry.waiting.push(ready);
}