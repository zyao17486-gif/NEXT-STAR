import { describe, expect, it } from "vitest";
import { createScoutAIResponseError } from "../src/services/scout-ai-error";

describe("Scout AI error mapping", () => {
  it.each([
    [429, "rate-limit", true],
    [401, "configuration", false],
    [403, "configuration", false],
    [504, "timeout", true],
    [502, "server", true],
    [400, "request", false],
  ] as const)("maps HTTP %i to %s", (status, code, retryable) => {
    const error = createScoutAIResponseError(status, "服务器消息");
    expect(error.code).toBe(code);
    expect(error.retryable).toBe(retryable);
    expect(error.status).toBe(status);
  });

  it("only exposes a server message for ordinary request errors", () => {
    expect(createScoutAIResponseError(400, "查询无效").message).toBe("查询无效");
    expect(createScoutAIResponseError(500, "内部堆栈").message).not.toContain("内部堆栈");
  });
});
