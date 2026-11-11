import XpBar from '@/components/game/XpBar';

export default function StatsTab({ stats }) {
  const rows = [
    ['Hero', stats.heroName],
    ['Class', stats.className],
    ['Gold', stats.coins],
    ['Weapon', stats.weapon],
    ['Base Damage', `${stats.baseDamage} (+${stats.damageBonus}%)`],
    [stats.skillName, stats.skillDetail],
    ['Weapon Element', stats.element],
    ['Move Speed', `${stats.moveSpeed} m/s`],
    ['Attack Speed', `${stats.attackSpeed}%`],
    ['Crit Chance', `${stats.crit}%`],
    ['Health', `${stats.hp}/${stats.maxHp}`],
    ['Total Kills', stats.kills],
    ['Gemstones', `${stats.gems}/4`],
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#ffd166]/25 bg-[#ffd166]/[0.05] p-4 short:p-3">
        <div className="flex items-baseline justify-between">
          <span className="min-w-0">
            <span className="block truncate font-display text-[11px] uppercase tracking-[0.24em] text-[#ffd166]/80">{stats.heroName}</span>
            <span className="font-display text-3xl font-bold text-white short:text-2xl">Level {stats.level}</span>
          </span>
          <span className="font-mono text-[11px] text-white/55">
            {stats.xpNext ? `${stats.xp} / ${stats.xpNext} XP` : 'Max level'}
          </span>
        </div>
        <div className="mt-2">
          <XpBar level={stats.level} xp={stats.xp} xpNext={stats.xpNext} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 short:grid-cols-4 short:gap-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <p className="font-display text-[9px] uppercase tracking-[0.2em] text-white/40">{label}</p>
            <p className="mt-1 font-mono text-sm text-white/90">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}