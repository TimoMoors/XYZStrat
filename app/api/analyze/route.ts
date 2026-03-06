import { NextResponse } from 'next/server';
import { fetchCryptoData, fetchWatchlistData, extractMarketSummary } from '@/lib/fetchers/crypto';
import { fetchNewsData } from '@/lib/fetchers/news';
import { analyzeMarkets } from '@/lib/analyzer';
import { saveReport } from '@/lib/storage';
import type { DailyReport } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const analyzePassword = request.headers.get('x-analyze-password');
  const cronSecret = process.env.CRON_SECRET;
  const expectedPassword = process.env.ANALYZE_PASSWORD ?? 'geheim';

  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isManual = analyzePassword === expectedPassword;

  if (!isCron && !isManual) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  try {
    console.log('[analyze] Fetching market data...');
    const [cryptoData, watchlistData, newsData] = await Promise.all([
      fetchCryptoData(),
      fetchWatchlistData(),
      fetchNewsData(
        process.env.NEWSAPI_KEY ?? '',
        process.env.CRYPTOPANIC_API_KEY ?? ''
      ),
    ]);

    console.log('[analyze] Running Claude analysis...');
    const marketData = extractMarketSummary(cryptoData);
    const analysis = await analyzeMarkets(cryptoData, watchlistData, newsData);

    // Merge Claude's per-coin recommendations into watchlist
    const watchlistWithRecs = watchlistData.map((coin) => {
      const rec = analysis.recommendations.find(
        (r) => r.asset.toUpperCase() === coin.symbol || r.asset.toLowerCase() === coin.name.toLowerCase()
      );
      return rec
        ? { ...coin, recommendation: { action: rec.action, reason: rec.reason, confidence: rec.confidence } }
        : coin;
    });

    const report: DailyReport = {
      id: new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      marketData,
      ...analysis,
      watchlist: watchlistWithRecs,
    };

    console.log('[analyze] Saving report to KV...');
    await saveReport(report);

    return NextResponse.json({ success: true, generatedAt: report.generatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[analyze] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
