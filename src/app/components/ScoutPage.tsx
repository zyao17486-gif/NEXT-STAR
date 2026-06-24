import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useScoutAI } from "../../services/use-scout-ai";
// V2: 20-player 2026 draft database (used for image lookup and local fallback)
import draftDB from "../../data/2026-draft-database.json";
import { T, BG, B, FONT } from "../../styles/design-tokens";

type DraftPlayer = typeof draftDB[number];

// ── Local player list built from 2026 draft database ───────────────────────
const POS_CN: Record<string, string> = {
  PG: "控卫", SG: "得分后卫", SF: "小前锋", PF: "大前锋", C: "中锋",
};
const ALL_PLAYERS = (draftDB as DraftPlayer[]).map(p => ({
  name: p.name,
  nameCn: (p as any).nameCn as string | undefined,
  pos: POS_CN[p.position] ?? p.position,
  school: p.team,
  projection: "2026 NBA Draft",
}));

/** Resolve all name variants for a player and return the correct toggle key */
function resolvePlayerNames(english: string, chinese?: string) {
  const names = [english, chinese].filter(Boolean) as string[];
  return names;
}

// ── AI result types ────────────────────────────────────────────────────────
interface AIRecommendation {
  name: string;
  en: string;
  matchScore: number;
  reason: string;
  strengths: string[];
  risks: string[];
}

interface AIResult {
  recommendations: AIRecommendation[];
  summary: string;
}

// ── Props ──────────────────────────────────────────────────────────────────
interface ScoutPageProps {
  onSelectPlayer: (name: string) => void;
  followed: Set<string>;
  onToggleFollow: (name: string) => void;
}

// ── Score badge colour ─────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 90) return "#30d158";
  if (score >= 80) return "#ffd60a";
  if (score >= 70) return "#ff9f0a";
  return "#ff453a";
}

// ── Skeleton for loading state ─────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-px rounded-2xl overflow-hidden" style={{ border: B.card }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-5 px-6 py-5 animate-pulse" style={{ background: BG.card }}>
          <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: BG.overlay }} />
          <div className="flex-1 space-y-2.5">
            <div style={{ height: "14px", width: "120px", background: BG.overlay, borderRadius: "4px" }} />
            <div style={{ height: "12px", width: "200px", background: BG.hover, borderRadius: "4px" }} />
          </div>
        </div>
      ))}
      <div className="px-6 py-4" style={{ background: BG.card }}>
        <div style={{ height: "12px", width: "70%", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
      </div>
    </div>
  );
}

// ── AI Result Card ─────────────────────────────────────────────────────────
function AIResultCard({
  rec,
  index,
  onSelectPlayer,
  followed,
  onToggleFollow,
}: {
  rec: AIRecommendation;
  index: number;
  onSelectPlayer: (name: string) => void;
  followed: Set<string>;
  onToggleFollow: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sc = scoreColor(rec.matchScore);
  const aiNames = resolvePlayerNames(rec.en, rec.name);
  const isFollowed = aiNames.some(n => followed.has(n));
  const toggleKey = aiNames.find(n => followed.has(n)) ?? rec.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <button
        onClick={() => onSelectPlayer(rec.name)}
        className="w-full text-left px-6 py-5 transition-colors duration-150"
        style={{ background: BG.card, borderBottom: B.divider }}
      >
        {/* Top row: info + score */}
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span style={{ color: T.white, fontSize: FONT.lg, fontWeight: 600 }}>{rec.name}</span>
              <span style={{ color: T.dim, fontSize: FONT.sm }}>{rec.en}</span>
            </div>
            <div style={{ color: T.dim, fontSize: FONT.sm, marginTop: "2px" }}>
              {rec.strengths.slice(0, 2).join(" · ")}
            </div>
          </div>
          {/* Match score badge */}
          <div className="text-center shrink-0">
            <div
              className="px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{
                background: `${sc}18`,
                border: `1px solid ${sc}40`,
                color: sc,
                fontFamily: "'Inter', sans-serif",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              {rec.matchScore}%
            </div>
            <div style={{ color: T.ghost, fontSize: FONT.xs, marginTop: "3px" }}>匹配度</div>
            {/* Follow button for AI results */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFollow(toggleKey); }}
              className="mt-2 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isFollowed ? BG.overlay : T.white,
                border: isFollowed ? B.visible : "1px solid transparent",
                color: isFollowed ? T.body : BG.page,
              }}
            >
              {isFollowed ? "已关注" : "关注"}
            </button>
          </div>
        </div>

        {/* Reasoning */}
        <p style={{ color: T.label, fontSize: FONT.base, lineHeight: 1.65, marginTop: "12px" }}>
          {rec.reason}
        </p>
      </button>

      {/* Expandable strengths & risks */}
      <div style={{ background: BG.card, borderBottom: B.divider }}>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="w-full flex items-center justify-between px-6 py-2.5 transition-colors hover:bg-white/[0.02]"
          style={{ color: T.dim, fontSize: FONT.sm }}
        >
          <span>{expanded ? "收起详细分析" : "展开优势与风险"}</span>
          <motion.svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M3 5l3 3 3-3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.success }} />
                    <span style={{ color: T.body, fontSize: FONT.xs, letterSpacing: "0.06em" }}>优势</span>
                  </div>
                  <ul className="space-y-1.5">
                    {rec.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: T.ghost, fontSize: FONT.xs }}>+</span>
                        <span style={{ color: T.label, fontSize: FONT.sm, lineHeight: 1.5 }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.danger }} />
                    <span style={{ color: T.body, fontSize: FONT.xs, letterSpacing: "0.06em" }}>风险</span>
                  </div>
                  <ul className="space-y-1.5">
                    {rec.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: T.ghost, fontSize: FONT.xs }}>−</span>
                        <span style={{ color: T.body, fontSize: FONT.sm, lineHeight: 1.5 }}>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main ScoutPage ─────────────────────────────────────────────────────────
