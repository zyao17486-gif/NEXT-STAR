import { motion } from "motion/react";
import { fuse13Dto5, type FusedGroup } from "../../utils/dna-engine";
import { T, BG, FONT } from "../../styles/design-tokens";

interface DNAResultProps {
  onContinue: () => void;
  dnaData: {
    dimensions: Record<string, { label: string; value: number }>;
    description: string;
    positionProfile: string;
  } | null;
}

/** Build fused groups from dnaData dimensions (or null → loading skeleton) */
function buildGroups(dnaData: DNAResultProps["dnaData"]): FusedGroup[] | null {
  if (!dnaData) return null;
  const attrs: Record<string, number> = {};
  for (const [k, v] of Object.entries(dnaData.dimensions)) {
    attrs[k] = v.value;
  }
  return fuse13Dto5(attrs);
}

// Loading skeleton placeholders — match the 6-group structure
const SKELETON_GROUPS: FusedGroup[] = [
  { key: "finish",   label: "终结", value: 72, subKeys: [], color: "#2997ff" },
  { key: "shooting", label: "投射", value: 65, subKeys: [], color: "#30d158" },
  { key: "playmake", label: "组织", value: 78, subKeys: [], color: "#ffd60a" },
  { key: "defense",  label: "防守", value: 60, subKeys: [], color: "#ff453a" },
  { key: "physical", label: "身体", value: 70, subKeys: [], color: "#ffffff" },
  { key: "rebound",  label: "篮板", value: 65, subKeys: [], color: "#bf5af2" },
];

export function DNAResult({ onContinue, dnaData }: DNAResultProps) {
  const groups = buildGroups(dnaData);
  const displayGroups = groups || SKELETON_GROUPS;
  const isLoading = !dnaData;

  return (
    <div className="min-h-screen flex" style={{ background: BG.page, fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      {/* Left text */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-20">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <p style={{ color: T.dim, fontSize: FONT.sm, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "20px" }}>
            {isLoading ? "正在分析..." : "AI 分析完成"}
          </p>
          <h1 style={{ color: T.white, fontSize: "clamp(52px, 7vw, 96px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.95, marginBottom: "40px" }}>
            你的<br />篮球<br />
            <span style={{ color: T.hint }}>DNA</span>
          </h1>

          {/* Grouped Bars — label + bar only, no values, no subKeys */}
          <div className="space-y-5 mb-10">
            {displayGroups.map((g, i) => (
              <motion.div key={g.key}
                initial={{ opacity: 0, x: -20 }}
                animate={isLoading ? { opacity: [0.4, 1, 0.4] } : { opacity: 1, x: 0 }}
                transition={isLoading
                  ? { delay: i * 0.1, duration: 1.5, repeat: Infinity, repeatType: "reverse" as const }
                  : { delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}>
                {/* Label */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                  <span style={{ color: T.white, fontSize: FONT.sm, fontWeight: 500 }}>{g.label}</span>
                </div>
                {/* Bar */}
                <div className="h-2 rounded-full overflow-hidden" style={{ background: BG.overlay }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: g.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${g.value}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* DNA description text */}
          {dnaData && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ color: T.label, fontSize: FONT.sm, lineHeight: 1.7, marginBottom: "32px", maxWidth: "460px" }}>
              {dnaData.description}
            </motion.p>
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
