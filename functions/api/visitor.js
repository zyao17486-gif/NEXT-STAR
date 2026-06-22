// Cloudflare Pages Function — persistent visitor counter via Cache API
// GET  → returns { count, method: "GET" }
// POST → bumps count, returns { count, method: "POST" }
// Uses Cache API to persist across requests; resets only on full cache purge.

const CACHE_KEY = "https://nextstar-visitor-counter.local/count";

export async function onRequest(context) {
  const { request } = context;
  const cache = caches.default; // Cloudflare's default cache

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  // Read current count from cache
  let response = await cache.match(CACHE_KEY);
  let count = 0;
  if (response) {
    const text = await response.text();
    count = parseInt(text, 10) || 0;
  }

  if (request.method === "POST") {
    count++;
    // Persist to cache (24h TTL — count stays alive as long as site has traffic)
    const cached = new Response(String(count), {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
    // Cloudflare Pages Functions can use waitUntil for background writes
    context.waitUntil(cache.put(CACHE_KEY, cached.clone()));
  }

  return new Response(JSON.stringify({ count, method: request.method }), { headers });
}
