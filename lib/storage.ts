import type { DailyReport } from './types';

const MAX_HISTORY = 30;

function isUpstashConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return (
    !!url &&
    !!token &&
    !url.includes('your-redis-url') &&
    token !== 'your_token_here'
  );
}

// --- Upstash Redis (production) ---

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return Redis.fromEnv();
}

async function saveToRedis(report: DailyReport): Promise<void> {
  const redis = await getRedis();
  await redis.set('latest-report', report);

  const history = await getHistoryFromRedis();
  const updated = [
    { id: report.id, generatedAt: report.generatedAt },
    ...history.filter((h) => h.id !== report.id),
  ].slice(0, MAX_HISTORY);
  await redis.set('report-history', updated);
  await redis.set(`report:${report.id}`, report, { ex: 60 * 60 * 24 * 30 });
}

async function getLatestFromRedis(): Promise<DailyReport | null> {
  const redis = await getRedis();
  return redis.get<DailyReport>('latest-report');
}

async function getHistoryFromRedis(): Promise<{ id: string; generatedAt: string }[]> {
  const redis = await getRedis();
  const history = await redis.get<{ id: string; generatedAt: string }[]>('report-history');
  return history ?? [];
}

// --- Local file fallback (development) ---

const LOCAL_FILE_PATH = '/tmp/xyzstrat-latest-report.json';

async function saveToFile(report: DailyReport): Promise<void> {
  const { writeFileSync } = await import('fs');
  writeFileSync(LOCAL_FILE_PATH, JSON.stringify(report, null, 2), 'utf-8');
}

async function getLatestFromFile(): Promise<DailyReport | null> {
  try {
    const { readFileSync, existsSync } = await import('fs');
    if (!existsSync(LOCAL_FILE_PATH)) return null;
    const raw = readFileSync(LOCAL_FILE_PATH, 'utf-8');
    return JSON.parse(raw) as DailyReport;
  } catch {
    return null;
  }
}

// --- Public API ---

export async function saveReport(report: DailyReport): Promise<void> {
  if (isUpstashConfigured()) {
    await saveToRedis(report);
  } else {
    console.log('[storage] Upstash not configured — using local file fallback');
    await saveToFile(report);
  }
}

export async function getLatestReport(): Promise<DailyReport | null> {
  if (isUpstashConfigured()) {
    return getLatestFromRedis();
  }
  return getLatestFromFile();
}

export async function getReportHistory(): Promise<{ id: string; generatedAt: string }[]> {
  if (isUpstashConfigured()) {
    return getHistoryFromRedis();
  }
  const report = await getLatestFromFile();
  if (!report) return [];
  return [{ id: report.id, generatedAt: report.generatedAt }];
}

export async function getReportById(id: string): Promise<DailyReport | null> {
  if (isUpstashConfigured()) {
    const redis = await getRedis();
    return redis.get<DailyReport>(`report:${id}`);
  }
  return getLatestFromFile();
}
