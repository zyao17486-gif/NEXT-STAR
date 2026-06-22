import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { T, BG, B, FONT } from "../../styles/design-tokens";

type TourStep = "step1-hamburger" | "step2-scout" | "step3-ai";

interface TourGuideProps {
  step: TourStep | "done";
  onAdvance: () => void;
  onDismiss: () => void;
  onNavigate?: (page: string) => void;
}

const STEPS: Record<TourStep, {
  target: string;
  title: string;
  body: string;
  position: "below" | "right";
  buttonLabel?: string;
}> = {
  "step1-hamburger": {
    target: "hamburger",
    title: "👋 从这里开始",
    body: "点击左上角菜单按钮，发现更多功能",
    position: "below",
  },
  "step2-scout": {
    target: "scout-nav",
    title: "🔍 探索球探台",
    body: "在球探台可以搜寻 NCAA 潜力股、高中明星和国际新秀",
    position: "right",
    buttonLabel: "前往球探台 →",
  },
  "step3-ai": {
    target: "ai-toggle",
    title: "🪄 试试 AI 球探",
    body: "开启 AI 模式，用自然语言描述你想要的球员类型，AI 为你精准匹配",
    position: "below",
  },
};

/** Find a target element by data-tour attribute and return its bounding rect */
function getTargetRect(target: string): DOMRect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function TourGuide({ step, onAdvance, onDismiss, onNavigate }: TourGuideProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const active = (step !== "done");
  const info = STEPS[step as TourStep];

  // Re-measure on step change or resize (handles sidebar open/close)
  useEffect(() => {
    if (!active) return;
    const measure = () => setRect(getTargetRect(info.target));
    measure();
    // Delay to allow sidebar animation to finish
    const t1 = setTimeout(measure, 350);
    const t2 = setTimeout(measure, 700);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step, info?.target, active]);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  // Desktop skips hamburger step (sidebar always visible) — use effect, not render
  useEffect(() => {
    if (isDesktop && step === "step1-hamburger") {
      onAdvance();
    }
  }, [isDesktop, step]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[80]"
          style={{
            background: "rgba(0,0,0,0.72)",
            fontFamily: "'Noto Sans SC', 'Inter', sans-serif",
          }}
          onClick={onDismiss}
        >
          {/* Spotlight cutout — render a glowing border around the target */}
          {rect && (
            <div
              className="fixed rounded-xl transition-all duration-500"
              style={{
                left: rect.left - 6,
                top: rect.top - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.72), 0 0 20px rgba(255,215,0,0.35)",
                borderRadius: "14px",
                pointerEvents: "none",
                zIndex: 81,
              }}
            />
          )}

          {/* Tooltip card */}
          {rect && info && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="fixed z-[82] pointer-events-auto mx-4"
              style={{
                ...(info.position === "below"
                  ? {
                      left: Math.max(16, Math.min(rect.left + rect.width / 2, window.innerWidth - 256)),
                      top: rect.bottom + 14,
                    }
                  : {
                      left: Math.min(rect.right + 14, window.innerWidth - 280),
                      top: Math.max(60, rect.top),
                    }),
                maxWidth: "280px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="p-5 rounded-2xl"
                style={{ background: BG.raised, border: B.card }}
              >
                {/* Arrow pointing up (for "below" position) */}
                {info.position === "below" && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      top: "-8px",
                      width: 0, height: 0,
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderBottom: `8px solid ${BG.raised}`,
                    }}
                  />
                )}
                {/* Arrow pointing left (for "right" position) */}
                {info.position === "right" && (
                  <div
                    className="absolute top-6"
                    style={{
                      left: "-8px",
                      width: 0, height: 0,
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                      borderRight: `8px solid ${BG.raised}`,
                    }}
                  />
                )}

                <h3 style={{ color: T.white, fontSize: FONT.lg, fontWeight: 600, marginBottom: "6px" }}>
                  {info.title}
                </h3>
                <p style={{ color: T.label, fontSize: FONT.base, lineHeight: 1.65, marginBottom: "16px" }}>
                  {info.body}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={onDismiss}
                    style={{ color: T.dim, fontSize: FONT.sm }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    跳过
                  </button>
                  <div className="flex items-center gap-2">
                    {/* Step indicators */}
                    <div className="flex gap-1.5 mr-2">
                      {(["step1-hamburger", "step2-scout", "step3-ai"] as TourStep[]).map((s, i) => (
                        <div
                          key={s}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: s === step ? "16px" : "6px",
                            height: "6px",
                            background: s === step ? T.accent : "rgba(255,255,255,0.15)",
                          }}
                        />
                      ))}
                    </div>
                    {step === "step2-scout" && onNavigate ? (
                      <button
                        onClick={() => {
                          onNavigate("scout");
                          setTimeout(onAdvance, 400);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ background: T.accent, color: "#000" }}
                      >
                        {info.buttonLabel || "下一步 →"}
                      </button>
                    ) : (
                      <button
                        onClick={onAdvance}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ background: T.accent, color: "#000" }}
                      >
                        {step === "step3-ai" ? "完成 🎉" : "下一步 →"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
