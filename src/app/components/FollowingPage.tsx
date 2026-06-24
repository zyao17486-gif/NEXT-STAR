import { motion, AnimatePresence } from "motion/react";
import draftDB from "../../data/2026-draft-database.json";
import { T, BG, B, FONT } from "../../styles/design-tokens";

const POS_MAP_FOLLOW: Record<string, string> = {
  PG: "控卫", SG: "得分后卫", SF: "小前锋", PF: "大前锋", C: "中锋",
};

/** Player card lookup from 2026 draft DB (by English or Chinese name) */
export function lookupPlayerCard(name: string) {
  const dbp = (draftDB as typeof draftDB).find(
    (p) => p.name === name || (p as any).nameCn === name
  );
  if (dbp) {
    return {
      name: (dbp as any).nameCn || dbp.name,
      en: dbp.name,
      pos: POS_MAP_FOLLOW[dbp.position] ?? dbp.position,
      school: dbp.team,
      draftPick: (dbp as any).draftPick as number | undefined,
      draftTeamCn: (dbp as any).draftTeamCn as string | undefined,
      projection: "2026 NBA Draft",
      img: (dbp as any).img,
    };
  }
  return null;
}

interface FollowingPageProps {
  followed: Set<string>;
  onToggleFollow: (name: string) => void;
  onSelectPlayer: (name: string) => void;
}

export function FollowingPage({ followed, onToggleFollow, onSelectPlayer }: FollowingPageProps) {
  const followedList = [...followed]
    .map(name => lookupPlayerCard(name))
    .filter(Boolean)
    // Deduplicate by English name — two stored keys may resolve to the same player
    .filter((p, i, arr) => arr.findIndex(x => x!.en === p!.en) === i);

  return (
    <div style={{ fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="mb-10">
        <h1 style={{ color: T.white, fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "8px" }}>
          关注
        </h1>
        <p style={{ color: T.label, fontSize: FONT.base }}>
          {followedList.length > 0
            ? `你正在关注 ${followedList.length} 位球员`
            : "还没有关注任何球员"}
        </p>
      </div>

      {/* Empty state */}
      <AnimatePresence>
        {followedList.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <div className="mb-4" style={{ color: BG.overlay, fontSize: "64px", lineHeight: 1 }}>○</div>
            <p style={{ color: T.ghost, fontSize: FONT.lg, textAlign: "center", lineHeight: 1.7 }}>
              从主页、球探台或球员详情页<br />点击「关注」添加球员
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player grid */}
      {followedList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {followedList.map((p, i) => (
              <motion.div
                key={p.name}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.22 } }}
                transition={{ duration: 0.32, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group relative rounded-2xl p-5 transition-all duration-200 hover:bg-white/[0.03]"
                style={{ background: BG.card, border: B.card }}
              >
                <button onClick={() => onSelectPlayer(p.name)} className="w-full text-left">
                  {/* Draft pick badge */}
                  {p.draftPick && (
                    <div className="mb-3">
                      <span className="px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: BG.overlay, color: T.label, fontSize: FONT.xs, letterSpacing: "0.04em" }}>
                        #{p.draftPick} {p.draftTeamCn} · 2026
                      </span>
                    </div>
                  )}
                  {/* Name */}
                  <div style={{ color: T.white, fontSize: FONT.lg, fontWeight: 600, marginBottom: "4px", lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ color: T.hint, fontSize: FONT.sm, marginBottom: "8px", fontFamily: "'Inter', sans-serif" }}>
                    {p.en !== p.name ? p.en : ""}
                  </div>
                  {/* Meta */}
                  <div style={{ color: T.dim, fontSize: FONT.sm }}>{p.pos} · {p.school}</div>
                  {p.projection && p.projection !== "2026 NBA Draft" && (
                    <div style={{ color: T.label, fontSize: FONT.xs, marginTop: "4px" }}>{p.projection}</div>
                  )}
                </button>

                {/* Unfollow button — top right */}
                <button
                  onClick={() => {
                    // Find the exact stored name to correctly remove it
                    const stored = [p.en, p.name].find(n => followed.has(n));
                    onToggleFollow(stored || p.en);
                  }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  style={{ background: BG.overlay, border: "1px solid rgba(255,255,255,0.15)" }}
                  title="取消关注"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
