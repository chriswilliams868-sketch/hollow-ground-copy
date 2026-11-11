// Living enemies plus the active boss once its intro is over.
export function livingTargets(engine) {
  const list = engine.enemies.filter((enemy) => !enemy.dead);
  const boss = engine.boss;
  if (boss && !boss.dead && boss.state !== 'intro') list.push(boss);
  return list;
}

export function targetsNear(engine, position, radius) {
  return livingTargets(engine).filter(
    (actor) => Math.hypot(actor.group.position.x - position.x, actor.group.position.z - position.z) < radius + actor.radius
  );
}