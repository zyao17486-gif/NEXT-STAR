// Design Tokens — single source of truth for all visual constants
// Change a value here, it updates everywhere. No more global search-replace.

// ── Text ────────────────────────────────────────────────────────────────
export const T = {
  white:   "#fff" as const,
  hero:    "rgba(255,255,255,0.65)" as const,   // 综述正文
  body:    "rgba(255,255,255,0.55)" as const,    // 常规文字
  label:   "rgba(255,255,255,0.5)" as const,     // 标签、副标题
  dim:     "rgba(255,255,255,0.35)" as const,    // 弱化文字
  hint:    "rgba(255,255,255,0.25)" as const,    // 提示/占位
  ghost:   "rgba(255,255,255,0.2)" as const,     // 最弱文字、空状态
  accent:  "#ffd60a" as const,                   // AI/高亮黄
  danger:  "#ff453a" as const,                   // 风险/删除红
  success: "#30d158" as const,                   // 优势/通过绿
};

// ── Background & Surface ─────────────────────────────────────────────────
export const BG = {
  page:    "#000" as const,
  card:    "#0a0a0a" as const,
  raised:  "#111" as const,
  hover:   "rgba(255,255,255,0.04)" as const,    // hover 状态
  overlay: "rgba(255,255,255,0.06)" as const,    // 微妙叠加
  subtle:  "rgba(255,255,255,0.03)" as const,    // 极浅叠加
};

// ── Border ───────────────────────────────────────────────────────────────
export const B = {
  card:   "1px solid rgba(255,255,255,0.06)" as const,
  subtle: "1px solid rgba(255,255,255,0.08)" as const,
  visible:"1px solid rgba(255,255,255,0.12)" as const,
  active: "1px solid rgba(255,255,255,0.35)" as const,
  divider:"1px solid rgba(255,255,255,0.05)" as const,
};

// ── Pie Chart ────────────────────────────────────────────────────────────
export const PIE = {
  finishing:   { light: "#2997ff", label: "终结" },
  shooting:    { light: "#30d158", label: "投射能力" },
  playmaking:  { light: "#ffd60a", label: "组织控运" },
  defense:     { light: "#ff453a", label: "防守能力" },
  rebounding:  { light: "#bf5af2", label: "篮板能力" },
};

// ── Score Colors ─────────────────────────────────────────────────────────
export const SCORE = {
  elite:  "#30d158" as const,  // ≥90
  strong: "#ffd60a" as const,  // ≥80
  solid:  "#ff9f0a" as const,  // ≥70
  risk:   "#ff453a" as const,  // <70
};

// ── Typography Scale ─────────────────────────────────────────────────────
export const FONT = {
  xs:   "11px" as const,
  sm:   "12px" as const,
  base: "13px" as const,
  md:   "14px" as const,
  lg:   "15px" as const,
  xl:   "16px" as const,
};

// ── Spacing ──────────────────────────────────────────────────────────────
export const S = {
  xs:  "4px" as const,
  sm:  "8px" as const,
  md:  "12px" as const,
  lg:  "16px" as const,
  xl:  "20px" as const,
  xxl: "28px" as const,
};

// ── Radius ───────────────────────────────────────────────────────────────
export const R = {
  sm: "8px" as const,
  md: "12px" as const,
  lg: "16px" as const,
  xl: "24px" as const,
};
