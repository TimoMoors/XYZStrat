import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { SectionAnalysis, TradFiAnalysis } from '@/lib/types';

interface SectionCardProps {
  title: string;
  icon: ReactNode;
  data: SectionAnalysis | TradFiAnalysis;
}

function SentimentBadge({ sentiment }: { sentiment: 'bullish' | 'bearish' | 'neutral' }) {
  const config = {
    bullish: {
      cls: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
      icon: <TrendingUp size={12} />,
      label: 'Bullish',
    },
    bearish: {
      cls: 'bg-red-900/60 text-red-300 border-red-700',
      icon: <TrendingDown size={12} />,
      label: 'Bearish',
    },
    neutral: {
      cls: 'bg-zinc-700/60 text-zinc-300 border-zinc-600',
      icon: <Minus size={12} />,
      label: 'Neutral',
    },
  };
  const { cls, icon, label } = config[sentiment];
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border', cls)}>
      {icon}
      {label}
    </span>
  );
}

function ActionBadge({ action }: { action: 'buy' | 'sell' | 'hold' }) {
  const config = {
    buy: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    sell: 'bg-red-900/60 text-red-300 border-red-700',
    hold: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  };
  return (
    <span className={clsx('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold border uppercase', config[action])}>
      {action}
    </span>
  );
}

export function SectionCard({ title, icon, data }: SectionCardProps) {
  const isTradFi = 'watchlist' in data;
  const tradFiData = isTradFi ? (data as TradFiAnalysis) : null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">{icon}</span>
          <h2 className="text-white font-semibold text-base">{title}</h2>
        </div>
        <SentimentBadge sentiment={data.sentiment} />
      </div>

      <p className="text-zinc-300 text-sm leading-relaxed">{data.summary}</p>

      <div>
        <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Key Developments</h3>
        <ul className="space-y-1.5">
          {data.keyDevelopments.map((dev, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
              <ChevronRight size={14} className="text-zinc-600 mt-0.5 shrink-0" />
              {dev}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
        <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Positioning Advice</h3>
        <p className="text-zinc-200 text-sm leading-relaxed">{data.positioningAdvice}</p>
      </div>

      {tradFiData && tradFiData.watchlist.length > 0 && (
        <div>
          <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Watchlist</h3>
          <div className="space-y-2">
            {tradFiData.watchlist.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <ActionBadge action={item.action} />
                <span className="text-white font-medium">{item.symbol}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400 text-xs flex-1">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
