import * as THREE from 'three';
import { disposeGroup } from '../actors';
import { fist } from './common';
import { longsword, claymore, greatsword, katana, dagger, throwingKnife } from './models/blades';
import { spear, battleAxe, warHammer } from './models/hafted';
import { blunderbuss, handCannon, sniperCannon } from './models/firearms';
import { towerShield } from './models/shield';
import { gearDef } from '../arsenal';
import { GEMS } from '../worldData';
import { CUSTOM_WEAPONS } from '../custom/customWeapons';
import { addGlbWeapon } from '../custom/glbWeapon';
import { withModel } from '../custom/glbLibrary';

// Fetch every custom weapon model up front, so each is ready long before it's equipped
CUSTOM_WEAPONS.forEach(({ url }) => withModel(url));
const customDef = (id) => CUSTOM_WEAPONS.find((def) => def.id === id);

function clear(pivot) {
  [...pivot.children].forEach((child) => {
    pivot.remove(child);
    disposeGroup(child);
  });
}

// Trail anchors along the weapon's reach (pivot-local +Z): known up front for custom models, else measured from its meshes.
const box = new THREE.Box3();
function tips(pivot, known) {
  let reach = known || 0.3;
  if (!known) {
    pivot.children.forEach((child) => {
      if (!child.geometry) return;
      child.geometry.computeBoundingBox();
      child.updateMatrix();
      reach = Math.max(reach, box.copy(child.geometry.boundingBox).applyMatrix4(child.matrix).max.z);
    });
  }
  const tip = new THREE.Object3D();
  tip.position.z = reach * 0.95;
  const base = new THREE.Object3D();
  base.position.z = reach * 0.45;
  pivot.add(tip, base);
  return { tip, base };
}

// Gem-forged weapons: every glowing channel burns in the gemstone's colour.
function tint(pivot, color) {
  pivot.traverse((child) => {
    const m = child.material;
    if (m?.emissive && m.emissiveIntensity > 0.3) {
      m.emissive.set(color);
      m.emissiveIntensity *= 1.25;
    }
  });
}

const MODELS = {
  longsword, spear, claymore,
  warHammer, battleAxe, greatsword, towerShield,
  dagger, katana, throwingKnife,
  blunderbuss, handCannon, sniperCannon,
};

const GUNS = ['blunderbuss', 'handCannon', 'sniperCannon'];

// Length and hold of a built-in weapon model: custom models default to those of the weapon they act as.
const sizes = {};
function builtInSize(id) {
  if (!sizes[id]) {
    const group = new THREE.Group();
    MODELS[id](group, 'common');
    const { min, max } = new THREE.Box3().setFromObject(group);
    disposeGroup(group);
    sizes[id] = { length: max.z - min.z, grip: -min.z / (max.z - min.z) };
  }
  return sizes[id];
}

// A custom .glb weapon (custom/customWeapons.js) in place of built-in model `id`; guns also get a muzzle at its tip.
function customModel(pivot, def, id) {
  const size = builtInSize(id);
  const fit = { length: def.length ?? size.length, grip: def.grip ?? size.grip, flip: def.flip, spin: def.spin, glow: def.glow };
  const model = addGlbWeapon(pivot, def.url, fit);
  if (GUNS.includes(id)) {
    model.muzzle = new THREE.Object3D();
    model.muzzle.position.z = model.reach;
    pivot.add(model.muzzle);
  }
  return model;
}

// Standalone copy of a bag item for the 3D inspector: its main-hand mesh at the item's tier (boss-tier relit in its
// gemstone colour), blades and hafts stood tip-up, guns and the shield left level.
export function weaponModel(item) {
  const id = item.slot === 'shield' ? 'towerShield' : gearDef(item.classId, item.archetype).hands.main;
  const group = new THREE.Group();
  const custom = customDef(item.model);
  if (custom) customModel(group, custom, id);
  else MODELS[id](group, item.rarity === 'boss' ? 'legendary' : item.rarity);
  if (item.forged) tint(group, GEMS[item.forged].color);
  if (!GUNS.includes(id) && id !== 'towerShield') group.rotation.x = -Math.PI / 2;
  return group;
}

// Each weapon sits in a grip node inside its hand pivot, so flourishes can spin and toss it without moving the fist.
function grip(pivot) {
  const node = new THREE.Group();
  pivot.add(node);
  return node;
}

// Swaps the hand-pivot meshes to the equipped weapon archetype and rarity tiers.
export function dressWeapons(parts, kit, tiers = {}) {
  const tier = tiers.weapon || 'common';
  const custom = customDef(tiers.model);
  clear(parts.weapon);
  if (parts.offhand) clear(parts.offhand);
  const grips = [grip(parts.weapon), parts.offhand ? grip(parts.offhand) : null];
  // A custom model stands in for the archetype's weapon in every hand holding it (never the Paladin's shield)
  const build = (id, pivot, t) => (custom && id === kit.hands.main ? customModel(pivot, custom, id) : MODELS[id](pivot, t));
  const main = build(kit.hands.main, grips[0], tier);
  const offId = parts.offhand && kit.hands.off;
  const off = offId ? build(offId, grips[1], offId === 'towerShield' ? tiers.shield || 'common' : tier) : {};
  const offWeapon = offId && offId !== 'towerShield';
  const mainTips = tips(grips[0], main.reach);
  const offTips = offWeapon ? tips(grips[1], off.reach) : null;
  Object.assign(parts, { grips, tip: mainTips.tip, tipBase: mainTips.base, offTip: offTips?.tip || null, offTipBase: offTips?.base || null });
  if (tiers.tint) {
    tint(grips[0], tiers.tint);
    if (offWeapon) tint(grips[1], tiers.tint);
  }
  if (parts.handColor) {
    fist(parts.weapon, parts.handColor);
    if (parts.offhand) fist(parts.offhand, parts.handColor);
  }
  parts.muzzles = [main.muzzle, off.muzzle].filter(Boolean);
  parts.glowMat = main.glow || parts.heroGlow;
  parts.glowBase = parts.glowMat.emissiveIntensity;
}