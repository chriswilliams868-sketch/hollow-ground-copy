import vanguard from './vanguard';
import paladin from './paladin';
import assassin from './assassin';
import sharpshooter from './sharpshooter';

// Class -> weapon archetypes. Each archetype carries its model, poses, combo/ranged profile
// and the way it modifies the class skill (`skill`).
export const ARSENAL = { vanguard, paladin, assassin, sharpshooter };

export const DEFAULT_WEAPON = { vanguard: 'longsword', paladin: 'warhammer', assassin: 'daggers', sharpshooter: 'blunderbuss' };

export const TOWER_SHIELD = { id: 'towerShield', slot: 'shield', name: 'Tower Shield', trait: 'Raised by Bulwark Block', stats: ['maxHp', 'guard'] };

export const weaponKit = (classId, id) => ARSENAL[classId][id] || ARSENAL[classId][DEFAULT_WEAPON[classId]];

export const gearDef = (classId, id) => (id === TOWER_SHIELD.id ? TOWER_SHIELD : weaponKit(classId, id));

export const gearOptions = (classId) => [...Object.values(ARSENAL[classId]), ...(classId === 'paladin' ? [TOWER_SHIELD] : [])];