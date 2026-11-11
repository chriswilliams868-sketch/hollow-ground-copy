import DropTable from '@/components/game/DropTable';

const Heading = ({ children }) => (
  <h5 className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">{children}</h5>
);

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
      <p className="font-display text-[9px] uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[13px] font-bold text-white">{value}</p>
    </div>
  );
}

// Codex side panel: lore, level, base HP, attack types and the drop table.
export default function CodexDetails({ entry }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-relaxed text-white/70">{entry.lore}</p>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Level" value={entry.level} />
        <Stat label="Base HP" value={entry.hp.toLocaleString()} />
        <Stat label="Damage" value={entry.damage} />
      </div>
      <section>
        <Heading>Attack Types</Heading>
        <ul className="space-y-1.5">
          {entry.attacks.map((attack) => (
            <li key={attack.name} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: entry.color }}>{attack.name}</p>
              <p className="text-[12px] text-white/60">{attack.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <Heading>Drop Table</Heading>
        <DropTable drops={entry.drops} color={entry.color} />
      </section>
    </div>
  );
}