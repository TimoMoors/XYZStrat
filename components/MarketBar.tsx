'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketData } from '@/lib/types';
import { clsx } from 'clsx';
import { FearGreedGauge } from './FearGreedGauge';

interface MarketBarProps {
  marketData: MarketData;
}

function PriceChip({ label, price, change }: { label: string; price: string; change: number }) {
  const positive = change >= 0;
  return (
    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
      <span className="text-zinc-400 text-xs font-medium">{label}</span>
      <span className="text-white font-semibold text-sm">{price}</span>
      <span
        className={clsx(
          'flex items-center gap-0.5 text-xs font-medium',
          positive ? 'text-emerald-400' : 'text-red-400'
        )}
      >
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {positive ? '+' : ''}
        {change.toFixed(2)}%
      </span>
    </div>
  );
}


export function MarketBar({ marketData }: MarketBarProps) {
  const formatPrice = (p: number) =>
    p >= 1000
      ? `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : `$${p.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(0)}B`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PriceChip
        label="BTC"
        price={formatPrice(marketData.btcPrice)}
        change={marketData.btcChange24h}
      />
      <PriceChip
        label="ETH"
        price={formatPrice(marketData.ethPrice)}
        change={marketData.ethChange24h}
      />
      <div className="bg-zinc-800 rounded-lg px-3 py-1 border border-zinc-700">
        <div className="text-zinc-400 text-xs font-medium text-center mb-0.5">Fear & Greed</div>
        <FearGreedGauge value={marketData.fearGreedIndex} label={marketData.fearGreedLabel} />
      </div>
      <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
        <span className="text-zinc-400 text-xs font-medium">Market Cap</span>
        <span className="text-white font-semibold text-sm">{formatMarketCap(marketData.totalMarketCap)}</span>
      </div>
    </div>
  );
}
