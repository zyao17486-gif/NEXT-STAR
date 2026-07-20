// Cloudflare Pages Function — lightweight, cache-backed visit trend counter.
// This is intentionally an approximate metric, not a strongly consistent database.

const CACHE_KEY = "https://nextstar-visitor-counter.local/count";
const SUPPORTED_METHODS = new Set(["GET", "POST", "OPTIONS"]);

function responseHeaders(origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export async function handleVisitorRequest({ request, cache, waitUntil }) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const headers = responseHeaders(origin && origin === url.origin ? origin : null);

  if (origin && origin !== url.origin) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers });
  }
  if (!SUPPORTED_METHODS.has(request.method)) {
    headers.Allow = "GET, POST, OPTIONS";
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const cachedResponse = await cache.match(CACHE_KEY);
  const cachedValue = cachedResponse ? Number.parseInt(await cachedResponse.text(), 10) : 0;
  let count = Number.isSafeInteger(cachedValue) && cachedValue >= 0 ? cachedValue : 0;

  if (request.method === "POST") {
    count += 1;
    const write = cache.put(
      CACHE_KEY,
      new Response(String(count), { headers: { "Cache-Control": "public, max-age=86400" } }),
    );
    waitUntil(write);
  }

  return new Response(JSON.stringify({ count, method: request.method }), { headers });
}

export async function onRequest(context) {
  return handleVisitorRequest({
    request: context.request,
    cache: caches.default,
    waitUntil: context.waitUntil.bind(context),
  });
}
