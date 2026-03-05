import { clsx } from 'clsx';
import type { Recommendation } from '@/lib/types';

interface RecommendationsTableProps {
  recommendations: Recommendation[];
}

function ActionBadge({ action }: { action: 'buy' | 'sell' | 'hold' }) {
  const config = {
    buy: 'bg-emerald-500/20 text-emerald-300 border-emerald-600',
    sell: 'bg-red-500/20 text-red-300 border-red-600',
    hold: 'bg-yellow-500/20 text-yellow-300 border-yellow-600',
  };
  return (
    <span className={clsx('inline-flex items-center rounded px-2 py-0.5 text-xs font-bold border uppercase tracking-wide', config[action])}>
      {action}
    </span>
  );
}

function TypeBadge({ type }: { type: 'crypto' | 'stock' }) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
      type === 'crypto' ? 'bg-violet-900/50 text-violet-300' : 'bg-sky-900/50 text-sky-300'
    )}>
      {type === 'crypto' ? '₿' : '📈'} {type}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 7 ? 'bg-emerald-500' : value >= 4 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="text-xs text-zinc-400 w-6">{value}/10</span>
    </div>
  );
}

export function RecommendationsTable({ recommendations }: RecommendationsTableProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">Asset</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold">Action</th>
              <th className="text-left px-4 py-3 font-semibold">Timeframe</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Current</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Target</th>
              <th className="text-left px-4 py-3 font-semibold">Confidence</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Reason</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec, i) => (
              <tr
                key={i}
                className={clsx(
                  'border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30',
                  rec.action === 'buy' && 'border-l-2 border-l-emerald-600',
                  rec.action === 'sell' && 'border-l-2 border-l-red-600',
                  rec.action === 'hold' && 'border-l-2 border-l-yellow-600'
                )}
              >
                <td className="px-4 py-3">
                  <span className="text-white font-semibold">{rec.asset}</span>
                </td>
                <td className="px-4 py-3">
                  <TypeBadge type={rec.type} />
                </td>
                <td className="px-4 py-3">
                  <ActionBadge action={rec.action} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-zinc-400 text-xs">{rec.timeframe}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-zinc-300 text-xs">{rec.currentPrice ?? '—'}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-zinc-300 text-xs">{rec.targetPrice ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <ConfidenceBar value={rec.confidence} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-zinc-400 text-xs max-w-xs line-clamp-2">{rec.reason}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
