import { Coins } from 'lucide-react';

export default function CoinCounter({ value = 0, large = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-[#ffcf4d]/35 bg-black/50 font-mono tabular-nums text-[#ffd76a] backdrop-blur-md ${
        large ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-[10px]'
      }`}
    >
      <Coins className={large ? 'h-4 w-4' : 'h-3 w-3'} strokeWidth={2.4} />
      {value}
    </span>
  );
}