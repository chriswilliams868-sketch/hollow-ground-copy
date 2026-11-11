import RelicIcon from '@/components/game/RelicIcon';

export default function RelicBadges({ relics }) {
  return (
    <div className="flex items-center gap-1.5">
      {relics.map((id) => (
        <span
          key={id}
          className="grid h-6 w-6 place-items-center rounded-md border border-[#ffb347]/40 bg-[#ff6b35]/15 text-[#ffb347]"
        >
          <RelicIcon id={id} className="h-3.5 w-3.5" />
        </span>
      ))}
    </div>
  );
}