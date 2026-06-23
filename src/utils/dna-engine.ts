// Basketball DNA Engine V3 — 13D Vectors + Body Layer + Tag Layer
// 50% 13D cosine similarity + 25% position match + 25% body match
// polishedType removed — isPolished now anchored in prospect DB tags

import type { StarPlayer } from "../data/star-players";
import { getAllStarPlayers, POSITION_LABELS, ATTR_13D_KEYS, ATTR_13D_LABELS, starPlayerTo13DVector } from "../data/star-players";

// ── Types ────────────────────────────────────────────────────────────────

export interface DNAInput {
  selectedPosition: string;
  selectedStarPlayerIds: string[];
}

export interface DNADimension {
  label: string;
  value: number;
}

export interface DNAResult {
  vector: number[];
  dimensions: Record<string, DNADimension>;
  rawAverage: number[];
  description: string;
  positionProfile: string;
  selectedPositionLabel: string;
}

export interface ProspectMatch {
  id: number;
  name: string;
  position: string;
  positions: string[];
  team: string;
  height: string;
  heightInches: number;
  weight: string;
  wingspan: string;
  matchScore: number;
  attributes: Record<string, number>;
  skills_13d?: string[];
  style?: string[];
  tags: string[];
  profile_text: string;
  img: string;
  imgHero: string;
  // V3 body fields
  heightCm?: number;
  weightKg?: number;
  wingspanCm?: number;
  // V3 polish
  isPolished?: boolean;
  polishedReason?: string;
  // Legacy
  bbiq?: number;
  motor?: number;
  physicalScore?: number;
  age?: number;
  productionScore?: number;
  combine?: Record<string, unknown>;
  nameCn?: string;
}

// ── 13D Position Archetype Baselines ──────────────────────────────────────
// When user selects position but no star players, use these baselines
// Index order: 身体/突破/篮下/背身/中投/三分/传球/控运/内防/外防/抢断/盖帽/篮板

export const POSITION_BASELINES: Record<string, number[]> = {
  PG: [65, 75, 50, 20, 70, 80, 85, 85, 30, 65, 65, 20, 35],
  SG: [75, 80, 72, 35, 80, 82, 65, 78, 40, 72, 60, 35, 42],
  SF: [80, 78, 75, 55, 78, 78, 68, 72, 55, 78, 62, 50, 58],
  PF: [82, 62, 82, 72, 65, 55, 62, 55, 82, 60, 50, 75, 82],
  C:  [82, 35, 88, 82, 55, 35, 52, 35, 92, 40, 35, 88, 90],
};

// ── Cosine Similarity (13D) ───────────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Position Matching ─────────────────────────────────────────────────────

const POSITION_ADJACENCY: Record<string, string[]> = {
  PG: ["PG", "SG"],
  SG: ["PG", "SG", "SF"],
  SF: ["SG", "SF", "PF"],
  PF: ["SF", "PF", "C"],
  C:  ["PF", "C"],
};

function positionMatchScore(prospectPositions: string[], userPosition: string): number {
  if (prospectPositions.includes(userPosition)) return 1.0;        // exact match
  const adj = POSITION_ADJACENCY[userPosition] || [];
  if (prospectPositions.some(p => adj.includes(p))) return 0.7;   // adjacent position
  // Check distance
  const posOrder = ["PG", "SG", "SF", "PF", "C"];
  const userIdx = posOrder.indexOf(userPosition);
  for (const pp of prospectPositions) {
    const pIdx = posOrder.indexOf(pp);
    if (pIdx >= 0 && Math.abs(userIdx - pIdx) <= 2) return 0.4;   // one position away
  }
  return 0.0;  // too far apart
}

// ── Body Matching ─────────────────────────────────────────────────────────

