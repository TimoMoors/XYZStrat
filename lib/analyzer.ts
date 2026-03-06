import Anthropic from '@anthropic-ai/sdk';
import type { DailyReport, RawCryptoData, RawNewsData, WatchlistCoin } from './types';
import { formatCryptoContext } from './fetchers/crypto';
import { formatNewsContext } from './fetchers/news';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert financial analyst and crypto market strategist. 
You analyze macro-economic conditions, traditional financial markets, and cryptocurrency markets to provide daily strategic intelligence.
Your analysis is data-driven, actionable, and concise. You understand narrative-driven investing in crypto.
Always respond with valid JSON matching the exact schema provided. Be specific with asset names, not generic.`;

function buildUserPrompt(cryptoContext: string, newsContext: string, watchlistSymbols: string[]): string {
  const today = new Date().toISOString().split('T')[0];
  const watchlistStr = watchlistSymbols.join(', ');
  return `Today is ${today}. Analyze the following market data and news, then provide a comprehensive daily market intelligence report.

${cryptoContext}

${newsContext}

IMPORTANT: The user's personal watchlist is: ${watchlistStr} (plus IREN/Iris Energy as a stock).
You MUST include a buy/sell/hold recommendation for EACH of these assets in the recommendations array.
Also include IREN (Iris Energy, NASDAQ mining stock) even without live price data.

Respond ONLY with a JSON object matching this exact schema (no markdown, no explanation, just the JSON):
{
  "macro": {
    "summary": "2-3 sentence macro overview",
    "keyDevelopments": ["development 1", "development 2", "development 3"],
    "positioningAdvice": "Specific actionable advice on macro positioning",
    "sentiment": "bullish|bearish|neutral"
  },
  "tradfi": {
    "summary": "2-3 sentence tradfi overview",
    "keyDevelopments": ["development 1", "development 2", "development 3"],
    "positioningAdvice": "Specific actionable advice for traditional market positioning",
    "sentiment": "bullish|bearish|neutral",
    "watchlist": [
      {
        "symbol": "TICKER",
        "name": "Full Name",
        "action": "buy|sell|hold",
        "reason": "Concise reason"
      }
    ]
  },
  "crypto": {
    "summary": "2-3 sentence crypto market overview",
    "keyDevelopments": ["development 1", "development 2", "development 3"],
    "positioningAdvice": "Specific actionable advice for crypto positioning",
    "sentiment": "bullish|bearish|neutral"
  },
  "narratives": [
    {
      "name": "Narrative Name",
      "description": "What this narrative is and why it matters now",
      "momentum": "rising|stable|fading",
      "strength": 7,
      "relatedAssets": ["ASSET1", "ASSET2", "ASSET3"]
    }
  ],
  "recommendations": [
    {
      "asset": "Asset Name or Ticker",
      "type": "crypto|stock",
      "action": "buy|sell|hold",
      "reason": "Specific reason based on current data and narrative",
      "timeframe": "short-term|medium-term|long-term",
      "confidence": 7,
      "currentPrice": "$XX,XXX",
      "targetPrice": "$XX,XXX"
    }
  ]
}

Requirements:
- Identify 4-6 active narratives in the market, ranked by momentum/strength
- Provide 6-10 specific recommendations (mix of crypto and stocks)
- Be specific — name exact coins, tickers, and reasons based on the data provided
- Confidence and strength scores should be integers 1-10
- Narratives must include at least 2-3 related assets each
- TradFi watchlist should have 3-5 entries`;
}

export async function analyzeMarkets(
  cryptoData: RawCryptoData,
  watchlistData: WatchlistCoin[],
  newsData: RawNewsData
): Promise<Omit<DailyReport, 'id' | 'generatedAt' | 'marketData' | 'watchlist'>> {
  const cryptoContext = formatCryptoContext(cryptoData, watchlistData);
  const newsContext = formatNewsContext(newsData);
  const watchlistSymbols = watchlistData.map((c) => c.symbol).concat(['IREN']);
  const userPrompt = buildUserPrompt(cryptoContext, newsContext, watchlistSymbols);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: SYSTEM_PROMPT,
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let parsed: Omit<DailyReport, 'id' | 'generatedAt' | 'marketData'>;
  try {
    const text = content.text.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${content.text.slice(0, 200)}`);
  }

  return parsed;
}
