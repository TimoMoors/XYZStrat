import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { TopMover } from '@/lib/types';

interface TopMoversProps {
  movers: TopMover[];
}

export function TopMovers({ movers }: TopMoversProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Top Movers (24h)</h3>
      <div className="space-y-2">
        {movers.map((mover, i) => {
          const positive = mover.change24h >= 0;
          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-xs w-4 text-right">{i + 1}</span>
                <div>
                  <span className="text-white text-sm font-medium">{mover.symbol}</span>
                  <span className="text-zinc-500 text-xs ml-1.5">{mover.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs">
                  ${mover.price >= 1000
                    ? mover.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
                    : mover.price.toLocaleString('en-US', { maximumFractionDigits: 3 })}
                </span>
                <span
                  className={clsx(
                    'flex items-center gap-0.5 text-xs font-semibold',
                    positive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {positive ? '+' : ''}{mover.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
