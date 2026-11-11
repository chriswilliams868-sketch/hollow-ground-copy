// Tab strip for the pause menu: icons on narrow phones, icon + label from sm up.
export default function PauseTabs({ tabs, active, onSelect }) {
  return (
    <nav className="flex border-b border-white/10">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          onClick={() => onSelect(id)}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 font-display text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors sm:text-[11px] short:py-2 ${
            active === id ? 'border-b-2 border-[#ff8a4c] text-white' : 'text-white/45 hover:text-white/70'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
}