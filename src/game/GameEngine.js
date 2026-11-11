import * as THREE from 'three';
import { createWorld } from './world/index';
import { Effects } from './effects';
import { disposeGroup } from './actors';
import { buildHero } from './heroes';
import { CLASSES } from './classes';
import { PLAYER } from './constants';
import { WORLD, GEMS, GEM_ORDER, QUADRANTS } from './worldData';
import { biomeAt, biomeWeights } from './biomes';
import { updateEnemy, updateBoss } from './ai';
import { updatePlayer } from './player';
import { startAttack } from './attacks';
import { LockOn } from './lockOn';
import { bindInput } from './input';
import { Projectiles } from './projectiles';
import { Music } from './music';
import { fireShot } from './gunplay';
import { hudSnapshot } from './hudSnapshot';
import { menuData } from './menuData';
import * as charge from './charge';
import * as combat from './combat';
import { sfx, unlockAudio } from './audio';
import { Embers } from './embers';
import { Nameplates } from './nameplates';
import { Loot } from './loot';
import { Fade } from './fade';
import { rollRelics, relicMods } from './relics';
import { deriveStats, grantXp, enemyXp } from './progression';
import { rollGear } from './items';
import { populate } from './population';
import { checkTriggers, removeBoss } from './guardians';
import { freshInventory, applyGear, equip, discard, drinkPotion, rollDrops, collectLoot } from './inventory';
import { loadSave, writeSave } from './save';
import { Hazards } from './hazards';
import { DEFAULT_WEAPON } from './arsenal';
import { pressSkill, releaseSkill, updateSkill } from './skills';
import { updateStatus, speedFactor } from './status';
import { coastAt, SHORE_MARGIN } from './coast';
import { WeaponTrail } from './trail';
import { Coins } from './coins';
import { Gerald } from './npc';
import { shopData, buy, craft, deliver } from './blacksmith';
import { freshBuffs, updateBuffs } from './buffs';
import { groundHeight } from './terrain';
import { above } from './grounding';
import { updateAtmosphere } from './world/atmosphere';
import { applyWorldSeed } from './sites';
import { randomSeed, loadWorldRecord, storeWorldRecord } from './seed';
import { enemyCoins, bossCoins } from './bestiary';
import { onInspectorActive } from './inspect/inspector';
import { Occlusion } from './occlusion';

const CAM_DIR = new THREE.Vector3(1, 1.12, 1).normalize();
const UP = new THREE.Vector3(0, 1, 0);
const LOCK_OFFSET = new THREE.Vector3();
const AUTOSAVE = 30;

