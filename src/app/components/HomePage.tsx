import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import draftDB from "../../data/2026-draft-database.json";
import { T, BG, B, FONT } from "../../styles/design-tokens";

const POS_CN: Record<string, string> = {
  PG: "控卫", SG: "得分后卫", SF: "小前锋", PF: "大前锋", C: "中锋",
};

// ── Real-time date & draft countdown ──────────────────────────────────
function useRealtimeDate() {
  return useMemo(() => {
    const now = new Date();
    const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日，${days[now.getDay()]}`;
    // 2026 NBA Draft: June 25, 2026 (approximate)
    const draftDate = new Date(2026, 5, 25); // Month is 0-indexed
    const diffMs = draftDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return { dateStr, daysLeft };
  }, []);
}

// Hardcoded real draft news — subtitle shown on card, full content in article page
const FEED = [
  {
    id: 1,
    title: "2026年NBA模拟选秀：AJ·迪班萨锁定状元，杨百翰前锋体测数据炸裂",
    source: "ESPN",
    url: "https://www.espn.com/nba/draft/bestavailable",
    subtitle: "联合试训后，这位6尺9寸的侧翼以罕见的三威胁能力稳坐榜首。",
    content: "在NBA联合试训结束后，AJ·迪班萨的状元地位比以往任何时候都更加稳固。这位杨百翰大学的大一新生以6英尺9英寸（约206厘米）的身高和7英尺（约213厘米）的臂展亮相，更令人震惊的是他展现出的后卫级横移速度——这在同身高球员中极为罕见。\n\n迪班萨的大一赛季数据本身就足够有说服力：场均23.4分、6.1个篮板、3.8次助攻，领跑NCAA得分榜。但球探们更看重的是他创造出手的能力。根据Synergy数据统计，迪班萨的自主创造得分占比高达76%，在挡拆中每回合得分位列第87百分位，背身单打更是达到第94百分位。这意味着他不需要体系支撑就能创造高质量进攻——这是NBA球队对状元秀的核心期待。\n\n'他让我想起年轻时的特雷西·麦克格雷迪，'一位东部球队的高级球探在试训后告诉ESPN，'同样的身高臂展，同样的三威胁流畅性，但迪班萨的防守意愿更强。他的上限取决于投篮稳定性和持续进步的控运技术。'\n\n目前持有状元签的球队尚未透露倾向，但联盟消息人士普遍认为迪班萨是板上钉钉的选择。唯一可能撼动这一地位的变量是某支球队对达林·彼得森或卡梅隆·布泽尔的特殊偏好——但这在现阶段看来可能性较低。\n\n迪班萨本人对状元身份表现得相当淡然：'我只是想找到最适合我发展的球队。选秀顺位只是一个数字，真正重要的是谁愿意在你身上投资，以及你愿意为谁付出一切。'",
    time: "2 天前",
    likes: 1286,
  },
  {
    id: 2,
    title: "卡梅隆·布泽尔：杜克冠军基因能否复刻父亲辉煌？",
    source: "The Athletic",
    url: "https://theathletic.com/nba/draft/",
    subtitle: "大一即率队夺冠，技术成熟的古典前锋稳居前五，唯一疑问是上限。",
    content: "在杜克大学的冠军庆典还未完全散去之时，卡梅隆·布泽尔已经在为下一个篇章做准备。作为前NBA全明星卡洛斯·布泽尔之子，这位6英尺9英寸的前锋以大一新生身份带领杜克夺得全国冠军，并荣膺全美年度最佳球员——场均22.4分、9.1个篮板、4.1次助攻的数据单令人印象深刻。\n\n但布泽尔最让球探着迷的不是任何一项数据，而是他近乎反常的成熟度。在NCAA锦标赛对阵北卡的比赛中，他在最后两分钟面对双人包夹连续送出三次精准分球，帮助队友命中关键三分——这种在高压下的决策能力通常需要三到四年的NBA经验才能培养。杜克主教练评价他'是我执教过的最聪明的球员之一，他对比赛的理解超越了年龄'。\n\n关于布泽尔的讨论焦点是他的上限。批评者指出他缺乏顶级弹跳力，是一名'篮筐以下终结者'，面对长人防守时早期表现挣扎。三分命中率39%虽然可观，但出手速度偏慢，在NBA级别的防守轮转中可能受限。\n\n'他不是那种会让你惊叹运动天赋的球员，'The Athletic的选秀分析师Sam Vecenie写道，'但他做的每一件事都是正确的。布泽尔是本届最安全的选择——你选他，你得到一个十年首发。问题是你想要安全牌，还是赌一个可能更高但风险也更大的选择。'\n\n布泽尔本人很清楚外界的评价：'我的父亲教会我最重要的事就是——人们总在讨论天花板有多高，但没人讨论地板有多稳。如果你不能留在场上，天花板毫无意义。'",
    time: "4 天前",
    likes: 943,
  },
  {
    id: 3,
    title: "达林·彼得森伤病更新：腿筋已康复，将参加多支球队单独试训",
    source: "Bleacher Report",
    url: "https://bleacherreport.com/nba-draft",
    subtitle: '医疗许可通过，投篮动作被誉为"本届最干净"，健康是唯一变数。',
    content: "经过长达四个月的等待，达林·彼得森的经纪人向Bleacher Report确认，这位堪萨斯大学后卫的腿筋伤势已经完全康复，医疗团队已为他开出了'完全参与篮球活动'的许可。彼得森将在接下来的两周内参加至少五支乐透球队的单独试训，包括目前持有前五顺位选秀权的几支球队。\n\n这对彼得森的选秀行情是一个关键转折点。他在堪萨斯的大一赛季仅出战19场比赛，场均20.1分、4.8个篮板、4.2次助攻，三分命中率高达41%。但自从腿筋问题在高中时期就反复发作以来，各队医疗组一直将他的健康标记为红色警戒。\n\n'我们已经向每支球队提供了完整的医疗记录和最新的MRI结果，'彼得森的经纪人表示，'达林过去四个月一直在迈阿密与专业训练师进行康复训练，他现在处于生涯最佳的身体状态。'\n\n投篮一直是彼得森最大的卖点。他的投篮动作被多位球探评价为'本届最干净'——高出手点、快速释放、射程覆盖NBA三分线。既能持球创造急停跳投，也能在无球掩护后接球出手。在转换进攻中，他的决策能力同样出色。\n\n一位西部球队的选秀主管在匿名条件下告诉Bleacher Report：'如果彼得森能通过我们的体检，他的纯篮球能力在2026届排名前三。他最接近的模板是德文·布克，或者控球稍弱但投篮更稳定的谢伊·吉尔杰斯-亚历山大。健康是他唯一的问号。'\n\n彼得森的试训表现将在很大程度上决定他最终花落谁家。如果他在试训中展现出伤前的爆发力与横移速度，前五顺位几乎板上钉钉。但如果任何球队在体检中发现隐患，他可能滑落到乐透末段。",
    time: "5 天前",
    likes: 672,
  },
];

interface HomePageProps {
  onNavigate: (page: string, data?: Record<string, string>) => void;
  followed: Set<string>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2.5" style={{ color: T.white, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
          <span className="inline-block w-0.5 h-4 rounded-full shrink-0" style={{ background: T.white }} />
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function HomePage({ onNavigate, followed }: HomePageProps) {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const { dateStr, daysLeft } = useRealtimeDate();

  // Only show prospects the user has actually followed (2026 draft DB)
  const followedProspects = [...followed]
    .map(name => {
      // 2026 Draft DB — match by English name or Chinese nameCn
      const dbp = (draftDB as typeof draftDB).find((p) => p.name === name || (p as any).nameCn === name);
      if (dbp) return { name: dbp.name, nameCn: (dbp as any).nameCn || dbp.name, pos: POS_CN[dbp.position] ?? dbp.position, draftPick: (dbp as any).draftPick as number | undefined, draftTeamCn: (dbp as any).draftTeamCn as string | undefined, isNew: true, img: dbp.img, isPolished: (dbp as any).isPolished as boolean | undefined, polishedReason: (dbp as any).polishedReason as string | undefined };
      return null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    // Deduplicate by English name
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i);

  return (
    <div style={{ fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>

      {/* ── Page header ── */}
      <div className="mb-14">
        <p style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>{dateStr}</p>
        <h1 style={{ color: T.white, fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          欢迎回来
        </h1>
        <p style={{ color: T.dim, fontSize: FONT.base, marginTop: "6px" }}>
          距2026年NBA选秀日还有{daysLeft}天
        </p>
      </div>

      {/* ── My Prospects (followed only) ── */}
      <Section title="我关注的球员">
        {followedProspects.length === 0 ? (
          <div className="py-10 flex items-center gap-3"
            style={{ color: T.ghost, fontSize: FONT.md }}>
            <span>—</span>
            <span>还没有关注任何球员，前往球探台发现你的Next Star</span>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            <AnimatePresence mode="popLayout">
              {followedProspects.map((p, i) => (
                <motion.button
                  key={p.name}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onNavigate("player", { name: p.name })}
                  className="group shrink-0 rounded-2xl p-5 transition-all duration-200 hover:bg-white/[0.03]"
                  style={{ width: "200px", background: BG.card, border: B.card }}>
                  {/* Draft pick */}
                  {p.draftPick && (
                    <div className="mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: BG.overlay, color: T.label, letterSpacing: "0.04em" }}>
                        #{p.draftPick} 2026
                      </span>
                    </div>
                  )}
                  <div style={{ color: T.white, fontSize: FONT.lg, fontWeight: 600, marginBottom: "4px", lineHeight: 1.3 }}>
                    {(p as any).nameCn || p.name}
                  </div>
                  <div style={{ color: T.dim, fontSize: FONT.sm, fontFamily: "'Inter', sans-serif" }}>
                    {p.name !== ((p as any).nameCn || p.name) ? p.name : ""} {p.pos}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Section>

      {/* ── Main two-column ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-10">

        {/* Feed + Videos */}
        <div>
          <Section title="球员热度">
            <div className="rounded-2xl overflow-hidden" style={{ border: B.card }}>
              {FEED.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="p-6 group transition-colors duration-150"
                  style={{ background: BG.card, borderBottom: i < FEED.length - 1 ? B.divider : "none" }}>
                  {/* Source + time */}
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.06em" }}>{item.source}</span>
                    <span style={{ color: T.hint, fontSize: FONT.xs, flexShrink: 0 }}>{item.time}</span>
                  </div>
                  {/* Article title — in-app page */}
                  <button
                    onClick={() => onNavigate("article", { title: item.title, source: item.source, url: item.url, content: item.content, time: item.time, from: "home" })}
                    className="text-left block mb-2.5 transition-opacity group-hover:opacity-80"
                    style={{ color: T.white, fontSize: FONT.lg, fontWeight: 600, lineHeight: 1.45 }}>
                    {item.title}
                  </button>
                  {/* Subtitle — one-line summary */}
                  <p style={{ color: T.body, fontSize: FONT.base, lineHeight: 1.65 }}>{(item as any).subtitle || item.content.slice(0, 60) + "…"}</p>
                  {/* Heat */}
                  <div className="mt-4" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setLiked(prev => {
                        const n = new Set(prev);
                        if (n.has(item.id)) n.delete(item.id); else n.add(item.id);
                        return n;
                      })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200"
                      style={{
                        background: liked.has(item.id) ? BG.overlay : "transparent",
                        border: B.subtle,
                        color: liked.has(item.id) ? T.white : T.dim,
                        fontSize: FONT.sm,
                      }}>
                      🔥
                      <span style={{ fontSize: FONT.xs }}>{item.likes + (liked.has(item.id) ? 1 : 0)}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Video Section */}
          <Section title="精彩视频">
            <div className="py-10 text-center rounded-2xl"
              style={{ background: BG.card, border: B.card }}>
              <p style={{ color: T.ghost, fontSize: FONT.md }}>待开发</p>
            </div>
          </Section>
        </div>

        {/* Right sidebar — Stock */}
        <div>
          <Section title="球员Stock">
            <div className="py-10 text-center rounded-2xl"
              style={{ background: BG.card, border: B.card }}>
              <p style={{ color: T.ghost, fontSize: FONT.md }}>待开发</p>
            </div>
          </Section>
        </div>

      </div>
    </div>
  );
}
