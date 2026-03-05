import axios from 'axios';
import type { RawNewsData } from '../types';

const NEWSAPI_BASE = 'https://newsapi.org/v2';
const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/v1';

async function fetchNewsApiHeadlines(query: string, apiKey: string): Promise<string[]> {
  try {
    const res = await axios.get(`${NEWSAPI_BASE}/everything`, {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      headers: { 'X-Api-Key': apiKey },
      timeout: 10000,
    });
    return res.data.articles
      .map((a: { title: string; description: string | null }) =>
        a.description ? `${a.title} — ${a.description}` : a.title
      )
      .slice(0, 8);
  } catch {
    return [];
  }
}

async function fetchCryptoPanicNews(apiKey: string): Promise<string[]> {
  try {
    const res = await axios.get(`${CRYPTOPANIC_BASE}/posts/`, {
      params: {
        auth_token: apiKey,
        kind: 'news',
        filter: 'important',
        public: true,
      },
      timeout: 10000,
    });
    return res.data.results
      .slice(0, 12)
      .map((item: { title: string }) => item.title);
  } catch {
    return [];
  }
}

export async function fetchNewsData(
  newsApiKey: string,
  cryptoPanicKey: string
): Promise<RawNewsData> {
  const [macroHeadlines, tradfiHeadlines, cryptoHeadlines] = await Promise.all([
    fetchNewsApiHeadlines(
      'inflation OR "federal reserve" OR "interest rates" OR GDP OR "central bank" OR geopolitics OR recession',
      newsApiKey
    ),
    fetchNewsApiHeadlines(
      'stock market OR S&P500 OR NASDAQ OR "earnings" OR "bond yields" OR equities OR "hedge fund"',
      newsApiKey
    ),
    fetchCryptoPanicNews(cryptoPanicKey),
  ]);

  return { macroHeadlines, tradfiHeadlines, cryptoHeadlines };
}

export function formatNewsContext(data: RawNewsData): string {
  const sections: string[] = [];

  if (data.macroHeadlines.length > 0) {
    sections.push('=== MACRO NEWS (last 24h) ===');
    data.macroHeadlines.forEach((h, i) => sections.push(`${i + 1}. ${h}`));
  }

  if (data.tradfiHeadlines.length > 0) {
    sections.push('', '=== TRADFI / EQUITY MARKET NEWS (last 24h) ===');
    data.tradfiHeadlines.forEach((h, i) => sections.push(`${i + 1}. ${h}`));
  }

  if (data.cryptoHeadlines.length > 0) {
    sections.push('', '=== CRYPTO NEWS (last 24h) ===');
    data.cryptoHeadlines.forEach((h, i) => sections.push(`${i + 1}. ${h}`));
  }

  return sections.join('\n');
}