export default class GameEngine {
  constructor(host, callbacks = {}) {
    this.host = host;
    this.cb = callbacks;
    this.isMobile = window.matchMedia('(pointer: coarse)').matches;

    this.state = 'menu';
    this.keys = new Set();
    this.touch = { x: 0, y: 0 };
    this.camFwd = new THREE.Vector3(0, 0, -1);
    this.camRight = new THREE.Vector3(1, 0, 0);
    this.camTarget = new THREE.Vector3(WORLD.spawn.x, 0, WORLD.spawn.z);
    this.time = 0;
    this.hitStop = 0;
    this.shake = 0;
    this.hint = '';
    this.hintTimer = 0;
    this.enemies = [];
    this.boss = null;
    this.player = null;
    this.lastHud = '';
    this.disposed = false;
    this.hold = null;
    this.chargeSound = null;
    this.cls = CLASSES.vanguard;
    this.music = new Music();

    // The last saved world, or a fresh seed for a first visit
    const record = loadWorldRecord();
    this.seed = record?.seed ?? randomSeed();
    this.gatewayFound = !!record?.gatewayFound;
    applyWorldSeed(this.seed);

    this.initThree();
    this.unbindInput = bindInput(this);
    // A 3D inspector overlay (Codex, weapon inspect) has the GPU while it's open: the paused world isn't redrawn under it
    this.inspecting = false;
    this.offInspector = onInspectorActive((active) => {
      this.inspecting = active;
    });
    this.newProgress();
    this.buildRun();
    this.clock = new THREE.Clock();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#08060f');
    this.scene.fog = new THREE.Fog('#08060f', 34, 82);

    // Stencil: faded scenery marks where the hero's silhouette should glow through it
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile, powerPreference: 'high-performance', stencil: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.6 : 2));
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    this.host.appendChild(canvas);

    this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 220);
    this.hemi = new THREE.HemisphereLight('#8f7bff', '#0a0814', 0.9);
    this.scene.add(this.hemi);

    this.keyLight = new THREE.DirectionalLight('#ffd9b8', 2.1);
    this.keyLight.position.set(14, 22, 10);
    this.keyLight.castShadow = !this.isMobile;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(this.keyLight.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
    this.keyLight.shadow.bias = -0.0012;
    this.scene.add(this.keyLight, this.keyLight.target);

    const rim = new THREE.DirectionalLight('#6d5bff', 1.15);
    rim.position.set(-16, 12, -14);
    this.scene.add(rim);

    this.world = createWorld(this.scene);
    this.effects = new Effects(this.scene);
    this.orbs = new Embers(this.scene);
    this.nameplates = new Nameplates(this.scene);
    this.loot = new Loot(this);
    this.lock = new LockOn(this);
    this.projectiles = new Projectiles(this);
    this.fade = new Fade(this.camera, this.scene);
    this.hazards = new Hazards();
    this.trail = new WeaponTrail(this.scene, this.effects);
    this.coinDrops = new Coins(this.scene);
    this.gerald = new Gerald(this);
    this.occlusion = new Occlusion(this.scene);

    this.resize();
    this.handleResize = () => this.resize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
  }

  resize() {
    const width = this.host.clientWidth || window.innerWidth;
    const height = this.host.clientHeight || window.innerHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    let viewHeight = 21;
    if (viewHeight * aspect < 13) viewHeight = 13 / aspect;
    const camera = this.camera;
    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
  }

  // ---------- progression ----------

  newProgress() {
    this.level = 1;
    this.xp = 0;
    this.kills = 0;
    this.inventory = freshInventory();
    this.equipped = { weapon: null, shield: null };
    this.gems = [];
    this.doors = {};
    this.relics = [];
    this.heroName = 'Wanderer';
    this.coins = 0;
    this.quest = 0;
    this.forged = [];
    this.buffs = freshBuffs();
    this.codex = new Set();
  }

  loadProgress(save) {
    this.cls = CLASSES[save.classId];
    this.level = save.level || 1;
    this.xp = save.xp || 0;
    this.kills = save.kills || 0;
    // Older saves predate weapon archetypes: their gear was the class default weapon / tower shield
    const items = (save.inventory?.items ?? []).map((item) => ({
      ...item,
      archetype: item.archetype || (item.slot === 'shield' ? 'towerShield' : DEFAULT_WEAPON[item.classId]),
    }));
    this.inventory = { potions: save.inventory?.potions ?? 0, items };
    this.equipped = { weapon: null, shield: null, ...save.equipped };
    this.gems = save.gems || [];
    this.doors = save.doors || {};
    this.relics = save.relics || [];
    this.heroName = save.name || 'Wanderer';
    this.coins = save.coins || 0;
    this.quest = save.quest || 0;
    this.forged = save.forged || [];
    this.buffs = { ...freshBuffs(), ...save.buffs };
    // Saves from before the Codex still know the guardians whose gemstones they hold
    this.codex = new Set(save.codex || this.gems);
  }

  // First encounter with a mob type or boss records its Codex entry.
  discover(id) {
    this.codex.add(id);
  }

  refreshStats() {
    const player = this.player;
    const previous = player.maxHp;
    this.stats = deriveStats(this);
    player.maxHp = this.stats.maxHp;
    player.hp = Math.min(player.maxHp, player.hp + Math.max(0, player.maxHp - previous));
  }

  save() {
    if (writeSave(this)) {
      storeWorldRecord({ seed: this.seed, gatewayFound: this.gatewayFound });
      this.savedFlash = 1.8;
    }
    this.saveTimer = AUTOSAVE;
  }

  // A different world: re-seed every procedural layer and rebuild the island for it.
  reseed(seed, gatewayFound = false) {
    this.seed = seed;
    this.gatewayFound = gatewayFound;
    applyWorldSeed(seed);
    this.world.dispose();
    this.world = createWorld(this.scene);
  }

  // Fresh world around the current progression: player at the hub, every quadrant repopulated.
  buildRun() {
    if (this.player) {
      this.scene.remove(this.player.group);
      disposeGroup(this.player.group);
    }
    removeBoss(this);
    this.effects.clear();
    this.orbs.clear();
    this.loot.clear();
    this.coinDrops.clear();
    this.trail.clear();
    this.lock.clear();
    this.cancelCharge();
    this.projectiles.clear();
    this.hazards.clear();
    this.world.arena.reset();
    this.world.gate.setGems(this.gems);
    this.world.gate.setOpen(!!this.doors.dungeon, true);
    this.slain = new Set();
    this.zone = 'world';
    this.regionId = null;
    this.mods = relicMods(this.relics);

    this.player = this.createPlayerState();
    this.scene.add(this.player.group);
    applyGear(this);
    this.player.hp = this.player.maxHp;
    populate(this);

    this.relicTimer = 0;
    this.freeze = 0;
    this.runTime = 0;
    this.hitStop = 0;
    this.shake = 0;
    this.hint = '';
    this.hintTimer = 0;
    this.endTimer = 0;
    this.endPhase = null;
    this.bossCleanup = 0;
    this.potionCooldown = 0;
    this.saveTimer = AUTOSAVE;
    this.savedFlash = 0;
    this.gateHintAt = 0;
    this.bagHintAt = 0;
    this.camTarget.set(WORLD.spawn.x, 0, WORLD.spawn.z);
    this.pushHud(true);
  }

  createPlayerState() {
    const cls = this.cls;
    const { group, parts } = buildHero(cls.id);
    group.position.set(WORLD.spawn.x, 0, WORLD.spawn.z);
    group.rotation.y = Math.PI;
    const maxHp = Math.round(PLAYER.maxHp * cls.hp);
    return {
      group,
      parts,
      cls,
      hp: maxHp,
      maxHp,
      stamina: PLAYER.maxStamina,
      maxStamina: PLAYER.maxStamina,
      facing: Math.PI,
      lastDir: new THREE.Vector3(0, 0, -1),
      knock: new THREE.Vector3(),
      iframe: 0,
      flash: 0,
      attackCooldown: 0,
      staminaDelay: 0,
      dodging: false,
      dodgeTimer: 0,
      dodgeDir: new THREE.Vector3(0, 0, -1),
      dash: 0,
      ghost: 0,
      stride: 0,
      attack: null,
      comboIndex: 0,
      comboTimer: 0,
      parryWindow: 0,
      skillCooldown: 0,
      riposte: 0,
      blocking: false,
      guardHeld: false,
      guardFlash: 0,
      hop: null,
      charging: false,
      chargeTime: 0,
      chargeFx: 0,
      kit: null,
      ammo: 0,
      reload: 0,
      shotTimer: 0,
      gun: 0,
      air: null,
      flip: null,
      flourish: [null, null],
      flourishIn: 1,
      flourishHand: 0,
      dead: false,
      deathTimer: 0,
    };
  }

  // ---------- scene pipeline ----------

  openSelect() {
    unlockAudio();
    this.music.start();
    sfx.click();
    this.setState('select');
  }

  // Class chosen: name the hero next.
  pickClass(classId) {
    sfx.click();
    this.cls = CLASSES[classId] || CLASSES.vanguard;
    this.setState('name');
  }

  backToSelect() {
    sfx.click();
    this.setState('select');
  }

  // New game with the chosen class and hero name, starting at the cottage.
  start(name) {
    unlockAudio();
    this.music.start();
    sfx.click();
    this.newProgress();
    this.heroName = name;
    this.reseed(randomSeed());
    this.buildRun();
    this.setState('playing');
    this.setHint(`Welcome, ${name} · Gerald the Blacksmith waits by the forge`, 4);
  }

  continueGame() {
    const save = loadSave();
    if (!save) return;
    unlockAudio();
    this.music.start();
    sfx.click();
    this.loadProgress(save);
    const record = loadWorldRecord();
    if (record && record.seed !== this.seed) this.reseed(record.seed, !!record.gatewayFound);
    this.buildRun();
    this.setState('playing');
    this.setHint(`Welcome back, ${this.heroName} · Level ${this.level} · ${this.gems.length}/4 gemstones`, 3.5);
  }

  // After death or victory: keep all progress, return to the hub.
  respawn() {
    sfx.click();
    this.buildRun();
    this.setState('playing');
    this.save();
  }

  saveAndQuit() {
    this.save();
    this.buildRun();
    this.setState('menu');
  }

  togglePause() {
    if (this.state === 'shop') {
      this.closeShop();
      return;
    }
    if (this.state === 'playing') {
      this.setState('paused');
      this.pushMenu();
    } else if (this.state === 'paused') {
      this.resume();
    }
  }

  resume() {
    if (this.state !== 'paused') return;
    sfx.click();
    this.setState('playing');
  }

  // Tab: pause straight into the inventory tab; pressing it again closes the menu.
  toggleInventory() {
    if (this.state === 'paused') {
      this.resume();
    } else if (this.state === 'playing') {
      this.setState('paused');
      this.pushMenu('inventory');
    }
  }

  pushMenu(tab) {
    this.cb.onMenu?.({ ...menuData(this), tab });
  }

  // ---------- Gerald: quests, forge & shop ----------

  interact() {
    if (this.state !== 'playing' || !this.gerald.near) return;
    sfx.click();
    this.shopNotice = '';
    this.setState('shop');
    this.pushShop();
  }

  closeShop() {
    if (this.state !== 'shop') return;
    sfx.click();
    this.setState('playing');
  }

  pushShop() {
    this.cb.onShop?.(shopData(this));
  }

  buyItem(id) {
    buy(this, id);
    this.pushShop();
  }

  craftWeapon(gem) {
    craft(this, gem);
    this.pushShop();
  }

  deliverGem() {
    deliver(this);
    this.pushShop();
  }

  addCoins(value) {
    this.coins += value;
    sfx.coin();
  }

  equipItem(id) {
    equip(this, id);
    this.pushMenu();
  }

  discardItem(id) {
    discard(this, id);
    this.pushMenu();
  }

  drinkPotion() {
    if (drinkPotion(this) && this.state === 'paused') this.pushMenu();
  }

  collectLoot(item) {
    return collectLoot(this, item);
  }

  collectGem(id) {
    if (this.gems.includes(id)) return;
    this.gems = [...this.gems, id];
    this.world.gate.setGems(this.gems);
    const gem = GEMS[id];
    const pos = this.player.group.position;
    this.effects.blast(pos, 4, gem.color);
    this.effects.popup(above(pos, 2.4), gem.name, gem.color);
    sfx.gem();
    if (this.gems.length >= GEM_ORDER.length) {
      this.doors = { ...this.doors, dungeon: true };
      this.world.gate.setOpen(true);
      this.setHint(this.gatewayFound ? 'All four gemstones gathered · the Hollow Gateway has unsealed' : 'All four gemstones gathered · seek the hidden Hollow Gateway', 4);
      sfx.gateOpen();
    } else {
      this.setHint(`${gem.name} obtained · ${this.gems.length}/4`, 3.5);
    }
    this.relicTimer = 1.4;
    this.save();
  }

  // First sight of the Hollow Gateway Ruins: it goes on the map and is remembered for this world.
  discoverGateway() {
    this.gatewayFound = true;
    this.setHint(this.doors.dungeon ? 'Hollow Gateway Ruins discovered · the way down is open' : `Hollow Gateway Ruins discovered · sealed · ${this.gems.length}/4 gemstones`, 4);
    sfx.gem();
    this.save();
  }

  descend() {
    if (this.fade.active) return;
    this.fade.run(() => {
      const { arrive } = WORLD.lair;
      this.zone = 'lair';
      this.lock.clear();
      this.player.group.position.set(arrive.x, 0, arrive.z);
      this.player.facing = Math.PI;
      this.camTarget.set(arrive.x, 0, arrive.z);
      this.setHint("The Hollow King's Lair · step into the arena", 3.5);
    });
  }

  onEnemySlain(enemy) {
    this.kills += 1;
    this.discover(enemy.type);
    const count = Math.min(7, 2 + Math.floor(enemy.level / 7));
    this.orbs.spawn(enemy.group.position, count, enemyXp(enemy.level, enemy.big) / count);
    this.coinDrops.spawn(enemy.group.position, enemyCoins(enemy.level, enemy.big), Math.min(6, 2 + Math.floor(enemy.level / 8)));
    rollDrops(this, enemy);
  }

  onBossSlain(boss) {
    this.kills += 1;
    const pos = boss.group.position;
    this.orbs.spawn(pos, 10, (enemyXp(boss.level) * 8) / 10);
    if (boss.king) {
      this.endPhase = 'won';
      this.endTimer = 2;
      return;
    }
    this.slain.add(boss.gem);
    this.coinDrops.spawn(pos, bossCoins(boss.level), 12);
    this.loot.spawn('gem', boss.gem, pos, 0);
    this.loot.spawn('potion', null, pos);
    this.loot.spawn('potion', null, pos);
    this.loot.spawn('gear', rollGear(this.cls.id, boss.level, biomeAt(pos.x, pos.z).id, true), pos);
    this.bossCleanup = 2.6;
    this.setHint(`${boss.name} has fallen`, 3);
  }

  // ---------- combat & input ----------

  damageEnemy(enemy, amount, dir, hit) {
    combat.damageEnemy(this, enemy, amount, dir, hit);
  }

  damageBoss(amount, dir, hit) {
    combat.damageBoss(this, amount, dir, hit);
  }

  damagePlayer(amount, sourcePosition, source) {
    return combat.damagePlayer(this, amount, sourcePosition, source);
  }

  damageActor(actor, amount, dir, hit) {
    if (actor === this.boss) this.damageBoss(amount, dir, hit);
    else this.damageEnemy(actor, amount, dir, hit);
  }

  // Damage-over-time tick from a status effect (no stagger, knockback or crits).
  dotDamage(actor, amount, kind) {
    this.damageActor(actor, amount, new THREE.Vector3(), { dot: kind });
  }

  getMoveVector() {
    let x = this.touch.x;
    let y = this.touch.y;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    const dir = new THREE.Vector3();
    dir.addScaledVector(this.camFwd, y);
    dir.addScaledVector(this.camRight, x);
    if (dir.lengthSq() > 1) dir.normalize();
    return dir;
  }

  setMoveInput(vector) {
    this.touch.x = vector.x;
    this.touch.y = vector.y;
  }

  attack() {
    if (this.state !== 'playing') return;
    const player = this.player;
    if (!player || player.dead || player.dodging || player.charging || player.blocking || player.hop) return;
    if (player.kit.ranged) {
      fireShot(this);
      return;
    }
    if (player.attack) {
      if (player.attack.phase === 'active' || player.attack.phase === 'recovery') player.attack.queued = true;
      return;
    }
    if (player.attackCooldown > 0) return;
    const index = player.comboTimer > 0 ? player.comboIndex : 0;
    if (player.stamina < player.kit.combo[index].cost) {
      this.setHint('Out of stamina', 1);
      return;
    }
    startAttack(this, player, index);
  }

  attackPress() {
    charge.press(this);
  }

  attackRelease() {
    charge.release(this);
  }

  cancelCharge() {
    charge.cancel(this);
  }

  lockOn() {
    if (this.state !== 'playing' || !this.player || this.player.dead) return;
    this.lock.tap();
  }

  dodge() {
    if (this.state !== 'playing') return;
    const player = this.player;
    if (!player || player.dead || player.dodging || player.attack || player.hop || player.flip) return;
    const dodge = this.cls.dodge;
    if (player.stamina < dodge.cost) {
      this.setHint('Out of stamina', 1);
      return;
    }
    this.cancelCharge();
    player.stamina -= dodge.cost;
    player.staminaDelay = PLAYER.regenDelay;
    player.dodging = true;
    player.dodgeTimer = dodge.duration;
    player.iframe = dodge.iframe;

    const dir = this.getMoveVector();
    if (dir.lengthSq() > 0.01) {
      player.dodgeDir.copy(dir).normalize();
      player.facing = Math.atan2(player.dodgeDir.x, player.dodgeDir.z);
    } else {
      player.dodgeDir.set(Math.sin(player.facing), 0, Math.cos(player.facing));
    }
    player.lastDir.copy(player.dodgeDir);
    player.group.rotation.y = player.facing;
    this.effects.ring(player.group.position, 1.7, '#7ef5e0', 0.35);
    sfx.whoosh();

    if (this.relics.includes('firering')) {
      const pos = player.group.position;
      this.effects.blast(pos, 2.8, '#ff6b35');
      this.enemies.forEach((enemy) => {
        if (!enemy.dead && enemy.group.position.distanceTo(pos) < 2.8) {
          this.damageEnemy(enemy, 10, new THREE.Vector3().subVectors(enemy.group.position, pos).setY(0).normalize());
        }
      });
      if (this.boss && !this.boss.dead && this.boss.group.position.distanceTo(pos) < 2.8 + this.boss.radius) {
        this.damageBoss(10, new THREE.Vector3(0, 0, 1));
      }
    }
  }

  // Class secondary skill (parry, shield block, smoke bomb, satchel bomb).
  skillPress() {
    pressSkill(this);
  }

  skillRelease() {
    releaseSkill(this);
  }

  chooseRelic(id) {
    sfx.click();
    this.relics = [...this.relics, id];
    this.mods = relicMods(this.relics);
    this.refreshStats();
    this.setState('playing');
    this.save();
  }

  // Boss arena while a boss fight runs, the lair floor underground, otherwise the world square.
  clampPosition(position, extra = 0, useArena = true) {
    const boss = this.boss;
    if (useArena && boss && (!boss.dead || boss.king)) {
      this.clampCircle(position, boss.arena.x, boss.arena.z, boss.arena.radius - 0.7 - extra);
      return;
    }
    if (this.zone === 'lair') {
      this.clampCircle(position, WORLD.lair.x, WORLD.lair.z, WORLD.lair.floor - extra);
      return;
    }
    // Stay inside the coastline, just short of the shore rocks
    const distance = Math.hypot(position.x, position.z);
    const limit = coastAt(position.x, position.z) - SHORE_MARGIN - extra;
    if (distance > limit) {
      position.x *= limit / distance;
      position.z *= limit / distance;
    }
    this.world.colliders.forEach((c) => {
      const dx = position.x - c.x;
      const dz = position.z - c.z;
      const distance = Math.hypot(dx, dz);
      const min = c.r + 0.4 + extra;
      if (distance < min && distance > 0.001) {
        position.x = c.x + (dx / distance) * min;
        position.z = c.z + (dz / distance) * min;
      }
    });
  }

  clampCircle(position, cx, cz, limit) {
    const dx = position.x - cx;
    const dz = position.z - cz;
    const distance = Math.hypot(dx, dz);
    if (distance > limit && distance > 0.001) {
      position.x = cx + (dx / distance) * limit;
      position.z = cz + (dz / distance) * limit;
    }
  }

  setHint(text, duration = 2) {
    this.hint = text;
    this.hintTimer = duration;
  }

  // Announce a biome when the player crosses into it (with hysteresis near the roads).
  updateRegion() {
    if (this.zone !== 'world') return;
    const pos = this.player.group.position;
    let id = this.regionId;
    const { clearing } = WORLD;
    if (Math.hypot(pos.x - clearing.x, pos.z - clearing.z) < clearing.radius) id = 'cottage';
    else if (Math.hypot(pos.x, pos.z) < 9) id = 'hub';
    else {
      // Only switch once one biome clearly dominates, so the border bands don't flicker the banner
      const weights = biomeWeights(pos.x, pos.z);
      const best = weights.indexOf(Math.max(...weights));
      if (weights[best] > 0.62) id = QUADRANTS[best].id;
    }
    if (id === this.regionId) return;
    const first = this.regionId === null;
    this.regionId = id;
    if (first || id === 'hub' || id === 'cottage') return;
    const q = QUADRANTS.find((entry) => entry.id === id);
    this.setHint(`${q.name} · Enemies Lv ${q.levels[0]}-${q.levels[1]}`, 3);
  }

  updateCamera(dt) {
    const desired = this.camTarget.clone();
    if (this.player) {
      // Focus rides the terrain under the hero so hills stay framed the same as flat ground
      const p = this.player.group.position;
      desired.set(p.x, groundHeight(p.x, p.z), p.z);
      desired.add(this.lock.cameraOffset(LOCK_OFFSET));
      if (this.state === 'menu' || this.state === 'select') desired.set(WORLD.spawn.x, 0, WORLD.spawn.z - 4);
    }
    this.camTarget.lerp(desired, 1 - Math.exp(-5 * dt));

    const camera = this.camera;
    camera.position.copy(this.camTarget).addScaledVector(CAM_DIR, 52);
    if (this.shake > 0.002) {
      const amount = this.shake;
      camera.position.x += (Math.random() - 0.5) * amount * 2.4;
      camera.position.y += (Math.random() - 0.5) * amount * 2.4;
      camera.position.z += (Math.random() - 0.5) * amount * 2.4;
      this.shake *= Math.exp(-7 * dt);
    }
    camera.lookAt(this.camTarget);

    this.camFwd.copy(this.camTarget).sub(camera.position).setY(0).normalize();
    this.camRight.crossVectors(this.camFwd, UP).normalize();
    this.keyLight.position.set(this.camTarget.x + 14, this.camTarget.y + 22, this.camTarget.z + 10);
    this.keyLight.target.position.copy(this.camTarget);
  }

  pushHud(force = false) {
    if (!this.player || !this.stats) return;
    const snapshot = hudSnapshot(this);
    const key = JSON.stringify(snapshot);
    if (force || key !== this.lastHud) {
      this.lastHud = key;
      this.cb.onHud?.(snapshot);
    }
  }

  pushStats() {
    const total = Math.floor(this.runTime);
    this.cb.onStats?.({
      kills: this.kills,
      level: this.level,
      time: `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`,
    });
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    if (state !== 'playing') this.cancelCharge();
    if (state === 'won' || state === 'dead') this.pushStats();
    if (state === 'won') sfx.victory();
    if (state === 'dead') sfx.defeat();
    this.cb.onPhase?.(state);
  }

  updateMusic() {
    const boss = this.boss && !this.boss.dead ? this.boss : null;
    let mode = 'explore';
    if (this.state === 'playing' || this.state === 'relic' || this.state === 'paused') {
      if (boss && boss.phase === 2) mode = 'boss2';
      else if (boss || this.enemies.some((enemy) => !enemy.dead && enemy.state !== 'patrol')) mode = 'combat';
    }
    this.music.setMode(mode);
  }

  updatePlaying(raw, dt) {
    this.runTime += raw;
    charge.update(this, raw);
    updateSkill(this, dt);
    updatePlayer(this, dt);
    const p = this.player.group.position;
    this.enemies.forEach((enemy) => {
      const e = enemy.group.position;
      if (enemy.dead || Math.abs(e.x - p.x) + Math.abs(e.z - p.z) < 50) {
        updateEnemy(this, enemy, dt);
        updateStatus(this, enemy, dt);
      }
    });
    if (this.boss) {
      this.boss.broken = Math.max(0, this.boss.broken - dt);
      updateBoss(this, this.boss, dt * speedFactor(this.boss));
      if (this.boss) updateStatus(this, this.boss, dt);
    }
    this.hazards.update(dt);
    if (this.bossCleanup > 0) {
      this.bossCleanup -= raw;
      if (this.bossCleanup <= 0) removeBoss(this);
    }
    checkTriggers(this);
    this.updateRegion();
    this.projectiles.update(dt);
    this.loot.update(raw);
    this.orbs.update(raw, p, (value) => {
      grantXp(this, value);
      sfx.pickup();
    });
    this.coinDrops.update(raw, p, (value) => this.addCoins(value));
    updateBuffs(this, raw);
    this.potionCooldown = Math.max(0, this.potionCooldown - raw);
    this.saveTimer -= raw;
    if (this.saveTimer <= 0 && !this.player.dead) this.save();
    if (this.relicTimer > 0 && !this.player.dead) {
      this.relicTimer -= raw;
      if (this.relicTimer <= 0) {
        const choices = rollRelics(3, this.relics);
        if (choices.length) {
          this.cb.onRelics?.(choices);
          this.setState('relic');
        }
      }
    }
  }

  loop() {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.inspecting) return;

    const raw = Math.min(this.clock.getDelta(), 0.05);
    this.time += raw;
    if (this.hintTimer > 0) {
      this.hintTimer -= raw;
      if (this.hintTimer <= 0) this.hint = '';
    }
    this.savedFlash = Math.max(0, this.savedFlash - raw);

    const dt = this.freeze > 0 ? 0 : this.hitStop > 0 ? raw * 0.16 : raw;
    if (this.freeze > 0) this.freeze = Math.max(0, this.freeze - raw);
    if (this.hitStop > 0) this.hitStop = Math.max(0, this.hitStop - raw);

    if (this.endTimer > 0) {
      this.endTimer -= raw;
      if (this.endTimer <= 0 && this.endPhase) {
        this.setState(this.endPhase);
        this.endPhase = null;
      }
    }

    if (this.state === 'playing') {
      this.updatePlaying(raw, dt);
    } else {
      this.enemies.forEach((enemy) => {
        if (enemy.dead) updateEnemy(this, enemy, dt);
      });
      if (this.boss) updateBoss(this, this.boss, dt);
      if (this.player) updatePlayer(this, dt);
    }

    this.effects.update(raw);
    this.nameplates.update();
    this.updateMusic();
    this.world.update(this.time, raw, this.camTarget, this.camera);
    updateAtmosphere(this.scene, this.hemi, this.camTarget, this.zone, raw);
    this.gerald.update(raw);
    this.trail.update(raw);
    this.lock.update(raw);
    this.fade.update(raw);
    this.updateCamera(raw);
    this.occlusion.update(this, raw);
    this.pushHud();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    this.unbindInput?.();
    this.offInspector?.();
    this.cancelCharge();
    this.music.stop();
    this.renderer?.domElement?.remove();
    this.effects?.clear();
    this.orbs?.clear();
    this.loot?.clear();
    this.coinDrops?.clear();
    this.hazards?.clear();
    this.nameplates?.clear();
    this.renderer?.dispose();
  }
}