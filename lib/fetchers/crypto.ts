import axios from 'axios';
import type { RawCryptoData, WatchlistCoin } from '../types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_URL = 'https://api.alternative.me/fng/?limit=1';

// CoinGecko IDs for the watchlist coins
// IREN (Iris Energy) is a NASDAQ stock — included in Claude prompt but no on-chain price data
export const WATCHLIST_IDS = [
  { id: 'hyperliquid', symbol: 'HYPE', name: 'Hyperliquid' },
  { id: 'bittensor', symbol: 'TAO', name: 'Bittensor' },
  { id: 'pump-fun', symbol: 'PUMP', name: 'Pump' },
  { id: 'zcash', symbol: 'ZEC', name: 'Zcash' },
  { id: 'sui', symbol: 'SUI', name: 'Sui' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'useless-token', symbol: 'USELESS', name: 'Useless' },
  { id: 'fartcoin', symbol: 'FARTCOIN', name: 'Fartcoin' },
  { id: 'render-token', symbol: 'RENDER', name: 'Render' },
];

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 8000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = axios.isAxiosError(err) && err.response?.status === 429;
      if (is429 && attempt < retries) {
        console.log(`[crypto] Rate limited (429). Waiting ${delayMs / 1000}s before retry ${attempt}/${retries - 1}...`);
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export async function fetchCryptoData(): Promise<RawCryptoData> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = apiKey ? { 'x-cg-demo-api-key': apiKey } : {};

  const [pricesRes, globalRes, fearGreedRes] = await Promise.all([
    fetchWithRetry(() =>
      axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
        headers,
        timeout: 15000,
      })
    ),
    fetchWithRetry(() => axios.get(`${COINGECKO_BASE}/global`, { headers, timeout: 15000 })),
    axios.get(FEAR_GREED_URL, { timeout: 10000 }),
  ]);

  const prices = pricesRes.data.map((coin: CoinMarketData) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    current_price: coin.current_price,
    price_change_percentage_24h: coin.price_change_percentage_24h,
    market_cap: coin.market_cap,
    total_volume: coin.total_volume,
  }));

  const fearGreedData = fearGreedRes.data.data[0];

  return {
    prices,
    globalData: globalRes.data.data,
    fearGreed: {
      value: fearGreedData.value,
      value_classification: fearGreedData.value_classification,
    },
  };
}

export async function fetchWatchlistData(): Promise<WatchlistCoin[]> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = apiKey ? { 'x-cg-demo-api-key': apiKey } : {};
  const ids = WATCHLIST_IDS.map((c) => c.id).join(',');

  let data: CoinMarketData[] = [];
  try {
    const res = await fetchWithRetry(() =>
      axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids,
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h,7d',
        },
        headers,
        timeout: 20000,
      })
    );
    data = res.data;
  } catch (err) {
    console.warn('[watchlist] Failed to fetch watchlist data:', err);
    return [];
  }

  return WATCHLIST_IDS.flatMap(({ id, symbol, name }) => {
    const coin = data.find((c) => c.id === id);
    if (!coin) {
      console.warn(`[watchlist] Coin not found: ${id}`);
      return [];
    }
    const rawSparkline = coin.sparkline_in_7d?.price ?? [];
    // Downsample to ~48 points for clean sparklines
    const sparkline = rawSparkline.filter((_: number, i: number) => i % 4 === 0);
    return [{
      id,
      symbol,
      name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h ?? 0,
      change7d: coin.price_change_percentage_7d_in_currency ?? 0,
      marketCap: coin.market_cap ?? 0,
      sparkline,
    }];
  });
}

export function extractMarketSummary(data: RawCryptoData) {
  const btc = data.prices.find((p) => p.id === 'bitcoin');
  const eth = data.prices.find((p) => p.id === 'ethereum');

  const topMovers = [...data.prices]
    .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
    .slice(0, 5)
    .map((p) => ({
      symbol: p.symbol,
      name: p.name,
      price: p.current_price,
      change24h: p.price_change_percentage_24h,
    }));

  return {
    btcPrice: btc?.current_price ?? 0,
    btcChange24h: btc?.price_change_percentage_24h ?? 0,
    ethPrice: eth?.current_price ?? 0,
    ethChange24h: eth?.price_change_percentage_24h ?? 0,
    totalMarketCap: data.globalData.total_market_cap.usd,
    totalVolume24h: data.globalData.total_volume.usd,
    fearGreedIndex: parseInt(data.fearGreed.value, 10),
    fearGreedLabel: data.fearGreed.value_classification,
    topMovers,
  };
}

export function formatCryptoContext(data: RawCryptoData, watchlist: WatchlistCoin[]): string {
  const top10 = data.prices.slice(0, 10);
  const lines = top10.map(
    (p) =>
      `${p.name} (${p.symbol}): $${p.current_price.toLocaleString()} | 24h: ${p.price_change_percentage_24h > 0 ? '+' : ''}${p.price_change_percentage_24h.toFixed(2)}%`
  );

  const watchlistLines = watchlist.map(
    (c) =>
      `${c.name} (${c.symbol}): $${c.price.toLocaleString()} | 24h: ${c.change24h > 0 ? '+' : ''}${c.change24h.toFixed(2)}% | 7d: ${c.change7d > 0 ? '+' : ''}${c.change7d.toFixed(2)}%`
  );

  // IREN is a stock — include as a note for Claude
  const irenNote = 'IREN (Iris Energy, NASDAQ) — Bitcoin mining stock, include in analysis even though no on-chain price data is available here.';

  return [
    '=== CRYPTO MARKET DATA ===',
    `Total Market Cap: $${(data.globalData.total_market_cap.usd / 1e12).toFixed(2)}T`,
    `24h Volume: $${(data.globalData.total_volume.usd / 1e9).toFixed(1)}B`,
    `Fear & Greed Index: ${data.fearGreed.value} (${data.fearGreed.value_classification})`,
    '',
    'Top 10 by Market Cap:',
    ...lines,
    '',
    '=== PERSONAL WATCHLIST (provide specific analysis for each) ===',
    ...watchlistLines,
    irenNote,
  ].join('\n');
}
