# Forge Proxy Worker

This is a Cloudflare Worker that acts as a secure proxy for the Forge CLI's AI interpretation feature. It keeps the Anthropic API key secure on the server and implements rate limiting.

## Setup Instructions

### 1. Install Cloudflare Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespace for Rate Limiting

```bash
wrangler kv:namespace create "RATE_LIMIT"
```

Copy the ID from the output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

### 4. Set API Key Secret

```bash
wrangler secret put ANTHROPIC_API_KEY
```

Paste your Anthropic API key when prompted.

### 5. Deploy

```bash
cd worker
npm install
wrangler deploy
```

The deployment will output a URL like: `https://forge-proxy.YOUR_SUBDOMAIN.workers.dev`

### 6. Update the CLI

Copy your worker URL and update it in `packages/core/src/interpretNaturalLanguage.ts`:

```typescript
const PROXY_URL =
  process.env.FORGE_PROXY_URL || "https://forge-proxy.YOUR_SUBDOMAIN.workers.dev";
```

Then rebuild and republish:
```bash
pnpm build
npm publish
```

## Rate Limiting

- **10 requests per day per IP address**
- Resets after 24 hours
- Rate limit data stored in Cloudflare KV

To modify limits, edit `RATE_LIMIT` constants in `src/index.js`:
```javascript
const RATE_LIMIT = {
  MAX_REQUESTS_PER_DAY: 10,
  WINDOW_MS: 24 * 60 * 60 * 1000,
};
```

## Monitoring

View logs in real-time:
```bash
wrangler tail
```

View analytics in [Cloudflare Dashboard](https://dash.cloudflare.com/)

## Cost

- Cloudflare Workers Free Tier: **100,000 requests/day**
- Cloudflare KV Free Tier: **100,000 reads/day**
- Anthropic Haiku: **~$0.00025 per request** (1024 tokens)

With 10 req/day limit per IP, you can support **10,000 unique users/day** on free tier.

At full capacity: ~$2.50/day in Anthropic costs.

## Security

- ✅ API key stored as encrypted secret
- ✅ CORS enabled for browser access
- ✅ Rate limiting per IP
- ✅ Input validation
- ✅ Error handling without leaking secrets

## Development

Test locally:
```bash
npm run dev
```

This starts a local server at `http://localhost:8787`

Test with curl:
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"description": "I want a React app with FastAPI backend"}'
```
