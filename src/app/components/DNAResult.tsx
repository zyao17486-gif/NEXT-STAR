import { motion } from "motion/react";
import type { DNADimensions } from "../../utils/dna-engine";
import { T, BG, B, FONT } from "../../styles/design-tokens";

interface DNAResultProps {
  onContinue: () => void;
  dnaData: {
    dimensions: DNADimensions;
    description: string;
    positionProfile: string;
    polishedType: "polished" | "upside";
  } | null;
}

export function DNAResult({ onContinue, dnaData }: DNAResultProps) {
  // Build ordered dimension array for rendering
  const DIMS = dnaData ? [
    dnaData.dimensions.finishing,
    dnaData.dimensions.shooting,
    dnaData.dimensions.playmaking,
    dnaData.dimensions.defense,
    dnaData.dimensions.athleticism,
    dnaData.dimensions.rebounding,
  ] : [];

  return (
    <div className="min-h-screen flex" style={{ background: BG.page, fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      {/* Left text */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-20">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <p style={{ color: T.dim, fontSize: FONT.sm, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "20px" }}>
            {dnaData ? "AI 分析完成" : "正在分析..."}
          </p>
          <h1 style={{ color: T.white, fontSize: "clamp(52px, 7vw, 96px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.95, marginBottom: "40px" }}>
            你的<br />篮球<br />
            <span style={{ color: T.hint }}>DNA</span>
          </h1>

          {/* Dynamic Dimensions */}
          <div className="space-y-6 mb-12">
            {DIMS.map((d, i) => (
              <motion.div key={d.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }}>
                <div className="flex justify-between mb-2">
                  <span style={{ color: T.label, fontSize: FONT.base }}>{d.label}</span>
                  <span style={{ color: T.white, fontSize: FONT.base, fontWeight: 500 }}>{d.value}</span>
                </div>
                <div className="h-px" style={{ background: BG.overlay }}>
                  <motion.div className="h-px" style={{ background: T.white }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fallback if no data */}
          {!dnaData && (
            <div className="space-y-6 mb-12">
              {["终结能力", "投篮能力", "组织能力", "防守能力", "运动天赋", "篮板能力"].map((label, i) => (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: FONT.base }}>{label}</span>
                    <span style={{ color: T.label, fontSize: FONT.base }}>计算中...</span>
                  </div>
                  <div className="h-px" style={{ background: BG.overlay }}>
                    <motion.div className="h-px" style={{ background: T.label }}
                      animate={{ width: ["20%", "60%", "40%", "80%", "50%", "35%"][i] }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 1.5, repeat: Infinity, repeatType: "reverse" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <button onClick={onContinue}
              className="group flex items-center gap-3 transition-all duration-300"
              style={{ color: T.white }}>
              <div className="w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:bg-white"
                style={{ borderColor: T.label }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:[&_path]:stroke-black">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: FONT.lg, fontWeight: 500 }}>查看我的推荐球员</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}
