# XYZStrat — Daily Market Intelligence

AI-powered daily analysis of crypto, macro, and TradFi markets. Every morning at 6am UTC a cron job fetches live data, runs it through Claude, and stores a structured report. Open the dashboard at 8am and your briefing is ready.

## What it does

- **Macro analysis** — headlines on inflation, central banks, geopolitics + positioning advice
- **TradFi analysis** — equity market developments + watchlist with buy/sell/hold calls
- **Crypto analysis** — market overview using live CoinGecko data + positioning advice
- **Narrative tracker** — identifies active market narratives, ranked by momentum and strength
- **Buy/Sell recommendations** — specific assets (crypto + stocks) with confidence scores, timeframes, and price targets

## Tech stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** — dark financial dashboard UI
- **Anthropic Claude** (`claude-3-5-sonnet-20241022`) — market analysis
- **Upstash Redis** — stores the daily report
- **Vercel** — hosting + cron jobs (runs at 6am UTC daily)

## Data sources

| Source | Data | API key required |
|--------|------|-----------------|
| CoinGecko | Crypto prices, top movers, market cap | No |
| Alternative.me | Fear & Greed Index | No |
| NewsAPI.org | Macro + TradFi news headlines | Yes (free tier) |
| CryptoPanic | Crypto-specific news | Yes (free tier) |

## Getting started locally

### 1. Clone and install
```bash
git clone <repo-url> xyzstrat
cd xyzstrat
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
- `ANTHROPIC_API_KEY` — get at [console.anthropic.com](https://console.anthropic.com)
- `NEWSAPI_KEY` — get at [newsapi.org](https://newsapi.org) (free)
- `CRYPTOPANIC_API_KEY` — get at [cryptopanic.com/developers/api](https://cryptopanic.com/developers/api) (free)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — create a free Redis at [upstash.com](https://upstash.com)
- `CRON_SECRET` — any random string (e.g. `openssl rand -hex 32`)

### 3. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first load you'll see an empty state — click **Run Analysis** to generate the first report.

## Deploying to Vercel

1. Push to GitHub and import the repo in [vercel.com](https://vercel.com)
2. Add the **Upstash Redis** integration from Vercel Marketplace — it auto-injects the env vars
3. Add the remaining env vars in Vercel project settings:
   - `ANTHROPIC_API_KEY`
   - `NEWSAPI_KEY`
   - `CRYPTOPANIC_API_KEY`
   - `CRON_SECRET`
4. Deploy — the cron job in `vercel.json` runs at `0 6 * * *` (6am UTC = 8am CET/CEST)

## Manual refresh

Click the **Run Analysis** button on the dashboard to trigger a fresh report at any time. The analysis takes ~30-60 seconds (API calls + Claude inference).

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/report` | Fetch the latest stored report |
| `POST` | `/api/analyze` | Trigger a new analysis run |
| `GET` | `/api/cron` | Cron endpoint (called by Vercel, requires `CRON_SECRET`) |
