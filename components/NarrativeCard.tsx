import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import type { Narrative } from '@/lib/types';

interface NarrativeCardProps {
  narrative: Narrative;
  rank: number;
}

function StrengthBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-1.5 h-3 rounded-sm',
              i < value
                ? value >= 7
                  ? 'bg-emerald-500'
                  : value >= 4
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                : 'bg-zinc-700'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-400">{value}/10</span>
    </div>
  );
}

function MomentumBadge({ momentum }: { momentum: 'rising' | 'stable' | 'fading' }) {
  const config = {
    rising: {
      cls: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
      icon: <TrendingUp size={12} />,
      label: 'Rising',
    },
    stable: {
      cls: 'bg-blue-900/60 text-blue-300 border-blue-700',
      icon: <Minus size={12} />,
      label: 'Stable',
    },
    fading: {
      cls: 'bg-zinc-800 text-zinc-400 border-zinc-600',
      icon: <TrendingDown size={12} />,
      label: 'Fading',
    },
  };
  const { cls, icon, label } = config[momentum];
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border', cls)}>
      {icon}
      {label}
    </span>
  );
}

export function NarrativeCard({ narrative, rank }: NarrativeCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 text-sm font-bold w-5 text-right shrink-0">#{rank}</span>
          <h3 className="text-white font-semibold text-sm">{narrative.name}</h3>
        </div>
        <MomentumBadge momentum={narrative.momentum} />
      </div>

      <p className="text-zinc-400 text-xs leading-relaxed">{narrative.description}</p>

      <StrengthBar value={narrative.strength} />

      <div className="flex flex-wrap gap-1.5 mt-1">
        {narrative.relatedAssets.map((asset, i) => (
          <span
            key={i}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300 font-medium"
          >
            {asset}
          </span>
        ))}
      </div>
    </div>
  );
}
