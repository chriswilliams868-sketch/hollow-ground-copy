import * as THREE from 'three';
import { sightRays, terrainBlock } from './rays';
import { Fade, FadePool } from './fades';
import { TerrainCut } from './terrainCut';
import { HeroGhost } from './ghost';

// Scenery further than this from the hero can't rise into its sight lines.
const REACH = 13;
const CORNERS = [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]];
const probe = new THREE.Mesh();
const hits = [];
const bounds = new THREE.Box3();
const sphere = new THREE.Sphere();
const view = new THREE.Vector3();
const block = new THREE.Vector3();

const shown = (object) => {
  for (let o = object; o; o = o.parent) if (!o.visible) return false;
  return true;
};

// A structure's solid meshes, faded together.
function structureFade(root, pool) {
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh && !Array.isArray(o.material) && !o.material.transparent) meshes.push(o);
  });
  return new Fade(meshes, pool);
}

// A prop spot (tree, cactus, rock...): its instances step aside for stand-in meshes while it fades on its own.
function spotFade(spot, props, pool) {
  const proxies = spot.parts.map(({ mesh, matrix }) => {
    const proxy = new THREE.Mesh(mesh.geometry, mesh.material);
    proxy.matrixAutoUpdate = false;
    proxy.matrix.copy(matrix);
    proxy.castShadow = true;
    proxy.receiveShadow = true;
    return proxy;
  });
  props.group.add(...proxies);
  props.setHidden(spot, true);
  return new Fade(proxies, pool, () => {
    props.group.remove(...proxies);
    props.setHidden(spot, false);
  });
}

// Camera occlusion: every frame, sight lines from the isometric camera to the hero find the trees, cacti, rocks,
// ruins, buildings and terrain steps in the way. Those fade to see-through while the hero is behind them and back once
// it steps clear, and the hero's silhouette glows through whatever still covers it.
export class Occlusion {
  constructor(scene) {
    this.raycaster = new THREE.Raycaster();
    this.sights = [];
    this.blocking = new Set();
    this.chunks = new Set();
    this.ghost = new HeroGhost(scene);
    this.world = null;
  }

  // A new island (first frame, or a re-seed): drop the old one's fades and index the new one's structures.
  attach(world) {
    this.pool?.dispose();
    this.cut?.dispose();
    this.world = world;
    this.pool = new FadePool();
    this.cut = new TerrainCut(world.terrain.material);
    this.fades = new Map();
    this.structures = [];
    world.group.updateMatrixWorld(true);
    world.group.traverse((object) => {
      if (!object.userData.occluder) return;
      bounds.setFromObject(object).getBoundingSphere(sphere);
      this.structures.push({ root: object, x: sphere.center.x, z: sphere.center.z, r: sphere.radius });
    });
  }

  update(engine, dt) {
    const { world, player, camera } = engine;
    if (world !== this.world) this.attach(world);
    if (!player) return;
    camera.updateMatrixWorld();
    camera.getWorldDirection(view).negate();
    const feet = player.group.position;
    const sights = sightRays(this.raycaster, camera, feet, this.sights);
    this.blocking.clear();
    this.chunks.clear();
    this.findProps(world.props, feet, sights);
    this.findStructures(feet, sights);
    if (engine.zone === 'world') this.findTerrain(world.terrain, sights);

    this.blocking.forEach((key) => {
      if (!this.fades.has(key)) this.fades.set(key, key.isObject3D ? structureFade(key, this.pool) : spotFade(key, world.props, this.pool));
    });
    this.fades.forEach((fade, key) => {
      if (fade.step(this.blocking.has(key), dt)) this.fades.delete(key);
    });
    this.cut.update(this.chunks, feet, view, dt);
    this.ghost.update(player, this.blocking.size > 0 || this.chunks.size > 0, view, dt);
  }

  // Does this sight line run into `object` (one mesh, or a whole structure) before it reaches the hero?
  blocks(object, sight, recursive) {
    this.raycaster.ray.copy(sight.ray);
    this.raycaster.far = sight.far;
    hits.length = 0;
    this.raycaster.intersectObject(object, recursive, hits);
    return hits.some((hit) => shown(hit.object));
  }

  // Props near the hero on the camera's side of it: a quick bounds test, then the exact shape of each part.
  findProps(props, feet, sights) {
    props.spots.forEach((spot) => {
      const dx = spot.x - feet.x;
      const dz = spot.z - feet.z;
      if (Math.abs(dx) > REACH || Math.abs(dz) > REACH || dx * view.x + dz * view.z < -2) return;
      const hit = sights.some((sight) => sight.ray.intersectsBox(spot.box) && spot.parts.some(({ mesh, matrix }) => {
        probe.geometry = mesh.geometry;
        probe.material = mesh.material;
        probe.matrixWorld.copy(matrix);
        return this.blocks(probe, sight, false);
      }));
      if (hit) this.blocking.add(spot);
    });
  }

  findStructures(feet, sights) {
    this.structures.forEach(({ root, x, z, r }) => {
      if (Math.hypot(x - feet.x, z - feet.z) > r + REACH) return;
      if (sights.some((sight) => this.blocks(root, sight, true))) this.blocking.add(root);
    });
  }

  // Terrain steps: the chunk under the first column rising into a sight line (and its neighbours, should that step
  // straddle a chunk border) gets the see-through window.
  findTerrain(terrain, sights) {
    sights.forEach((sight) => {
      if (!terrainBlock(sight, block)) return;
      CORNERS.forEach(([ox, oz]) => {
        const mesh = terrain.meshAt(block.x + ox, block.z + oz);
        if (mesh) this.chunks.add(mesh);
      });
    });
  }
}