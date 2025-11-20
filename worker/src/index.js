/**
 * Forge Proxy Worker
 * Proxies requests to Anthropic API with rate limiting
 */

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS_PER_DAY: 10,
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
};

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Get client identifier (IP address)
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `ratelimit:${clientIP}`;

      // Check rate limit
      const isRateLimited = await checkRateLimit(env.RATE_LIMIT, rateLimitKey);
      if (isRateLimited) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded. Maximum 10 requests per day.'
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Parse request body
      const body = await request.json();
      const { description } = body;

      if (!description || typeof description !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid request: description required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Call Anthropic API
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: `You are an assistant that converts project descriptions into structured configuration for a scaffolding tool.

Only respond with valid JSON following this schema:

{
  "projectName": string,
  "frontend": "react" | "next" | "svelte" | "sveltekit" | "none",
  "backend": "fastapi" | "express" | "typescript-prisma" | "golang" | "rust" | "java" | "none",
  "database": "postgres" | "sqlite" | "none",
  "useDocker": boolean
}

Frontend options:
- "react": React with Vite (react-vite-kitchen-sink)
- "next": Next.js 14 with TypeScript and Tailwind CSS
- "svelte": Svelte with Vite and TypeScript
- "sveltekit": SvelteKit framework with TypeScript
- "none": No frontend

Backend options:
- "fastapi": Python FastAPI with PostgreSQL
- "express": Express.js with TypeScript
- "typescript-prisma": Express.js with TypeScript and Prisma ORM
- "golang": Go with Gorilla Mux and PostgreSQL
- "rust": Rust with Actix Web and PostgreSQL
- "java": Java Spring Boot with Spring Data JPA
- "none": No backend

If something is unclear, make a reasonable assumption.

Never include commentary, just return JSON.`,
          messages: [
            {
              role: 'user',
              content: description,
            },
          ],
        }),
      });

      if (!anthropicResponse.ok) {
        throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
      }

      const result = await anthropicResponse.json();

      // Increment rate limit counter
      await incrementRateLimit(env.RATE_LIMIT, rateLimitKey);

      // Return the response
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
};

/**
 * Check if client has exceeded rate limit
 */
async function checkRateLimit(kv, key) {
  const data = await kv.get(key);

  if (!data) {
    return false; // No previous requests
  }

  const { count, timestamp } = JSON.parse(data);
  const now = Date.now();

  // Check if window has expired
  if (now - timestamp > RATE_LIMIT.WINDOW_MS) {
    return false; // Window expired, allow request
  }

  // Check if limit exceeded
  return count >= RATE_LIMIT.MAX_REQUESTS_PER_DAY;
}

/**
 * Increment rate limit counter
 */
async function incrementRateLimit(kv, key) {
  const now = Date.now();
  const data = await kv.get(key);

  let count = 1;
  let timestamp = now;

  if (data) {
    const parsed = JSON.parse(data);

    // If window hasn't expired, increment count
    if (now - parsed.timestamp <= RATE_LIMIT.WINDOW_MS) {
      count = parsed.count + 1;
      timestamp = parsed.timestamp;
    }
  }

  // Store with 25 hour expiration (slightly longer than window)
  await kv.put(
    key,
    JSON.stringify({ count, timestamp }),
    { expirationTtl: 25 * 60 * 60 }
  );
}
