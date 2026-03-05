import { NextResponse } from 'next/server';
import { fetchCryptoData, extractMarketSummary } from '@/lib/fetchers/crypto';
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
    const [cryptoData, newsData] = await Promise.all([
      fetchCryptoData(),
      fetchNewsData(
        process.env.NEWSAPI_KEY ?? '',
        process.env.CRYPTOPANIC_API_KEY ?? ''
      ),
    ]);

    console.log('[analyze] Running Claude analysis...');
    const marketData = extractMarketSummary(cryptoData);
    const analysis = await analyzeMarkets(cryptoData, newsData);

    const report: DailyReport = {
      id: new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      marketData,
      ...analysis,
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