function bodyMatchScore(
  prospectH: number, prospectW: number, prospectWS: number,
  starH: number, starW: number, starWS: number
): number {
  const heightDiff = Math.abs(prospectH - starH);
  const weightDiff = Math.abs(prospectW - starW);
  const wsDiff = Math.abs(prospectWS - starWS);

  // Height score (0-1)
  let hScore = 1.0;
  if (heightDiff <= 3) hScore = 1.0;
  else if (heightDiff <= 8) hScore = 0.7;
  else if (heightDiff <= 15) hScore = 0.3;
  else hScore = 0.0;

  // Weight score (0-1)
  let wScore = 1.0;
  if (weightDiff <= 5) wScore = 1.0;
  else if (weightDiff <= 15) wScore = 0.7;
  else if (weightDiff <= 25) wScore = 0.3;
  else wScore = 0.0;

  // Wingspan score (0-1)
  let wsScore = 1.0;
  if (wsDiff <= 5) wsScore = 1.0;
  else if (wsDiff <= 12) wsScore = 0.7;
  else if (wsDiff <= 20) wsScore = 0.3;
  else wsScore = 0.0;

  return (hScore * 0.5 + wScore * 0.25 + wsScore * 0.25);
}

// ── Jaccard Tag Matching ──────────────────────────────────────────────────

export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const item of setA) { if (setB.has(item)) intersection++; }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ── Vector Utilities ──────────────────────────────────────────────────────

function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) return ATTR_13D_KEYS.map(() => 50);
  const dim = vectors[0].length;
  const sum = vectors.reduce((acc, v) => acc.map((x, i) => x + v[i]), new Array(dim).fill(0));
  return sum.map(x => Math.round(x / vectors.length));
}

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ── Description Generation ────────────────────────────────────────────────

function generateDescription(dna: number[]): string {
  const labeled = ATTR_13D_KEYS.map((k, i) => ({ key: k, label: ATTR_13D_LABELS[k], value: dna[i] }));
  labeled.sort((a, b) => b.value - a.value);
  const top = labeled[0];

  const profiles: Record<string, string[]> = {
    "身体天赋": [
      "你相信身体天赋是篮球的基石——爆发力、速度、力量，这些无法被教会。",
      "飞天遁地的运动能力最让你热血沸腾——弹跳和速度是你的第一标尺。",
    ],
    "持球突破": [
      "你欣赏那些能用第一步撕裂防守的突破高手——面框冲击力是终极武器。",
      "突破是你评判球员的第一标准——那种不可阻挡的冲击力让你着迷。",
    ],
    "篮下终结": [
      "篮下的统治力是你最看重的——油漆区才是比赛真正发生的地方。",
      "你相信篮筐附近的终结效率决定比赛走向。",
    ],
    "背身进攻": [
      "你钟爱古典的背身艺术——梦幻脚步、精准打板，技术在低位绽放。",
      "背身进攻在你眼中是篮球美学的巅峰。",
    ],
    "中距离": [
      "中距离是你的浪漫——在三分和篮下之间，最纯粹的技术对决。",
      "你欣赏那些在中距离区域创造投篮空间的大师。",
    ],
    "三分投射": [
      "三分球改变了一切——你欣赏那些能拉开空间、改变防守的射手。",
      "远程火力是你评判球员的核心维度。",
    ],
    "组织传球": [
      "传球组织是你最看重的——篮球是五个人的运动，组织者决定上限。",
      "你欣赏那些能让队友变得更好的传球大师。",
    ],
    "控球运球": [
      "控球能力是你评判后卫的第一标准——人球合一的美感无可替代。",
      "华丽的控运是你眼中篮球最赏心悦目的部分。",
    ],
    "内线防守": [
      "防守赢得总冠军——护框和篮板保护是你最看重的特质。",
      "你相信内线防守是球队的基石。",
    ],
    "外线防守": [
      "外线大锁让你最放心——能锁死对方箭头人物的防守者价值连城。",
      "你欣赏那些用防守改变比赛的球员。",
    ],
    "抢断": [
      "抢断改变了比赛节奏——你欣赏那些能预测对手意图的防守天才。",
      "防守端的破坏力是你最看重的。",
    ],
    "盖帽": [
      "盖帽是防守的感叹号——禁飞区的威慑力让你兴奋。",
      "你欣赏那些能让对手改变投篮轨迹的护框者。",
    ],
    "篮板": [
      "篮板是比赛的生命线——你欣赏那些用篮板控制比赛的悍将。",
      "每一个篮板都是态度的体现。",
    ],
  };

  const options = profiles[top.label] || [`你最看重的是${top.label}。`];
  return options[Math.floor(Math.random() * options.length)];
}

