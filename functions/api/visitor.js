// Cloudflare Pages Function — visitor counter
// GET  → returns current count
// POST → bumps count + returns new count

let count = 0;

export async function onRequest(context) {
  const { request } = context;

  // CORS headers for cross-origin access
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  if (request.method === "POST") {
    count++;
    return new Response(JSON.stringify({ count, method: "POST" }), { headers });
  }

  // GET
  return new Response(JSON.stringify({ count, method: "GET" }), { headers });
}
