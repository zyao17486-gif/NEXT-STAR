import { motion } from "motion/react";
import type { ProspectMatch } from "../../utils/dna-engine";
import { T, BG, B, FONT } from "../../styles/design-tokens";

interface RecommendationsProps {
  onContinue: () => void;
  recommendations: ProspectMatch[];
  dnaData?: {
    positionProfile: string;
    selectedPositionLabel: string;
  } | null;
  followed?: Set<string>;
  onToggleFollow?: (name: string) => void;
}

/** Convert inches to cm, no decimals */
function toCm(inches: number): string {
  return `${Math.round(inches * 2.54)}cm`;
}

/** Parse weight string like "240 lbs" to kg, no decimals */
function toKg(weightStr: string): string {
  const match = weightStr.match(/(\d+)/);
  if (!match) return weightStr;
  return `${Math.round(parseInt(match[1]) * 0.4536)}kg`;
}

/** Parse wingspan like "7'4\"" to cm */
function wingspanToCm(ws: string): string {
  const match = ws.match(/(\d+)'(\d+(?:\.\d+)?)/);
  if (!match) return ws;
  const inches = parseInt(match[1]) * 12 + parseFloat(match[2]);
  return `${Math.round(inches * 2.54)}cm`;
}

export function Recommendations({
  onContinue,
  recommendations,
  dnaData,
  followed = new Set(),
  onToggleFollow = () => {},
}: RecommendationsProps) {

  const hasData = recommendations.length > 0;

  return (
    <div className="min-h-screen" style={{ background: BG.page, fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="px-8 lg:px-20 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p style={{ color: T.dim, fontSize: FONT.sm, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "16px" }}>
            {hasData ? "算法专属推荐" : "专属推荐"}
          </p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 style={{ color: T.white, fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1 }}>
                {hasData ? "你的下一批" : "你的下一批"}<br />
                <span style={{ color: T.label }}>明日之星</span>
              </h1>
              {dnaData && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: BG.overlay, color: T.white, border: B.visible }}>
                    {dnaData.selectedPositionLabel}
                  </span>
                </div>
              )}
            </div>
            <button onClick={onContinue}
              className="px-8 py-3 rounded-full transition-all duration-200 hover:bg-white hover:text-black"
              style={{ border: "1px solid rgba(255,255,255,0.25)", color: T.white, fontSize: FONT.md, fontWeight: 500 }}>
              进入主页 →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Cards grid */}
      <div className="px-8 lg:px-20 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasData ? (
          recommendations.map((p, i) => {
            // Check both English and Chinese name variants
            const recNames = [p.name, (p as any).nameCn].filter(Boolean) as string[];
            const isFollowed = recNames.some(n => followed.has(n));
            const recToggleKey = recNames.find(n => followed.has(n)) ?? p.name;
            const rankLabels = ["最佳匹配", "高度推荐", "实力新秀", "潜力之选"];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="rounded-3xl overflow-hidden"
                style={{ background: BG.card, border: B.card }}>

                {/* Header: rank badge + match score */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: i === 0 ? "rgba(255,200,100,0.12)" : BG.overlay,
                      color: i === 0 ? "#ffc864" : T.body,
                      fontSize: FONT.base,
                    }}>
                    {rankLabels[i] || "实力新秀"}
                  </span>
                  <span style={{
                    color: i === 0 ? "#ffc864" : T.label,
                    fontSize: FONT.lg,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    匹配度 {p.matchScore}%
                  </span>
                </div>

                {/* Position + School + Player name */}
                <div className="px-6 pb-2">
                  <div style={{ color: T.body, fontSize: FONT.md, marginBottom: "6px" }}>
                    {(p.positions || [p.position]).join("/")} · {p.team}
                  </div>
                  <h3 style={{ color: T.white, fontSize: "40px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                    {(p as any).nameCn || p.name}
                  </h3>
                  {(p as any).nameCn && (p as any).nameCn !== p.name && (
                    <div style={{ color: T.hint, fontSize: FONT.base, marginTop: "2px" }}>{p.name}</div>
                  )}
                </div>

                {/* Physical stats — larger */}
                <div className="px-6 py-5 grid grid-cols-3 gap-4">
                  {[["身高", toCm(p.heightInches)], ["臂展", wingspanToCm(p.wingspan)], ["体重", toKg(p.weight)]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ color: T.label, fontSize: FONT.base, marginBottom: "6px" }}>{l}</div>
                      <div style={{ color: T.white, fontSize: "22px", fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* 13D Attribute bars — compact */}
                <div className="px-6 pb-6 space-y-1.5">
                  {["身体","突破","篮下","背身","中投","三分","传球","控运","内防","外防","抢断","盖帽","篮板"]
                    .map(attr => [attr, p.attributes[attr] ?? 50] as [string, number])
                    .sort((a, b) => b[1] - a[1])
                    .map(([label, val]) => (
                    <div key={label}>
                      <div className="flex justify-between mb-0.5">
                        <span style={{ color: T.label, fontSize: FONT.xs }}>{label}</span>
                        <span style={{ color: val >= 80 ? T.white : T.body, fontSize: FONT.xs, fontWeight: 500 }}>{val}</span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: BG.overlay }}>
                        <div className="h-1 rounded-full transition-all duration-1000"
                          style={{ width: `${val}%`, background: val >= 80 ? "#fff" : "rgba(255,255,255,0.35)" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Follow */}
                <div className="px-6 pb-6">
                  <button onClick={() => onToggleFollow(recToggleKey)}
                    className="w-full py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: isFollowed ? BG.overlay : T.white,
                      border: isFollowed ? "1px solid rgba(255,255,255,0.15)" : "transparent",
                      color: isFollowed ? T.label : BG.page,
                      fontSize: FONT.lg,
                      fontWeight: 600,
                    }}>
                    {isFollowed ? "已关注" : "关注 " + p.name}
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          /* Fallback when no recommendations computed */
          <>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="lg:col-span-3 flex flex-col items-center justify-center py-24"
              style={{ background: BG.card, borderRadius: "24px" }}>
              <div style={{ color: T.label, fontSize: "18px", marginBottom: "8px" }}>
                正在计算你的专属推荐...
              </div>
              <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "14px" }}>
                请稍候，算法正在为你匹配最佳球员
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
