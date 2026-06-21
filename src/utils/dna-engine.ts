// Basketball DNA Engine V2 — Core Algorithm
// 6D vectors (added rebounding), position-weighted scoring, diversity constraint
// polished/upside replaces talent/hardwork

import type { StarPlayer } from "../data/star-players";
import { getAllStarPlayers, POSITION_LABELS } from "../data/star-players";

// ── Types ──────────────────────────────────────────────────────────────

export interface DNAInput {
  selectedPosition: string;
  selectedStarPlayerIds: string[];
  polishedType: "polished" | "upside";
}

export interface DNADimension {
  label: string;
  value: number;
}

export interface DNADimensions {
  finishing: DNADimension;
  shooting: DNADimension;
  playmaking: DNADimension;
  defense: DNADimension;
  athleticism: DNADimension;
  rebounding: DNADimension;
}

export interface DNAResult {
  vector: number[];
  dimensions: DNADimensions;
  rawAverage: number[];
  polishedType: "polished" | "upside";
  description: string;
  positionProfile: string;
  selectedPositionLabel: string;
}

export interface ProspectMatch {
  id: number;
  name: string;
  position: string;
  positions: string[];       // hybrid positions
  team: string;
  height: string;
  heightInches: number;
  weight: string;
  wingspan: string;
  matchScore: number;
  attributes: Record<string, number>;
  tags: string[];
  profile_text: string;
  img: string;
  imgHero: string;
  // V2 fields
  bbiq?: number;
  motor?: number;
  physicalScore?: number;
  age?: number;
  productionScore?: number;
  isPolished?: boolean;
  combine?: Record<string, unknown>;
}

// ── 6D Position Archetype Baselines ────────────────────────────────────
// Index: [finishing, shooting, playmaking, defense, athleticism, rebounding]

export const POSITION_BASELINES: Record<string, number[]> = {
  PG: [55, 70, 90, 55, 65, 30],
  SG: [72, 85, 65, 65, 80, 40],
  SF: [75, 75, 70, 72, 78, 55],
  PF: [82, 60, 60, 75, 78, 75],
  C:  [88, 35, 55, 82, 75, 90],
};

// ── Polished / Upside Weight Vectors (mild ~10% modifiers) ─────────────
// polished = ready-now, high floor → boosts shooting, defense, rebounding
// upside = raw talent, high ceiling → boosts athleticism, finishing
// Index: [finishing, shooting, playmaking, defense, athleticism, rebounding]

const POLISHED_WEIGHTS = [0.90, 1.08, 0.95, 1.08, 0.88, 1.06];
const UPSIDE_WEIGHTS   = [1.10, 0.92, 0.95, 0.88, 1.12, 0.90];

// ── Dimension Labels ────────────────────────────────────────────────────

const DIM_LABELS = ["终结能力", "投篮能力", "组织能力", "防守能力", "运动天赋", "篮板能力"] as const;

// ── Cosine Similarity ───────────────────────────────────────────────────

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

// ── Vector Utilities ────────────────────────────────────────────────────

function playerToVector(p: StarPlayer): number[] {
  return [
    p.attributes.finishing, p.attributes.shooting, p.attributes.playmaking,
    p.attributes.defense, p.attributes.athleticism, p.attributes.rebounding,
  ];
}

function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) return [50, 50, 50, 50, 50, 50];
  const sum = vectors.reduce((acc, v) => acc.map((x, i) => x + v[i]), [0, 0, 0, 0, 0, 0]);
  return sum.map(x => Math.round(x / vectors.length));
}

function multiplyVectors(a: number[], b: number[]): number[] {
  return a.map((x, i) => Math.round(x * b[i]));
}

function normalizeVector(v: number[]): number[] {
  const maxVal = Math.max(...v);
  if (maxVal <= 100) return v;
  return v.map(x => Math.round((x / maxVal) * 100));
}

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ── Description ─────────────────────────────────────────────────────────

