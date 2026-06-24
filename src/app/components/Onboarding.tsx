import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { STAR_PLAYERS, POSITION_LABELS } from "../../data/star-players";
import { T, BG, B, FONT } from "../../styles/design-tokens";

interface OnboardingProps {
  onComplete: (data: {
    selectedPosition: string;
    selectedStarPlayers: string[];
    polishedType: "polished" | "raw" | null;
  }) => void;
  onSkip: () => void;
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-white" />
      <span style={{ color: T.white, fontSize: FONT.base, fontWeight: 700, letterSpacing: "0.18em" }}>NEXT STAR</span>
    </div>
  );
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedStarPlayers, setSelectedStarPlayers] = useState<string[]>([]);
  const [polishedType, setPolishedType] = useState<"polished" | "raw" | null>(null);

  const canNext = [
    true,                                                       // Step 0: Welcome
    selectedPosition !== "" && selectedStarPlayers.length > 0,  // Step 1: Position + Stars
    polishedType !== null,                                      // Step 2: Polished type
  ][step];

  const totalSteps = 2; // Step 0 welcome, Step 1 position+stars, Step 2 polished
  const progressPct = step === 0 ? 0 : step === 1 ? 50 : 100;

  return (
    <div className="min-h-screen flex" style={{ background: BG.page, fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>

      {/* ── Main panel ── */}
      <div className="flex-1 flex flex-col px-8 lg:px-20 py-12 relative">

        {/* Top-right corner */}
        <div className="absolute top-10 right-10 z-10">
          {step > 0 ? (
            <Logo />
          ) : (
            <button
              onClick={onSkip}
              className="transition-opacity hover:opacity-100"
              style={{ color: T.dim, fontSize: FONT.md, fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}
            >
              跳过
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step > 0 && (
          <div className="absolute top-28 left-0 right-0 px-8 lg:px-20">
            <div className="max-w-md mx-auto lg:mx-0">
              <div className="h-0.5 rounded-full" style={{ background: BG.overlay }}>
                <motion.div className="h-0.5 rounded-full bg-white"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }} />
              </div>
              <div className="flex justify-between mt-2">
                <span style={{ color: step >= 1 ? T.white : T.dim, fontSize: FONT.xs }}>位置 · 球星</span>
                <span style={{ color: step >= 2 ? T.white : T.dim, fontSize: FONT.xs }}>即战力 / 潜力股</span>
              </div>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto lg:mx-0">

            <AnimatePresence mode="wait">
              <motion.div
                key={step + (selectedPosition ? `-pos-${selectedPosition}` : "")}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >

                {/* ── Step 0 — Welcome ── */}
                {step === 0 && (
                  <div>
                    <div className="flex items-center gap-2.5 mb-14 lg:hidden">
                      <div className="w-5 h-5 rounded-full bg-white" />
                      <span style={{ color: T.white, fontSize: FONT.base, fontWeight: 700, letterSpacing: "0.18em" }}>NEXT STAR</span>
                    </div>

                    <p style={{ color: T.body, fontSize: FONT.base, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
                      Find Your Next Favorite
                    </p>
                    <h1 style={{ color: T.white, fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "48px" }}>
                      寻找你的<br />
                      下一位<br />
                      <span style={{ color: T.dim }}>本命球员</span>
                    </h1>

                    <button onClick={() => setStep(1)}
                      className="group flex items-center gap-3 transition-all duration-300"
                      style={{ color: T.white }}>
                      <div className="w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:border-white"
                        style={{ borderColor: T.label }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                          className="transition-colors duration-300 group-hover:[&_path]:stroke-black">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: FONT.lg, fontWeight: 500 }}>开始探索</span>
                    </button>
                  </div>
                )}

                {/* ── Step 1 — Position → Star Players ── */}
                {step === 1 && (
                  <div>
                    {/* Phase A: Position Selection */}
                    {!selectedPosition && (
                      <div>
                        <h2 style={{ color: T.white, fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "28px" }}>
                          你最享受观看哪个位置？
                        </h2>
                        <div className="flex flex-col gap-2.5">
                          {Object.entries(POSITION_LABELS).map(([code, label]) => (
                            <button key={code} onClick={() => setSelectedPosition(code)}
                              className="flex items-center justify-between p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                              style={{
                                background: BG.subtle,
                                border: "1px solid rgba(255,255,255,0.07)",
                              }}>
                              <div style={{ color: T.white, fontSize: "18px", fontWeight: 600 }}>{label}</div>
                              <div className="w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200"
                                style={{ borderColor: T.ghost }}>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                  <path d="M5 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Phase B: Star Player Selection */}
                    {selectedPosition && (
                      <div>
                        <button onClick={() => { setSelectedPosition(""); setSelectedStarPlayers([]); }}
                          style={{ color: T.dim, fontSize: FONT.base, marginBottom: "16px" }}
                          className="hover:text-white transition-colors duration-200">
                          ← 返回重选位置
                        </button>

                        <h2 style={{ color: T.white, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "8px" }}>
                          选择你喜爱的{POSITION_LABELS[selectedPosition]}球星
                        </h2>

                        <div className="grid grid-cols-2 gap-2.5">
                          {(STAR_PLAYERS[selectedPosition] || []).map(p => {
                            const sel = selectedStarPlayers.includes(p.id);
                            return (
                              <button key={p.id} onClick={() => setSelectedStarPlayers(sel ? [] : [p.id])}
                                className="text-left p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                  background: sel ? BG.overlay : BG.hover,
                                  border: sel ? "1px solid rgba(255,255,255,0.4)" : B.subtle,
                                }}>
                                <div style={{ color: T.label, fontSize: FONT.xs, marginBottom: "4px" }}>{p.en}</div>
                                <div style={{ color: sel ? T.white : T.body, fontSize: FONT.md, fontWeight: 500 }}>{p.name}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Step 2 — Polished vs Raw ── */}
                {step === 2 && (
                  <div>
                    <h2 style={{ color: T.white, fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
                      你更看重哪种特质？
                    </h2>
                    <p style={{ color: T.label, fontSize: FONT.sm, marginBottom: "32px", lineHeight: 1.6 }}>
                      这会影响算法推荐——即战力偏向成熟度高、即插即用的球员，潜力股偏向天花板高、仍需打磨的新星
                    </p>

                    <div className="flex flex-col gap-3">
                      <button onClick={() => setPolishedType("polished")}
                        className="text-left p-6 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background: polishedType === "polished" ? "rgba(41,151,255,0.12)" : BG.subtle,
                          border: polishedType === "polished" ? "1px solid #2997ff" : "1px solid rgba(255,255,255,0.07)",
                        }}>
                        <div className="flex items-center gap-3 mb-2">
                          <span style={{ fontSize: "24px" }}>⚡</span>
                          <span style={{ color: T.white, fontSize: "20px", fontWeight: 600 }}>即战力</span>
                        </div>
                        <p style={{ color: T.label, fontSize: FONT.sm, lineHeight: 1.5 }}>
                          技术成熟、比赛阅读能力强，进入联盟即可做出贡献
                        </p>
                      </button>

                      <button onClick={() => setPolishedType("raw")}
                        className="text-left p-6 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background: polishedType === "raw" ? "rgba(191,90,242,0.12)" : BG.subtle,
                          border: polishedType === "raw" ? "1px solid #bf5af2" : "1px solid rgba(255,255,255,0.07)",
                        }}>
                        <div className="flex items-center gap-3 mb-2">
                          <span style={{ fontSize: "24px" }}>💎</span>
                          <span style={{ color: T.white, fontSize: "20px", fontWeight: 600 }}>潜力股</span>
                        </div>
                        <p style={{ color: T.label, fontSize: FONT.sm, lineHeight: 1.5 }}>
                          身体天赋出众、发展空间巨大，上限可能更高但需要时间打磨
                        </p>
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {step > 0 && (
              <div className="flex items-center justify-between mt-12">
                <button onClick={() => { setStep(s => s - 1); if (step === 2) setPolishedType(null); }}
                  style={{ color: T.dim, fontSize: FONT.md }}
                  className="hover:text-white transition-colors duration-200">
                  ← 返回
                </button>
                <button
                  onClick={() => {
                    if (step < 2) setStep(s => s + 1);
                    else onComplete({
                      selectedPosition,
                      selectedStarPlayers,
                      polishedType,
                    });
                  }}
                  disabled={!canNext}
                  className="px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: canNext ? T.white : BG.overlay,
                    color: canNext ? BG.page : T.ghost,
                    fontSize: FONT.md,
                    fontWeight: 600,
                  }}>
                  {step === 2 ? "生成篮球DNA" : "继续"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
