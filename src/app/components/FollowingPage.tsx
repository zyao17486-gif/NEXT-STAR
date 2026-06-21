import { motion, AnimatePresence } from "motion/react";
import draftDB from "../../data/2026-draft-database.json";
import { T, BG, B, FONT } from "../../styles/design-tokens";

const POS_MAP_FOLLOW: Record<string, string> = {
  PG: "控卫", SG: "得分后卫", SF: "小前锋", PF: "大前锋", C: "中锋",
};

/** Unified player card lookup: old 6-player data first, then 2026 draft DB */
export function lookupPlayerCard(name: string) {
  // Old mock data (Chinese names)
  if (ALL_PROSPECTS[name]) return ALL_PROSPECTS[name];
  // 2026 Draft DB (English names)
  const dbp = (draftDB as typeof draftDB).find((p) => p.name === name);
  if (dbp) {
    return {
      name: (dbp as any).nameCn || dbp.name,
      en: dbp.name,
      pos: POS_MAP_FOLLOW[dbp.position] ?? dbp.position,
      school: dbp.team,
      rank: dbp.id,
      projection: "2026 NBA Draft",
      img: dbp.img,
    };
  }
  return null;
}

// All searchable prospects with enough data to render a card
export const ALL_PROSPECTS: Record<string, {
  name: string; en: string; pos: string; school: string;
  rank: number; projection: string; img: string;
}> = {
  "迪伦·哈珀": { name: "迪伦·哈珀", en: "Dylan Harper", pos: "控卫", school: "罗格斯大学", rank: 2, projection: "#2 顺位", img: "https://images.unsplash.com/photo-1590227632180-80a3bf110871?w=400&h=500&fit=crop&auto=format&q=80" },
  "艾斯·贝利": { name: "艾斯·贝利", en: "Ace Bailey", pos: "小前锋", school: "罗格斯大学", rank: 4, projection: "前5顺位", img: "https://images.unsplash.com/photo-1569731683228-5e7850ae0034?w=400&h=500&fit=crop&auto=format&q=80" },
  "诺亚·埃森格": { name: "诺亚·埃森格", en: "Noa Essengue", pos: "小前锋", school: "乌尔姆（德国）", rank: 13, projection: "前15顺位", img: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400&h=500&fit=crop&auto=format&q=80" },
  "布吉·弗兰德": { name: "布吉·弗兰德", en: "Boogie Fland", pos: "控卫", school: "阿肯色大学", rank: 9, projection: "前10顺位", img: "https://images.unsplash.com/photo-1519432473078-0151c4f90335?w=400&h=500&fit=crop&auto=format&q=80" },
  "VJ 埃吉科姆": { name: "VJ 埃吉科姆", en: "VJ Edgecombe", pos: "得分后卫", school: "贝勒大学", rank: 3, projection: "前5顺位", img: "https://images.unsplash.com/photo-1551330299-5b92e951b570?w=400&h=500&fit=crop&auto=format&q=80" },
  "卡斯帕拉斯·雅库奇奥尼斯": { name: "卡斯帕拉斯·雅库奇奥尼斯", en: "Kasparas Jakucionis", pos: "控卫", school: "伊利诺伊大学", rank: 17, projection: "前20顺位", img: "https://images.unsplash.com/photo-1587296101198-67dcc4fe72f8?w=400&h=500&fit=crop&auto=format&q=80" },
};

interface FollowingPageProps {
  followed: Set<string>;
  onToggleFollow: (name: string) => void;
  onSelectPlayer: (name: string) => void;
}

export function FollowingPage({ followed, onToggleFollow, onSelectPlayer }: FollowingPageProps) {
  const followedList = [...followed]
    .map(name => lookupPlayerCard(name))
    .filter(Boolean);

  return (
    <div style={{ fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="mb-10">
        <h1 style={{ color: T.white, fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "6px" }}>
          关注
        </h1>
        <p style={{ color: T.label, fontSize: FONT.lg }}>
          {followed.size > 0
            ? `你正在关注 ${followed.size} 位球员`
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
                  {/* Rank badge */}
                  <div className="mb-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: BG.overlay, color: T.body }}>
                      #{p.rank}
                    </span>
                  </div>
                  {/* Name */}
                  <div style={{ color: T.white, fontSize: FONT.lg, fontWeight: 600, marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ color: T.hint, fontSize: FONT.sm, marginBottom: "8px", fontFamily: "'Inter', sans-serif" }}>
                    {p.en !== p.name ? p.en : ""}
                  </div>
                  {/* Meta */}
                  <div style={{ color: T.body, fontSize: FONT.sm }}>{p.pos} · {p.school}</div>
                  {p.projection && p.projection !== "2026 NBA Draft" && (
                    <div style={{ color: T.label, fontSize: FONT.sm, marginTop: "4px" }}>{p.projection}</div>
                  )}
                </button>

                {/* Unfollow button — top right */}
                <button
                  onClick={() => onToggleFollow(p.name)}
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