function generateDescription(dna: number[], pType: "polished" | "upside"): string {
  const maxIdx = dna.indexOf(Math.max(...dna));
  const maxLabel = DIM_LABELS[maxIdx];

  if (pType === "upside") {
    const profiles = [
      "你相信篮下的统治力——那些能用身体天赋碾压防守、在油漆区呼风唤雨的天赋怪。",
      "你欣赏投篮的天赋——但更看重那些与生俱来的身体条件与运动爆发力。",
      "你看重传球的本能——但身体天赋才是改变比赛的终极武器。",
      "防守固然重要——但对你来说，飞天遁地的运动能力才是篮球的终极美学。",
      "运动天赋是你评判球员的第一标尺——弹跳、速度、爆发力，这些才是硬通货。",
      "篮板是天赋的体现——臂展、弹跳、卡位本能，这些无法被教会。",
    ];
    return `作为潜力型球迷，${profiles[maxIdx]}`;
  } else {
    const profiles = [
      "你欣赏那些在防守端倾尽全力的球员——终结能力可以打磨，但对比赛的投入决定高度。",
      "投篮可以磨练——而你最看重的是球员在场上的成熟度与即战力。",
      "组织需要智慧——真正的智慧体现在每一次阅读与判断。",
      "防守赢得总冠军——你深谙此道，对铁血防守者情有独钟。",
      "运动天赋或许是天生的——但日复一日的技术打磨才是伟大球员的基石。",
      "篮板是拼劲的体现——每一次卡位、每一次冲抢，都是态度的延伸。",
    ];
    return `作为即战力型球迷，${profiles[maxIdx]}`;
  }
}

function generatePositionProfile(position: string, pType: "polished" | "upside", selectedPlayerIds: string[]): string {
  const posLabel = POSITION_LABELS[position] || position;
  const allStars = getAllStarPlayers();
  const selected = selectedPlayerIds
    .map(id => allStars.find(p => p.id === id))
    .filter(Boolean) as StarPlayer[];

  if (selected.length === 0) return `${posLabel} · ${pType === "upside" ? "潜力型" : "即战力型"}`;

  const tagCounts = new Map<string, number>();
  selected.forEach(p => p.tags.forEach(t => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)));
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t);

  return `${posLabel} · ${topTags.join(" · ")}`;
}

// ── Main DNA Generation (6D) ────────────────────────────────────────────

export function generateDNA(input: DNAInput): DNAResult {
  const allStars = getAllStarPlayers();

  const selectedPlayers = input.selectedStarPlayerIds
    .map(id => allStars.find(p => p.id === id))
    .filter(Boolean) as StarPlayer[];

  let sourceVectors: number[][];
  if (selectedPlayers.length > 0) {
    sourceVectors = selectedPlayers.map(playerToVector);
  } else {
    sourceVectors = [POSITION_BASELINES[input.selectedPosition] || [70, 70, 70, 70, 70, 70]];
  }

  const rawAvg = averageVectors(sourceVectors);
  const weights = input.polishedType === "polished" ? POLISHED_WEIGHTS : UPSIDE_WEIGHTS;
  const weighted = multiplyVectors(rawAvg, weights);
  const dna = normalizeVector(weighted).map(clamp100);

  const dimensions: DNADimensions = {
    finishing:    { label: DIM_LABELS[0], value: dna[0] },
    shooting:     { label: DIM_LABELS[1], value: dna[1] },
    playmaking:   { label: DIM_LABELS[2], value: dna[2] },
    defense:      { label: DIM_LABELS[3], value: dna[3] },
    athleticism:  { label: DIM_LABELS[4], value: dna[4] },
    rebounding:   { label: DIM_LABELS[5], value: dna[5] },
  };

  const description = generateDescription(dna, input.polishedType);
  const positionProfile = generatePositionProfile(input.selectedPosition, input.polishedType, input.selectedStarPlayerIds);
  const selectedPositionLabel = POSITION_LABELS[input.selectedPosition] || input.selectedPosition;

  return {
    vector: dna, dimensions, rawAverage: rawAvg,
    polishedType: input.polishedType, description, positionProfile, selectedPositionLabel,
  };
}

