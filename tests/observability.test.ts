import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequestId, logEvent } from "../server/observability.js";

afterEach(() => vi.restoreAllMocks());

describe("observability", () => {
  it("preserves a valid caller request id", () => {
    expect(createRequestId("client-request_123")).toBe("client-request_123");
  });

  it("replaces malformed request ids", () => {
    expect(createRequestId("bad id\nheader")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("writes machine-readable structured events", () => {
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    logEvent("info", "test_event", { requestId: "request-123" });
    const event = JSON.parse(String(output.mock.calls[0][0]));
    expect(event).toMatchObject({ level: "info", event: "test_event", requestId: "request-123" });
    expect(event.timestamp).toBeTypeOf("string");
  });
});
