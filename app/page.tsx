import { Suspense } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Globe, BarChart2, Bitcoin, Zap, Clock, Star, TableProperties } from 'lucide-react';
import { getLatestReport } from '@/lib/storage';
import { MarketBar } from '@/components/MarketBar';
import { SectionCard } from '@/components/SectionCard';
import { NarrativeCard } from '@/components/NarrativeCard';
import { RecommendationsTable } from '@/components/RecommendationsTable';
import { TopMovers } from '@/components/TopMovers';
import { WatchlistSection } from '@/components/WatchlistSection';
import { FearGreedGauge } from '@/components/FearGreedGauge';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="shrink-0">{icon}</span>
      <h2 className="text-white font-semibold text-base">{title}</h2>
      {subtitle && <span className="text-zinc-600 text-xs">{subtitle}</span>}
      <div className="flex-1 h-px bg-zinc-800 ml-1" />
    </div>
  );
}

async function DashboardContent() {
  const report = await getLatestReport();

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md">
          <Zap size={32} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">No report yet</h2>
          <p className="text-zinc-400 text-sm mb-6">
            No analysis has been run yet. Click the button below to generate your first daily market intelligence report.
          </p>
          <DashboardClient initialReport={null} />
        </div>
      </div>
    );
  }

  const generatedAt = new Date(report.generatedAt);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Daily Market Intelligence</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {format(generatedAt, 'EEEE, MMMM d')}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock size={11} className="text-zinc-600" />
            <span className="text-zinc-600 text-xs">
              Last updated {formatDistanceToNow(generatedAt, { addSuffix: true })}
              <span className="text-zinc-700 mx-1.5">·</span>
              {format(generatedAt, 'HH:mm')} UTC
            </span>
          </div>
        </div>
        <DashboardClient initialReport={report} />
      </div>

      {/* Market Stats Bar */}
      <MarketBar marketData={report.marketData} />

      {/* Market Overview */}
      <div>
        <SectionHeader
          icon={<Globe size={15} className="text-zinc-400" />}
          title="Market Overview"
        />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <SectionCard title="Macro" icon={<Globe size={15} />} data={report.macro} />
            <SectionCard title="TradFi" icon={<BarChart2 size={15} />} data={report.tradfi} />
            <SectionCard title="Crypto" icon={<Bitcoin size={15} />} data={report.crypto} />
          </div>
          <div className="flex flex-col gap-4">
            <TopMovers movers={report.marketData.topMovers} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-1">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Fear & Greed</span>
              <FearGreedGauge value={report.marketData.fearGreedIndex} label={report.marketData.fearGreedLabel} />
            </div>
          </div>
        </div>
      </div>

      {/* Narratives */}
      <div>
        <SectionHeader
          icon={<Zap size={15} className="text-yellow-400" />}
          title="Active Narratives"
          subtitle="ranked by momentum & strength"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {report.narratives.map((narrative, i) => (
            <NarrativeCard key={i} narrative={narrative} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Watchlist */}
      {report.watchlist && report.watchlist.length > 0 && (
        <div>
          <SectionHeader
            icon={<Star size={15} className="text-yellow-400" />}
            title="Watchlist"
            subtitle="7d sparklines · prices at time of analysis"
          />
          <WatchlistSection coins={report.watchlist} />
        </div>
      )}

      {/* Recommendations */}
      <div>
        <SectionHeader
          icon={<TableProperties size={15} className="text-blue-400" />}
          title="Buy / Sell Recommendations"
        />
        <RecommendationsTable recommendations={report.recommendations} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Top nav */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-13 flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-white font-bold tracking-tight">XYZStrat</span>
          </div>
          <div className="w-px h-4 bg-zinc-700" />
          <span className="text-zinc-500 text-sm">Daily Market Intelligence</span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-32" />
        <div className="h-8 bg-zinc-800 rounded w-56" />
      </div>
      <div className="h-14 bg-zinc-900 rounded-xl border border-zinc-800" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-zinc-900 rounded-xl border border-zinc-800" />
        ))}
      </div>
    </div>
  );
}