// ── Prospect Scoring ────────────────────────────────────────────────────

function prospectToMatch(p: any, dnaVector: number[]): ProspectMatch {
  const pVector = [
    p.attributes.finishing, p.attributes.shooting, p.attributes.playmaking,
    p.attributes.defense, p.attributes.athleticism, p.attributes.rebounding,
  ];
  const similarity = cosineSimilarity(dnaVector, pVector);

  return {
    id: p.id, name: p.name, position: p.position,
    positions: p.positions || [p.position],
    team: p.team, height: p.height, heightInches: p.heightInches || 72,
    weight: p.weight, wingspan: p.wingspan,
    matchScore: Math.round(similarity * 100),
    attributes: p.attributes, tags: p.tags,
    profile_text: p.profile_text, img: p.img, imgHero: p.imgHero,
    bbiq: p.bbiq, motor: p.motor, physicalScore: p.physicalScore,
    age: p.age, productionScore: p.productionScore, isPolished: p.isPolished,
    combine: p.combine,
  };
}

// ── Dominant attribute (for diversity) ──────────────────────────────────

function dominantAttr(attrs: Record<string, number>): string {
  let maxK = "finishing", maxV = 0;
  for (const [k, v] of Object.entries(attrs)) {
    if (v > maxV) { maxV = v; maxK = k; }
  }
  return maxK;
}

// ── Top N Matching (Position-Weighted + Diversity) ──────────────────────

export function findTopMatches(
  dnaVector: number[],
  prospects: any[],
  selectedPosition: string,
  topN: number = 4
): ProspectMatch[] {
  const POSITION_BONUS = 0.15;  // same-position gets 15% boost (was position filter)

  // Score all prospects — rankScore has position bonus, matchScore stays raw
  const scored = prospects.map(p => {
    const match = prospectToMatch(p, dnaVector);
    const isSamePos = match.positions.includes(selectedPosition);
    const rankScore = isSamePos ? match.matchScore * (1 + POSITION_BONUS) : match.matchScore;
    return { ...match, matchScore: match.matchScore, _rank: rankScore };
  });

  scored.sort((a, b) => (b as any)._rank - (a as any)._rank);

  // Diversity constraint: ensure at least 2 different dominant styles in Top N
  const results: ProspectMatch[] = [];
  const stylesUsed = new Set<string>();

  for (const m of scored) {
    if (results.length >= topN) break;

    const style = dominantAttr(m.attributes);
    // Allow: first pick always; after that, require different style if we have < 2 styles
    if (results.length === 0 || stylesUsed.size >= 2 || !stylesUsed.has(style)) {
      results.push(m);
      stylesUsed.add(style);
      continue;
    }
    // If we already have 2+ styles, accept any remaining
    if (stylesUsed.size >= 2) {
      results.push(m);
      stylesUsed.add(style);
    }
  }

  // Fallback: if diversity constraint prevented filling topN, fill from remaining
  if (results.length < topN) {
    for (const m of scored) {
      if (results.length >= topN) break;
      if (!results.find(r => r.id === m.id)) {
        results.push(m);
      }
    }
  }

  // Strip internal _rank before returning
  return results.slice(0, topN).map(({ _rank, ...rest }: any) => rest as ProspectMatch);
}

// ── Display Utils ───────────────────────────────────────────────────────

export function dimensionsToArray(dims: DNADimensions): number[] {
  return [
    dims.finishing.value, dims.shooting.value, dims.playmaking.value,
    dims.defense.value, dims.athleticism.value, dims.rebounding.value,
  ];
}

export function generateDNASummary(dna: DNAResult): string {
  const maxDim = Object.values(dna.dimensions).sort((a, b) => b.value - a.value)[0];
  const typeLabel = dna.polishedType === "upside" ? "潜力型" : "即战力型";
  return `你的篮球DNA显示：你是${dna.selectedPositionLabel}位置的${typeLabel}球迷，最看重${maxDim.label}。`;
}
