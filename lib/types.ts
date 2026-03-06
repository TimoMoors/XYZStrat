export type Sentiment = 'bullish' | 'bearish' | 'neutral';
export type Momentum = 'rising' | 'stable' | 'fading';
export type Action = 'buy' | 'sell' | 'hold';
export type AssetType = 'crypto' | 'stock';
export type Timeframe = 'short-term' | 'medium-term' | 'long-term';

export interface SectionAnalysis {
  summary: string;
  keyDevelopments: string[];
  positioningAdvice: string;
  sentiment: Sentiment;
}

export interface TradFiAnalysis extends SectionAnalysis {
  watchlist: {
    symbol: string;
    name: string;
    action: Action;
    reason: string;
  }[];
}

export interface TopMover {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export interface MarketData {
  btcPrice: number;
  btcChange24h: number;
  ethPrice: number;
  ethChange24h: number;
  totalMarketCap: number;
  totalVolume24h: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
  topMovers: TopMover[];
}

export interface Narrative {
  name: string;
  description: string;
  momentum: Momentum;
  strength: number;
  relatedAssets: string[];
}

export interface Recommendation {
  asset: string;
  type: AssetType;
  action: Action;
  reason: string;
  timeframe: Timeframe;
  confidence: number;
  currentPrice?: string;
  targetPrice?: string;
}

export interface DailyReport {
  id: string;
  generatedAt: string;
  marketData: MarketData;
  macro: SectionAnalysis;
  tradfi: TradFiAnalysis;
  crypto: SectionAnalysis;
  narratives: Narrative[];
  recommendations: Recommendation[];
  watchlist: WatchlistCoin[];
}

export interface WatchlistCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  sparkline: number[];
  recommendation?: {
    action: Action;
    reason: string;
    confidence: number;
  };
}

export interface RawCryptoData {
  prices: {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    total_volume: number;
  }[];
  globalData: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
  };
  fearGreed: {
    value: string;
    value_classification: string;
  };
}

export interface RawNewsData {
  macroHeadlines: string[];
  tradfiHeadlines: string[];
  cryptoHeadlines: string[];
}