function generatePositionProfile(position: string, selectedPlayerIds: string[]): string {
  const posLabel = POSITION_LABELS[position] || position;
  const allStars = getAllStarPlayers();
  const selected = selectedPlayerIds
    .map(id => allStars.find(p => p.id === id))
    .filter(Boolean) as StarPlayer[];

  if (selected.length === 0) return posLabel;

  // Use top skill tags from selected players
  const tagCounts = new Map<string, number>();
  selected.forEach(p => p.skills.forEach(t => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)));
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t);

  return `${posLabel} · ${topTags.join(" · ")}`;
}

// ── Main DNA Generation (13D) ────────────────────────────────────────────

export function generateDNA(input: DNAInput): DNAResult {
  const allStars = getAllStarPlayers();

  const selectedPlayers = input.selectedStarPlayerIds
    .map(id => allStars.find(p => p.id === id))
    .filter(Boolean) as StarPlayer[];

  let sourceVectors: number[][];
  if (selectedPlayers.length > 0) {
    sourceVectors = selectedPlayers.map(starPlayerTo13DVector);
  } else {
    sourceVectors = [POSITION_BASELINES[input.selectedPosition] || ATTR_13D_KEYS.map(() => 50)];
  }

  const rawAvg = averageVectors(sourceVectors);
  const dna = rawAvg.map(clamp100);

  // Build dimensions map
  const dimensions: Record<string, DNADimension> = {};
  ATTR_13D_KEYS.forEach((k, i) => {
    dimensions[k] = { label: ATTR_13D_LABELS[k], value: dna[i] };
  });

  const description = generateDescription(dna);
  const positionProfile = generatePositionProfile(input.selectedPosition, input.selectedStarPlayerIds);
  const selectedPositionLabel = POSITION_LABELS[input.selectedPosition] || input.selectedPosition;

  return {
    vector: dna, dimensions, rawAverage: rawAvg,
    description, positionProfile, selectedPositionLabel,
  };
}

// ── Prospect Scoring (13D + Body + Position) ──────────────────────────────

function prospectTo13DVector(p: any): number[] {
  // Support both old 6D and new 13D attribute keys
  if (p.attributes && ATTR_13D_KEYS.every(k => k in p.attributes)) {
    return ATTR_13D_KEYS.map(k => p.attributes[k]);
  }
  // Fallback: old 6D format — map to closest 13D dimensions
  const a = p.attributes || {};
  return [
    a["athleticism"] ?? a["身体"] ?? 50,                    // 身体
    a["finishing"] ?? a["突破"] ?? 50,                       // 突破
    a["finishing"] ?? a["篮下"] ?? 50,                       // 篮下
    a["backToBasket"] ?? a["背身"] ?? 30,                    // 背身
    a["shooting"] ?? a["中投"] ?? 50,                        // 中投
    a["shooting"] ?? a["三分"] ?? 50,                        // 三分
    a["playmaking"] ?? a["传球"] ?? 50,                      // 传球
    a["playmaking"] ?? a["控运"] ?? 50,                      // 控运
    a["defense"] ?? a["内防"] ?? 50,                         // 内防
    a["defense"] ?? a["外防"] ?? 50,                         // 外防
    a["defense"] ?? a["抢断"] ?? 50,                         // 抢断
    a["athleticism"] ?? a["盖帽"] ?? 50,                     // 盖帽
    a["rebounding"] ?? a["篮板"] ?? 50,                      // 篮板
  ];
}

function parseHeightCm(p: any): number {
  if (p.heightCm) return p.heightCm;
  if (p.heightInches) return Math.round(p.heightInches * 2.54);
  return 200;
}

function parseWeightKg(p: any): number {
  if (p.weightKg) return p.weightKg;
  if (typeof p.weight === "string") {
    const lbs = parseFloat(p.weight);
    if (!isNaN(lbs)) return Math.round(lbs * 0.4536);
  }
  return 95;
}

