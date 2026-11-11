// Timed consumable buffs bought from Gerald (seconds remaining, saved with the run).
export const BUFFS = {
  might: { name: 'Damage Elixir', duration: 180 },
  stamina: { name: 'Stamina Tonic', duration: 180 },
};

export const freshBuffs = () => ({ might: 0, stamina: 0 });

export function updateBuffs(engine, dt) {
  Object.keys(BUFFS).forEach((id) => {
    if (engine.buffs[id] <= 0) return;
    engine.buffs[id] = Math.max(0, engine.buffs[id] - dt);
    if (engine.buffs[id] > 0) return;
    engine.refreshStats();
    engine.setHint(`${BUFFS[id].name} has worn off`, 2);
  });
}

export const buffHud = (engine) =>
  Object.keys(BUFFS)
    .filter((id) => engine.buffs[id] > 0)
    .map((id) => ({ id, left: Math.ceil(engine.buffs[id]) }));