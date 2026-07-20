import { describe, expect, it } from "vitest";
import { validateDnaVector, validateRequiredText } from "../server/validation.js";

describe("server input validation", () => {
  it("validates required and bounded text", () => {
    expect(validateRequiredText(undefined, 10)).toBe("required");
    expect(validateRequiredText("   ", 10)).toBe("required");
    expect(validateRequiredText("12345678901", 10)).toBe("too_long");
    expect(validateRequiredText(" valid ", 10)).toBeNull();
  });

  it("accepts an omitted or valid 13D vector", () => {
    expect(validateDnaVector(undefined)).toBe(true);
    expect(validateDnaVector(Array(13).fill(50))).toBe(true);
  });

  it("rejects malformed and out-of-range DNA vectors", () => {
    expect(validateDnaVector([1, 2])).toBe(false);
    expect(validateDnaVector([...Array(12).fill(50), 101])).toBe(false);
    expect(validateDnaVector([...Array(12).fill(50), Number.NaN])).toBe(false);
    expect(validateDnaVector("50")).toBe(false);
  });
});
