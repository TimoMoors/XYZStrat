'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketData } from '@/lib/types';
import { clsx } from 'clsx';

interface MarketBarProps {
  marketData: MarketData;
}

function Divider() {
  return <div className="w-px h-6 bg-zinc-700 shrink-0" />;
}

function StatItem({
  label,
  value,
  change,
  valueColor,
}: {
  label: string;
  value: string;
  change?: number;
  valueColor?: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="flex flex-col gap-0.5 px-4">
      <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className={clsx('text-sm font-semibold', valueColor ?? 'text-white')}>{value}</span>
        {change !== undefined && (
          <span className={clsx('flex items-center gap-0.5 text-xs font-medium', positive ? 'text-emerald-400' : 'text-red-400')}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {positive ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

function FearGreedBar({ value, label }: { value: number; label: string }) {
  const getColor = () => {
    if (value <= 25) return { bar: 'bg-red-500', text: 'text-red-400' };
    if (value <= 45) return { bar: 'bg-orange-500', text: 'text-orange-400' };
    if (value <= 55) return { bar: 'bg-yellow-500', text: 'text-yellow-400' };
    if (value <= 75) return { bar: 'bg-lime-500', text: 'text-lime-400' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
  };
  const { bar, text } = getColor();

  return (
    <div className="flex flex-col gap-0.5 px-4">
      <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Fear & Greed</span>
      <div className="flex items-center gap-2">
        <span className={clsx('text-sm font-semibold', text)}>{value}</span>
        <div className="flex flex-col gap-0.5">
          <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div className={clsx('h-full rounded-full transition-all', bar)} style={{ width: `${value}%` }} />
          </div>
          <span className={clsx('text-xs font-medium', text)}>{label}</span>
        </div>
      </div>
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

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(0)}B`;
    return `$${(vol / 1e6).toFixed(0)}M`;
  };

  return (
    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto py-3">
      <StatItem
        label="Bitcoin"
        value={formatPrice(marketData.btcPrice)}
        change={marketData.btcChange24h}
      />
      <Divider />
      <StatItem
        label="Ethereum"
        value={formatPrice(marketData.ethPrice)}
        change={marketData.ethChange24h}
      />
      <Divider />
      <FearGreedBar value={marketData.fearGreedIndex} label={marketData.fearGreedLabel} />
      <Divider />
      <StatItem
        label="Market Cap"
        value={formatMarketCap(marketData.totalMarketCap)}
      />
      <Divider />
      <StatItem
        label="24h Volume"
        value={formatVolume(marketData.totalVolume24h)}
      />
    </div>
  );
}
