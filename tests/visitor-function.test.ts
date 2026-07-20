import { describe, expect, it } from "vitest";
import { handleVisitorRequest } from "../functions/api/visitor.js";

function createCache(initial = 0) {
  let value = initial;
  return {
    async match() {
      return new Response(String(value));
    },
    async put(_key: string, response: Response) {
      value = Number.parseInt(await response.text(), 10);
    },
    value: () => value,
  };
}

async function call(method: string, origin?: string) {
  const cache = createCache(4);
  const pending: Promise<unknown>[] = [];
  const request = new Request("https://next-star-5s9.pages.dev/api/visitor", {
    method,
    headers: origin ? { Origin: origin } : undefined,
  });
  const response = await handleVisitorRequest({
    request,
    cache,
    waitUntil: (promise) => pending.push(promise),
  });
  await Promise.all(pending);
  return { response, cache };
}

describe("visitor edge function", () => {
  it("increments the trend counter on POST", async () => {
    const { response, cache } = await call("POST");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 5, method: "POST" });
    expect(cache.value()).toBe(5);
  });

  it("allows same-origin preflight", async () => {
    const { response } = await call("OPTIONS", "https://next-star-5s9.pages.dev");
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://next-star-5s9.pages.dev");
  });

  it("rejects cross-origin writes", async () => {
    const { response, cache } = await call("POST", "https://evil.example");
    expect(response.status).toBe(403);
    expect(cache.value()).toBe(4);
  });

  it("rejects unsupported methods", async () => {
    const { response } = await call("DELETE");
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, POST, OPTIONS");
  });
});
