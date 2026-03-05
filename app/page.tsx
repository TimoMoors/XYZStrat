import { Suspense } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Globe, BarChart2, Bitcoin, Zap, Clock } from 'lucide-react';
import { getLatestReport } from '@/lib/storage';
import { MarketBar } from '@/components/MarketBar';
import { SectionCard } from '@/components/SectionCard';
import { NarrativeCard } from '@/components/NarrativeCard';
import { RecommendationsTable } from '@/components/RecommendationsTable';
import { TopMovers } from '@/components/TopMovers';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {format(generatedAt, 'EEEE, MMMM d')}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={12} className="text-zinc-500" />
            <span className="text-zinc-500 text-xs">
              Updated {formatDistanceToNow(generatedAt, { addSuffix: true })}
              {' · '}{format(generatedAt, 'HH:mm')} UTC
            </span>
          </div>
        </div>
        <DashboardClient initialReport={report} />
      </div>

      {/* Market Bar */}
      <MarketBar marketData={report.marketData} />

      {/* Market Overview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <SectionCard
            title="Macro"
            icon={<Globe size={16} />}
            data={report.macro}
          />
          <SectionCard
            title="TradFi"
            icon={<BarChart2 size={16} />}
            data={report.tradfi}
          />
          <SectionCard
            title="Crypto"
            icon={<Bitcoin size={16} />}
            data={report.crypto}
          />
        </div>
        <div>
          <TopMovers movers={report.marketData.topMovers} />
        </div>
      </div>

      {/* Narratives */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-yellow-400" />
          <h2 className="text-white font-semibold text-lg">Active Narratives</h2>
          <span className="text-zinc-500 text-xs ml-1">ranked by momentum &amp; strength</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {report.narratives.map((narrative, i) => (
            <NarrativeCard key={i} narrative={narrative} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={16} className="text-blue-400" />
          <h2 className="text-white font-semibold text-lg">Buy / Sell Recommendations</h2>
        </div>
        <RecommendationsTable recommendations={report.recommendations} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Top nav strip */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-white font-bold tracking-tight">XYZStrat</span>
          </div>
          <span className="text-zinc-600 text-sm">Daily Market Intelligence</span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-zinc-800 rounded w-48" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-zinc-800 rounded-lg w-32" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-zinc-900 rounded-xl border border-zinc-800" />
        ))}
      </div>
    </div>
  );
}