function parseWingspanCm(p: any): number {
  if (p.wingspanCm) return p.wingspanCm;
  if (typeof p.wingspan === "string") {
    // Parse "7'0.5\"" format
    const match = p.wingspan.match(/(\d+)'(\d+\.?\d*)/);
    if (match) return Math.round((parseInt(match[1]) * 12 + parseFloat(match[2])) * 2.54);
  }
  return 210;
}

function dominantAttr(attrs: Record<string, number>): string {
  let maxK = "", maxV = 0;
  for (const [k, v] of Object.entries(attrs)) {
    if (v > maxV) { maxV = v; maxK = k; }
  }
  return maxK;
}

// ── Top N Matching (Three-Layer: 50% × 13D + 25% × Position + 25% × Body) ─

export function findTopMatches(
  dnaVector: number[],
  prospects: any[],
  selectedPosition: string,
  topN: number = 4,
  starBodyRef?: { height: number; weight: number; wingspan: number }
): ProspectMatch[] {
  const scored = prospects.map(p => {
    // Layer 1: 13D cosine similarity
    const pVector = prospectTo13DVector(p);
    const cosSim = cosineSimilarity(dnaVector, pVector);

    // Normalize cosSim to 0-100 (cosine is naturally 0-1 for non-negative vectors)
    const attrScore = Math.round(cosSim * 100);

    // Layer 2: Position match (0-1)
    const prospectPositions = p.positions || [p.position];
    const posScore = positionMatchScore(prospectPositions, selectedPosition);

    // Layer 3: Body match (0-1) — if star body reference provided
    let bodyScore = 0.5; // neutral default
    if (starBodyRef) {
      const pH = parseHeightCm(p);
      const pW = parseWeightKg(p);
      const pWS = parseWingspanCm(p);
      bodyScore = bodyMatchScore(pH, pW, pWS, starBodyRef.height, starBodyRef.weight, starBodyRef.wingspan);
    }

    // Combined: 50% attributes + 25% position + 25% body
    const combinedScore = Math.round(attrScore * 0.50 + posScore * 100 * 0.25 + bodyScore * 100 * 0.25);

    const match: ProspectMatch = {
      id: p.id,
      name: p.name,
      position: p.position,
      positions: prospectPositions,
      team: p.team,
      height: p.height,
      heightInches: p.heightInches || 72,
      weight: p.weight,
      wingspan: p.wingspan,
      matchScore: combinedScore,
      attributes: p.attributes,
      skills_13d: p.skills_13d || [],
      style: p.style || [],
      tags: p.tags || [],
      profile_text: p.profile_text || "",
      img: p.img || "",
      imgHero: p.imgHero || "",
      heightCm: parseHeightCm(p),
      weightKg: parseWeightKg(p),
      wingspanCm: parseWingspanCm(p),
      isPolished: p.isPolished,
      polishedReason: p.polishedReason,
      bbiq: p.bbiq,
      motor: p.motor,
      physicalScore: p.physicalScore,
      age: p.age,
      productionScore: p.productionScore,
      combine: p.combine,
      nameCn: p.nameCn || "",
    };

    return { match, attrScore, posScore, bodyScore, combinedScore };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);

  // Diversity constraint: ensure at least 2 different dominant styles
  const results: ProspectMatch[] = [];
  const stylesUsed = new Set<string>();

  for (const s of scored) {
    if (results.length >= topN) break;
    const style = dominantAttr(s.match.attributes);
    if (results.length === 0 || stylesUsed.size >= 2 || !stylesUsed.has(style)) {
      results.push(s.match);
      stylesUsed.add(style);
    }
  }

  // Fallback fill
  if (results.length < topN) {
    for (const s of scored) {
      if (results.length >= topN) break;
      if (!results.find(r => r.id === s.match.id)) {
        results.push(s.match);
      }
    }
  }

  return results.slice(0, topN);
}

// ── Display Utils ─────────────────────────────────────────────────────────

export function dimensionsToArray(dims: Record<string, DNADimension>): number[] {
  return ATTR_13D_KEYS.map(k => dims[k]?.value ?? 50);
}

export function generateDNASummary(dna: DNAResult): string {
  const entries = Object.values(dna.dimensions).sort((a, b) => b.value - a.value);
  const maxDim = entries[0];
  return `你的篮球DNA显示：你是${dna.selectedPositionLabel}位置的球迷，最看重${maxDim.label}。`;
}
