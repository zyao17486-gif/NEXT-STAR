import { describe, expect, it } from "vitest";
import { cosineSimilarity, fuse13Dto5, generateDNA, jaccardSimilarity } from "../src/utils/dna-engine";

describe("DNA engine", () => {
  it("computes cosine similarity for identical and orthogonal vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("computes Jaccard tag similarity", () => {
    expect(jaccardSimilarity(["投射", "组织"], ["组织", "防守"])).toBeCloseTo(1 / 3);
    expect(jaccardSimilarity([], [])).toBe(1);
  });

  it("fuses 13 dimensions into six display groups", () => {
    const groups = fuse13Dto5({
      突破: 90, 篮下: 80, 背身: 70, 中投: 60, 三分: 80,
      传球: 90, 控运: 70, 内防: 60, 外防: 80, 抢断: 70, 盖帽: 50,
      身体: 85, 篮板: 75,
    });

    expect(groups).toHaveLength(6);
    expect(groups.find(group => group.key === "finish")?.value).toBe(80);
    expect(groups.find(group => group.key === "defense")?.value).toBe(65);
  });

  it("generates a bounded 13D baseline when no star is selected", () => {
    const result = generateDNA({ selectedPosition: "PG", selectedStarPlayerIds: [] });
    expect(result.vector).toHaveLength(13);
    expect(result.vector.every(value => value >= 0 && value <= 100)).toBe(true);
    expect(result.selectedPositionLabel).toBeTruthy();
  });
});
