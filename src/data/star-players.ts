// 36 NBA star players with 13D attribute vectors for DNA generation
// V3: 13D 2KOL2-style (身体/突破/篮下/背身/中投/三分/传球/控运/内防/外防/抢断/盖帽/篮板)
// Body layer + Tag layer added. polishedType removed — now anchored in prospect DB.

import starData from "./star-players-13d.json";

// ── 13D Attribute Keys ──────────────────────────────────────────────────────

export const ATTR_13D_KEYS = [
  "身体", "突破", "篮下", "背身", "中投", "三分",
  "传球", "控运", "内防", "外防", "抢断", "盖帽", "篮板",
] as const;

export const ATTR_13D_LABELS: Record<string, string> = {
  "身体": "身体天赋", "突破": "持球突破", "篮下": "篮下终结", "背身": "背身进攻",
  "中投": "中距离", "三分": "三分投射", "传球": "组织传球", "控运": "控球运球",
  "内防": "内线防守", "外防": "外线防守", "抢断": "抢断", "盖帽": "盖帽", "篮板": "篮板",
};

// ── Skill & Style Enums ─────────────────────────────────────────────────────

export const SKILL_TAGS = [
  "Three Point", "Mid-range", "Finishing", "Post", "Handle", "Isolation",
  "Off-ball", "Passing Vision", "Tempo Control", "Rebounding",
  "POA Defense", "Rim Protection",
] as const;

export const STYLE_TAGS = [
  "Shooter", "ISO", "Dunk Finisher", "Primary Creator", "Point Forward",
  "Playmaking Big", "Two-Way", "3&D", "Defensive Anchor",
  "Small-Ball Center", "Glue Guy", "Sixth Man",
] as const;

export type SkillTag = typeof SKILL_TAGS[number];
export type StyleTag = typeof STYLE_TAGS[number];

// ── Star Player Interface (V3) ──────────────────────────────────────────────

export interface StarPlayer {
  id: string;
  name: string;       // 中文名
  en: string;         // English name
  position: "PG" | "SG" | "SF" | "PF" | "C";
  positions: string[];         // hybrid positions
  height: number;              // cm
  wingspan: number;            // cm
  weight: number;              // kg
  attributes: Record<string, number>;  // 13D
  skills: string[];            // SkillTag enum values
  style: string[];             // StyleTag enum values
}

// ── Position Labels ─────────────────────────────────────────────────────────

export const POSITION_LABELS: Record<string, string> = {
  PG: "控球后卫", SG: "得分后卫", SF: "小前锋", PF: "大前锋", C: "中锋",
};

// ── Load from generated JSON ────────────────────────────────────────────────

function loadStars(): Record<string, StarPlayer[]> {
  const map: Record<string, StarPlayer[]> = { PG: [], SG: [], SF: [], PF: [], C: [] };
  for (const raw of starData as any[]) {
    const player: StarPlayer = {
      id: raw.id,
      name: raw.name,
      en: raw.en,
      position: raw.position,
      positions: raw.positions || [raw.position],
      height: raw.height || 200,
      wingspan: raw.wingspan || 210,
      weight: raw.weight || 95,
      attributes: raw.attributes,
      skills: raw.skills || [],
      style: raw.style || [],
    };
    if (map[player.position]) {
      map[player.position].push(player);
    }
  }
  return map;
}

export const STAR_PLAYERS: Record<string, StarPlayer[]> = loadStars();

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getAllStarPlayers(): StarPlayer[] {
  return Object.values(STAR_PLAYERS).flat();
}

export function getStarPlayerById(id: string): StarPlayer | undefined {
  return getAllStarPlayers().find(p => p.id === id);
}

export function starPlayerTo13DVector(p: StarPlayer): number[] {
  return ATTR_13D_KEYS.map(k => p.attributes[k] ?? 50);
}
