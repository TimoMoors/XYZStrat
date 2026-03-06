import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { WatchlistCoin, Action } from '@/lib/types';
import { Sparkline } from './Sparkline';

interface WatchlistSectionProps {
  coins: WatchlistCoin[];
}

function PriceChange({ value, size = 'sm' }: { value: number; size?: 'sm' | 'xs' }) {
  const positive = value >= 0;
  return (
    <span className={clsx(
      'flex items-center gap-0.5 font-medium',
      positive ? 'text-emerald-400' : 'text-red-400',
      size === 'sm' ? 'text-sm' : 'text-xs'
    )}>
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function ActionBadge({ action }: { action: Action }) {
  const config: Record<Action, string> = {
    buy: 'bg-emerald-500/20 text-emerald-300 border-emerald-600',
    sell: 'bg-red-500/20 text-red-300 border-red-600',
    hold: 'bg-yellow-500/20 text-yellow-300 border-yellow-600',
  };
  return (
    <span className={clsx('rounded px-1.5 py-0.5 text-xs font-bold border uppercase tracking-wide', config[action])}>
      {action}
    </span>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function CoinAvatar({ symbol }: { symbol: string }) {
  const colors = [
    'from-violet-500 to-purple-700',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-700',
    'from-yellow-500 to-orange-600',
    'from-teal-500 to-green-600',
    'from-red-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ];
  const color = colors[symbol.charCodeAt(0) % colors.length];
  return (
    <div className={clsx('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0', color)}>
      <span className="text-white text-xs font-bold">{symbol.slice(0, 2)}</span>
    </div>
  );
}

function CoinCard({ coin }: { coin: WatchlistCoin }) {
  const positive24h = coin.change24h >= 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CoinAvatar symbol={coin.symbol} />
          <div>
            <div className="text-white font-semibold text-sm leading-tight">{coin.symbol}</div>
            <div className="text-zinc-500 text-xs">{coin.name}</div>
          </div>
        </div>
        {coin.recommendation && (
          <ActionBadge action={coin.recommendation.action} />
        )}
      </div>

      {/* Sparkline */}
      <div className="flex items-end justify-center">
        <Sparkline data={coin.sparkline} width={200} height={48} positive={positive24h} />
      </div>

      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-white font-bold text-lg leading-tight">{formatPrice(coin.price)}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <PriceChange value={coin.change24h} size="xs" />
            <span className="text-zinc-600 text-xs">24h</span>
            <PriceChange value={coin.change7d} size="xs" />
            <span className="text-zinc-600 text-xs">7d</span>
          </div>
        </div>
        {coin.marketCap > 0 && (
          <div className="text-right">
            <div className="text-zinc-500 text-xs">Mkt Cap</div>
            <div className="text-zinc-400 text-xs font-medium">
              {coin.marketCap >= 1e9
                ? `$${(coin.marketCap / 1e9).toFixed(1)}B`
                : `$${(coin.marketCap / 1e6).toFixed(0)}M`}
            </div>
          </div>
        )}
      </div>

      {/* Recommendation reason */}
      {coin.recommendation && (
        <div className="border-t border-zinc-800 pt-2">
          <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{coin.recommendation.reason}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex-1 bg-zinc-800 rounded-full h-1 overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full',
                  coin.recommendation.confidence >= 7 ? 'bg-emerald-500' :
                  coin.recommendation.confidence >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${coin.recommendation.confidence * 10}%` }}
              />
            </div>
            <span className="text-zinc-600 text-xs">{coin.recommendation.confidence}/10</span>
          </div>
        </div>
      )}
    </div>
  );
}

// IREN is a stock so it has no on-chain data — show a static card
function IrenCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">IR</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">IREN</div>
            <div className="text-zinc-500 text-xs">Iris Energy · NASDAQ</div>
          </div>
        </div>
        <span className="bg-sky-900/40 text-sky-400 border border-sky-700 rounded px-1.5 py-0.5 text-xs font-medium">STOCK</span>
      </div>
      <div className="flex items-center justify-center h-12 text-zinc-600 text-xs text-center">
        Live price via your broker
      </div>
      <div className="text-zinc-500 text-xs">Bitcoin mining stock — check analysis in recommendations table for current positioning.</div>
    </div>
  );
}

export function WatchlistSection({ coins }: WatchlistSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {coins.map((coin) => (
        <CoinCard key={coin.id} coin={coin} />
      ))}
      <IrenCard />
    </div>
  );
}