export function ScoutPage({ onSelectPlayer, followed, onToggleFollow }: ScoutPageProps) {
  const [query, setQuery] = useState("");
  const [aiMode, setAiMode] = useState(false);

  // AI states — TanStack Query managed
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const { data: aiResult, isLoading: isSearching, error: aiQueryError } = useScoutAI(
    aiSearchQuery,
    aiSearchQuery.trim().length > 0
  );
  const [aiError, setAiError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Local keyword search across all 36 draft prospects (limit 5) ──────────
  const localFiltered = ALL_PLAYERS.filter((p) => {
    const cn = (p as any).nameCn as string | undefined;
    return p.name.includes(query) || (cn || "").includes(query) || p.school.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 5);

  // ── Trigger AI Search via TanStack Query ──────────────────────────────────
  const runAISearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setAiError(null);
    setAiSearchQuery(searchQuery.trim());
    // GA: AI 搜索
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "ai_search", {
        query: searchQuery.trim(),
      });
    }
  }, []);

  // Sync TanStack Query error to local error display
  useEffect(() => {
    if (aiQueryError && !aiError) {
      setAiError(aiQueryError instanceof Error ? aiQueryError.message : "AI 服务暂不可用");
    }
  }, [aiQueryError]);

  // ── Handle Enter key ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (aiMode) {
        runAISearch(query);
      }
    }
  };

  // ── Toggle AI mode ───────────────────────────────────────────────────────
  const toggleAiMode = () => {
    const next = !aiMode;
    setAiMode(next);
    setAiSearchQuery("");
    setAiError(null);
    if (next) {
      // Focus the input when switching to AI mode
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // ── Dismiss AI error ─────────────────────────────────────────────────────
  const dismissError = () => {
    setAiError(null);
  };

  return (
    <div style={{ fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="mb-10">
        <h1 style={{ color: T.white, fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "8px" }}>
          球探台
        </h1>
        <p style={{ color: T.label, fontSize: FONT.base }}>
          {aiMode ? "用自然语言描述你想要的球员类型，AI 为你推荐" : "搜寻 NCAA 潜力股、高中明日之星与国际新秀"}
        </p>
      </div>

      {/* Search bar + AI toggle */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-xl flex-1 min-w-[200px]"
          style={{ background: BG.card, border: aiMode ? "1px solid rgba(255,215,0,0.3)" : B.subtle, transition: "border-color 0.3s" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke={aiMode ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.25)"} strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke={aiMode ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.25)"} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!aiMode) {
                setAiSearchQuery("");
                setAiError(null);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              aiMode
                ? "描述你想要的球员类型…"
                : "搜索球员姓名、球队..."
            }
            className="flex-1 bg-transparent outline-none overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ color: T.white, fontSize: FONT.lg }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setAiSearchQuery(""); setAiError(null); }} style={{ color: T.dim, fontSize: "18px" }}>
              ×
            </button>
          )}
        </div>

        {/* AI mode toggle */}
        <button
          data-tour="ai-toggle"
          onClick={toggleAiMode}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200"
          style={{
            background: aiMode ? "rgba(255,215,0,0.12)" : BG.hover,
            border: aiMode ? "1px solid rgba(255,215,0,0.35)" : B.subtle,
            color: aiMode ? T.accent : T.dim,
            fontSize: FONT.base,
          }}
        >
          {/* Sparkle icon */}
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2M3.5 3.5l1.5 1.5M10 10l1.5 1.5M3.5 11.5L5 10M10 5l1.5-1.5"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
            />
            <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          AI 球探
        </button>

        {/* AI Search trigger button (visible only in AI mode) */}
        {aiMode && query.trim() && (
          <button
            onClick={() => runAISearch(query)}
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: T.accent, color: BG.page, fontSize: FONT.base }}
          >
            {isSearching ? "分析中…" : "⚡ AI 分析"}
          </button>
        )}
      </div>

      {/* AI error banner */}
      <AnimatePresence>
        {aiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)" }}
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#ff453a" strokeWidth="1.2" />
                  <path d="M7 4v3.5M7 10v.5" stroke="#ff453a" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span style={{ color: T.body, fontSize: FONT.base }}>{aiError}</span>
              </div>
              <button onClick={dismissError} style={{ color: T.dim, fontSize: "16px" }}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI summary */}
      <AnimatePresence>
        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-5 py-4 rounded-2xl"
            style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.12)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M3 3l1.5 1.5M8.5 8.5L10 10M3 10l1.5-1.5M8.5 4.5L10 3" stroke="#ffd60a" strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="6.5" cy="6.5" r="2" stroke="#ffd60a" strokeWidth="1.1" />
              </svg>
              <span style={{ color: T.accent, fontSize: FONT.sm, fontWeight: 600, letterSpacing: "0.04em" }}>AI 球探报告</span>
            </div>
            <p style={{ color: T.label, fontSize: FONT.base, lineHeight: 1.7 }}>{aiResult.summary}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results area ── */}
      <AnimatePresence mode="wait">
        {/* Loading state */}
        {isSearching && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSkeleton />
          </motion.div>
        )}

        {/* AI results */}
        {!isSearching && aiResult && (
          <motion.div key="ai-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl overflow-hidden" style={{ border: B.card }}>
              {aiResult.recommendations.slice(0, 5).map((rec, i) => (
                <AIResultCard
                  key={rec.name}
                  rec={rec}
                  index={i}
                  onSelectPlayer={onSelectPlayer}
                  followed={followed}
                  onToggleFollow={onToggleFollow}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Local keyword results (shown when not in AI mode or AI has no result) */}
        {!isSearching && !aiResult && (
          <motion.div key={query} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {localFiltered.length === 0 ? (
              <div className="text-center py-20">
                <p style={{ color: T.ghost, fontSize: FONT.lg }}>未找到相关球员</p>
                {!aiMode && (
                  <button
                    onClick={toggleAiMode}
                    className="mt-4 px-5 py-2 rounded-full text-sm transition-all duration-200"
                    style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", color: T.accent }}
                  >
                    试试 AI 球探智能搜索 →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-px rounded-2xl overflow-hidden" style={{ border: B.card }}>
                {localFiltered.map((p, i) => {
                  const names = resolvePlayerNames(p.name, p.nameCn);
                  const isFollowed = names.some(n => followed.has(n));
                  const toggleKey = names.find(n => followed.has(n)) ?? p.name;
                  return (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="w-full flex items-center gap-4 px-6 py-5 transition-colors duration-150 hover:bg-white/[0.04]"
                      style={{ background: BG.card, borderBottom: i < localFiltered.length - 1 ? B.divider : "none" }}
                    >
                      <button
                        onClick={() => onSelectPlayer(p.name)}
                        className="flex-1 flex items-center gap-4 text-left min-w-0 bg-transparent border-none outline-none cursor-pointer"
                        style={{ padding: 0 }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span style={{ color: T.white, fontSize: FONT.lg, fontWeight: 600 }}>{p.nameCn || p.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span style={{ color: T.dim, fontSize: FONT.base }}>{p.pos}</span>
                            <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                            <span style={{ color: T.dim, fontSize: FONT.base }}>{p.school}</span>
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.2, flexShrink: 0 } as React.CSSProperties}>
                          <path d="M6 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFollow(toggleKey); }}
                        className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
                        style={{
                          background: isFollowed ? BG.overlay : T.white,
                          border: isFollowed ? B.visible : "1px solid transparent",
                          color: isFollowed ? T.body : BG.page,
                        }}
                      >
                        {isFollowed ? "已关注" : "关注"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
