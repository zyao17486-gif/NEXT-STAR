import { useState } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell } from "recharts";

// V2: 20-player 2026 draft database for AI Scout result profiles
import draftDB from "../../data/2026-draft-database.json";
import { fuse13Dto5 } from "../../utils/dna-engine";
import { T, BG, B, FONT } from "../../styles/design-tokens";

type DraftPlayer = typeof draftDB[number];

const POS_MAP: Record<string, string> = {
  PG: "控卫", SG: "得分后卫", SF: "小前锋", PF: "大前锋", C: "中锋",
};

// ── Tag → Chinese translation map ──────────────────────────────────────────
const TAG_CN: Record<string, string> = {
  "three-level scorer": "三威胁得分手",
  "foul drawer": "造犯规高手",
  "midrange assassin": "中距离杀手",
  "helio-wing": "持球大核心侧翼",
  "transition threat": "转换进攻威胁",
  "upside swing": "上限极高",
  "polished scorer": "技术全面得分手",
  "elite shooter": "精英射手",
  "combo guard": "双能卫",
  "pull-up threat": "急停跳投威胁",
  "injury risk": "伤病隐患",
  "high floor": "高下限",
  "high IQ": "高球商",
  "stretch big": "空间型内线",
  "passing hub": "策应中枢",
  "polished": "技术成熟",
  "winner": "赢家基因",
  "safe pick": "安全选择",
  "explosive athlete": "爆发力惊人",
  "stocks generator": "防守数据机器",
  "rebounding motor": "篮板狂人",
  "transition weapon": "快攻利器",
  "raw defender": "防守待打磨",
  "two-way upside": "双向潜力",
  "boom-or-bust": "高风险高回报",
  "tools-rich": "天赋满满",
  "stretch forward": "空间型前锋",
  "raw frame": "身体待发育",
  "defensive versatility": "防守多面性",
  "high ceiling": "上限极高",
  "crafty handler": "技巧型控球",
  "pick-and-roll maestro": "挡拆大师",
  "steady leader": "稳健领袖",
  "change of pace": "节奏变换",
  "high floor PG": "高下限控卫",
  "speed demon": "速度狂魔",
  "paint toucher": "禁区攻击手",
  "offensive engine": "进攻发动机",
  "defensive liability": "防守漏洞",
  "sixth man upside": "第六人潜力",
  "freak athlete": "天赋怪",
  "defensive pest": "防守搅局者",
  "slashing guard": "突破型后卫",
  "vertical pop": "弹跳爆发力",
  "two-way energy": "双向能量",
  "floor spacer": "空间拉开者",
  "off-movement threat": "跑动投篮威胁",
  "catch-and-shoot": "接球就投",
  "role player": "角色球员",
  "instant impact": "即战力",
  "bully ball": "碾压式打法",
  "tweener": "不三不四",
  "physical forward": "身体流前锋",
  "shooting question mark": "投篮存疑",
  "high production": "高产高效",
  "freak length": "臂展怪兽",
  "lob threat": "空接威胁",
  "rim runner": "顺下终结者",
  "offensive rebounder": "进攻篮板手",
  "shot-blocking question": "护框存疑",
  "tools project": "天赋项目",
  "power guard": "力量型后卫",
  "two-way physicality": "双向对抗",
  "explosive leaper": "爆发力弹跳",
  "bully driver": "碾压突破",
  "rotation piece": "轮换拼图",
  "combine riser": "体测赢家",
  "freak wingspan": "臂展怪物",
  "3-and-D prototype": "3D 原型",
  "raw tools": "原始天赋",
  "defensive stopper": "防守大闸",
  "raw offensively": "进攻待开发",
  "All-Defense upside": "防阵潜力",
  "combine winner": "联合试训赢家",
  "championship DNA": "冠军基因",
  "defensive anchor": "防守支柱",
  "emerging shooter": "投篮觉醒",
  "high motor": "拼劲十足",
  "dirty work": "蓝领苦力",
  "international prospect": "国际新秀",
  "guard skills": "后卫技术",
  "professional experience": "职业联赛经验",
  "high feel": "球感出色",
  "young prospect": "年轻潜力股",
  "energy wing": "活力侧翼",
  "3-and-D hopeful": "3D 潜力股",
  "straight-line driver": "直线突破手",
  "genetic outlier": "基因怪物",
  "historic length": "历史级臂展",
  "rim presence": "禁区存在感",
  "mobility concern": "移动隐患",
  "situational big": "场景型中锋",
  "national champion": "全国冠军",
  "rim protector": "护框者",
  "rebounding specialist": "篮板专家",
  "traditional center": "传统中锋",
  "medical risk": "伤病风险",
  "non-shooter": "无射程",
  "shooting specialist": "投篮专家",
  "NBA bloodline": "NBA 血统",
  "bucket getter": "得分机器",
  "instant offense": "即插即用得分",
  "vert surprise": "弹跳惊喜",
  "MOP": "MOP",
  "elite defender": "精英防守者",
  "switchable": "无限换防",
  "pro-ready": "即战力",
  "age concern": "年龄顾虑",
  "movement shooter": "跑动射手",
  "high efficiency": "高效",
  "low turnovers": "低失误",
  "off-ball": "无球打法",
  "microwave scorer": "微波炉得分手",
  "off-screen threat": "掩护后威胁",
  "Baby Ingram": "小英格拉姆",
  "ACC 6th Man": "ACC 最佳第六人",
  "tough shot-maker": "高难度投手",
  "D-II to Big Ten": "D-II 到 Big Ten",
  "Elite Eight": "精英八强",
  "cerebral": "球商型",
  "crafty finisher": "灵巧终结者",
  "elite efficiency": "精英效率",
  "unorthodox driver": "非典型突破",
  "3rd Team AA": "全美三阵",
  "green room": "小绿屋",
  "SEC star": "SEC 明星",
  "national champion x2": "双冠王",
  "all-time winner": "历史级赢家",
  "elite off-screen shooter": "精英掩护后射手",
  "99th percentile movement": "99% 分位跑动",
  "Sam Hauser comp": "豪瑟模板",
  "NCAA rebounding leader": "NCAA 篮板王",
  "double-double machine": "两双机器",
  "German pipeline": "德国血统",
  "one-and-done": "大一参选",
  "Sabonis comp": "萨博尼斯模板",
  "physical big": "身体流内线",
  "stretch five": "空间型五号位",
  "42% 3PT": "42% 三分",
  "Real Madrid academy": "皇马青训",
  "Estonian": "爱沙尼亚",
  "pick-and-pop": "挡拆外弹",
  "tall PG": "高个控卫",
  "Spanish ACB": "西甲 ACB",
  "EuroLeague experience": "欧冠经验",
  "draft-and-stash": "放养选项",
  "elite slasher": "精英突破手",
  "isolation scorer": "单打得分手",
  "Herb Jones comp": "赫伯特·琼斯模板",
  "All-SEC": "SEC 最佳阵容",
  "defensive playmaker": "防守组织者",
  "swing skill: shot": "关键变量：投篮",
  "elite driver": "精英突破",
  "99th percentile rim pressure": "99% 分位禁区压力",
  "ball security": "护球能力",
  "plus wingspan": "优秀臂展",
  "score-first PG": "得分优先控卫",
  "sleeper": "沉睡者",
  "analytics darling": "高阶数据宠儿",
  "steals + blocks unicorn": "抢断盖帽双修",
  "WCC 6th Man": "WCC 最佳第六人",
  "Covington comp": "科温顿模板",
  "defensive instincts": "防守直觉",
  "poor athlete": "运动能力一般",
  "future prospect": "未来潜力股",
  "transfer portal": "转校生",
  "Gatorade POY x2": "佳得乐年度最佳×2",
  "injury recovery": "伤愈复出",
  "Washington State": "华盛顿州立",
  "2027+ draft": "2027+ 选秀",
  "No. 1 recruit 2026": "2026 届第一高中生",
  "2027 draft": "2027 选秀",
  "generational talent": "世代天才",
  "Kansas commit": "堪萨斯大学",
  "LeBron/Magic comps": "詹姆斯/魔术师模板",
  "two-way star": "双向球星",
  "⚠️ DUPLICATE: see ID #3": "⚠️ 重复球员",
};

/** Parse a height string like 6'9\" or 7'0.5\" → total inches */
function parseHeightToInches(h: string): number {
  const m = h.match(/(\d+)'(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  return parseInt(m[1]) * 12 + parseFloat(m[2]);
}
/** Parse a weight string like "217 lbs" → kg */
function parseWeightToKg(w: string): number {
  const m = w.match(/(\d+)/);
  if (!m) return 0;
  return Math.round(parseInt(m[1]) / 2.205);
}

/** Extract template-reference sentence from overview text */
function extractTemplate(text: string): { overview: string; template: string | null } {
  const keywords = /(?:模板|可比拟|可比(?!赛)|对标(?!赛)|可类比|可参照|可参考|上限|下限|对比|类比|比较|式)/;
  const sentences = text.split(/(?<=。)/);
  let idx = -1;
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (keywords.test(sentences[i])) { idx = i; break; }
  }
  if (idx === -1) return { overview: text, template: null };
  const template = sentences[idx].trim();
  sentences.splice(idx, 1);
  return { overview: sentences.join("").trim() || text, template };
}

/** Adapt a 2026 Draft DB player → the shape PlayerProfile expects */
function adaptDraftPlayer(dp: DraftPlayer): PlayerData {
  const ATTR_13D_KEYS = ["身体","突破","篮下","背身","中投","三分","传球","控运","内防","外防","抢断","盖帽","篮板"];
  const attrs = dp.attributes;
  const wsInches = parseHeightToInches(dp.wingspan);
  const wtKg = parseWeightToKg(dp.weight);
  return {
    name: (dp as any).nameCn || dp.name,
    en: dp.name,
    pos: POS_MAP[dp.position] ?? dp.position,
    school: dp.team,
    schoolEn: dp.team,
    height: dp.height,
    heightMetric: `${Math.round(dp.heightInches * 2.54)} cm`,
    wingspan: dp.wingspan,
    wingspanMetric: `${Math.round(wsInches * 2.54)} cm`,
    weight: dp.weight,
    weightMetric: `${wtKg} kg`,
    birthday: "—",
    projection: "2026 NBA Draft",
    img: dp.imgHero || dp.img,
    overview: (dp as any).profile_text_cn || dp.profile_text,
    strengths: dp.tags.slice(0, 3).map(t => TAG_CN[t] || t),
    weaknesses: ["NBA 级别对抗适应", "稳定性待验证", "防守端需持续提升"],
    seasonStats: [],
    pie: ATTR_13D_KEYS.map(k => ({ key: k, value: attrs[k] ?? 50 })),
    bestTemplate: {
      name: "AI 分析中",
      desc: "使用球探台 AI 球探功能，输入\"谁最像" + dp.name + "\"获取详细模板对比。",
    },
    worstTemplate: {
      name: "AI 分析中",
      desc: "使用球探台 AI 球探功能获取风险模板分析。",
    },
    devPlan: [
      ["第一年", "适应 NBA 节奏，发挥核心优势。"],
      ["第二年", "扩大角色定位，成为稳定轮换。"],
      ["第三年", "冲击首发或第六人角色，持续成长。"],
    ] as [string, string][],
  };
}

// ── Combine measurements table for draft prospects (metric) ────────────────
/** Parse e.g. "8'10\"" → inches → cm */
function parseReachToCm(s: string): string {
  const m = s.match(/(\d+)'(\d+(?:\.\d+)?)/);
  if (!m) return s;
  const inches = parseInt(m[1]) * 12 + parseFloat(m[2]);
  return `${Math.round(inches * 2.54)} cm`;
}
/** Convert inches to cm, integer */
function inchesToCmStr(inches: number): string {
  return `${Math.round(inches * 2.54)} cm`;
}

const COMBINE_LABELS: { key: keyof DraftPlayer["combine"]; label: string; format: (v: string | number) => string }[] = [
  { key: "standingReach", label: "站立摸高", format: (v) => parseReachToCm(String(v)) },
  { key: "standingVert", label: "原地垂直起跳", format: (v) => inchesToCmStr(v as number) },
  { key: "maxVert", label: "助跑最大起跳", format: (v) => inchesToCmStr(v as number) },
  { key: "laneAgility", label: "四点移动", format: (v) => `${v}s` },
  { key: "shuttleRun", label: "折返跑", format: (v) => `${v}s` },
  { key: "threeQuarterSprint", label: "3/4 场地冲刺", format: (v) => `${v}s` },
];

function DraftCombineTable({ dp }: { dp: DraftPlayer }) {
  const c = dp.combine;
  const rows = COMBINE_LABELS.map(({ key, label, format }) => {
    const val = c[key as keyof typeof c];
    if (val === null || val === undefined) return null;
    const rankKey = (key + "Rank") as keyof typeof c;
    const rank = c[rankKey] as number | null;
    return { label, value: format(val), rank };
  }).filter(Boolean) as { label: string; value: string; rank: number | null }[];

  if (rows.length === 0) {
    return (
      <div className="py-10 text-center">
        <p style={{ color: T.body, fontSize: FONT.md }}>暂无联合试训数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: B.card }}>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: BG.raised }}>
              <th className="text-left px-4 py-3" style={{ color: T.label, fontSize: FONT.xs, fontWeight: 600, letterSpacing: "0.1em" }}>项目</th>
              <th className="text-right px-4 py-3" style={{ color: T.label, fontSize: FONT.xs, fontWeight: 600, letterSpacing: "0.1em" }}>数据</th>
              <th className="text-right px-4 py-3" style={{ color: "rgba(255,165,0,0.5)", fontSize: FONT.xs, fontWeight: 600, letterSpacing: "0.1em" }}>排名</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} style={{ background: BG.card, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-3" style={{ color: T.body, fontSize: FONT.base }}>{r.label}</td>
                <td className="text-right px-4 py-3" style={{ color: T.white, fontSize: FONT.base, fontVariantNumeric: "tabular-nums" }}>{r.value}</td>
                <td className="text-right px-4 py-3" style={{ color: r.rank ? "rgba(255,165,0,0.7)" : T.body, fontSize: FONT.base }}>
                  {r.rank ? `#${r.rank}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2" style={{ borderTop: B.divider, background: BG.card }}>
        <span style={{ color: "rgba(255,165,0,0.5)", fontSize: FONT.xs }}>橙色列为联合试训排名</span>
        <span style={{ color: T.body, fontSize: FONT.xs, marginLeft: "12px" }}>— 表示未进入排名 · 2026 NBA Draft Combine</span>
      </div>
    </div>
  );
}

type SeasonStat = {
  year: string; level: string; team: string;
  gp: number; pts: number; reb: number; ast: number;
  fg: number; three: number; ft: number; ts: number; per: number;
};

// ── Player view-model (produced by adaptDraftPlayer) ─────────────────────────
type PlayerData = {
  name: string; en: string; pos: string;
  school: string; schoolEn: string;
  height: string; heightMetric: string;
  wingspan: string; wingspanMetric: string;
  weight: string; weightMetric: string;
  birthday: string; projection: string; img: string;
  overview: string; strengths: string[]; weaknesses: string[];
  seasonStats: SeasonStat[];
  pie: { key: string; value: number }[];
  bestTemplate: { name: string; desc: string };
  worstTemplate: { name: string; desc: string };
  devPlan: [string, string][];
};

// Default fallback — first DB player, so the UI never renders empty
const DEFAULT: PlayerData = adaptDraftPlayer(draftDB[0] as DraftPlayer);

const TABS = ["概览", "数据", "AI 洞察"];

// ── School icon ────────────────────────────────────────────────────────────
function SchoolIcon({ size = "1em" }: { size?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "0.35em", opacity: 0.45 }}>
      <path d="M10 2L19 7L10 12L1 7L10 2Z" fill="currentColor" />
      <path d="M4 9.5V14.5C4 14.5 6.5 17 10 17C13.5 17 16 14.5 16 14.5V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M19 7V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SkillChart({ slices }: { slices: { key: string; value: number }[] }) {
  // Convert slices array → Record for shared fuse13Dto5
  const attrs: Record<string, number> = {};
  for (const s of slices) attrs[s.key] = s.value;
  const fused = fuse13Dto5(attrs);
  const CONTRAST_EXPONENT = 1.8;

  // Separate 身体 from pie groups
  const physical = fused.find(g => g.key === "physical")!;
  const pieGroups = fused.filter(g => g.key !== "physical");

  const pieData = pieGroups.map(g => ({
    ...g,
    amplified: Math.pow(g.value, CONTRAST_EXPONENT),
  }));

  const maxOrig = Math.max(...pieGroups.map(g => g.value));

  return (
    <div>
      {/* 1. Group summary labels (no sub-dimensions) */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
        {pieGroups.map(g => (
          <div key={g.key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
            <span style={{ color: T.label, fontSize: FONT.xs }}>{g.label}</span>
            <span style={{ color: T.white, fontSize: FONT.xs, fontWeight: 600 }}>{g.value}</span>
          </div>
        ))}
      </div>

      {/* 2. Donut pie chart (5 groups, excluding 身体) */}
      <div className="flex justify-center" style={{ filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.5))", outline: "none" } as React.CSSProperties}>
        <PieChart width={210} height={210} style={{ outline: "none" }}>
          <Pie
            data={pieData} dataKey="amplified"
            cx={105} cy={105} outerRadius={92} innerRadius={54}
            paddingAngle={0} stroke="rgba(0,0,0,0.55)" strokeWidth={1.2}
            startAngle={90} endAngle={-270}
            isAnimationActive animationBegin={80} animationDuration={900} animationEasing="ease-out"
          >
            {pieData.map((d, i) => {
              const isDominant = d.value === maxOrig;
              return (
                <Cell key={i} fill={d.color}
                  stroke="rgba(0,0,0,0.55)"
                  strokeWidth={1.2}
                  style={isDominant ? { filter: `drop-shadow(0 0 6px ${d.color}88)` } : undefined} />
              );
            })}
          </Pie>
        </PieChart>
      </div>

      {/* 3. 身体天赋 — standalone horizontal bar */}
      <div className="mt-5 px-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: physical.color, boxShadow: `0 0 8px ${physical.color}66` }} />
            <span style={{ color: T.white, fontSize: FONT.sm, fontWeight: 600, letterSpacing: "0.02em" }}>{physical.label}</span>
          </div>
          <span style={{ color: T.white, fontSize: FONT.lg, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{physical.value}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)" }}>
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${physical.value}%` }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: `linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.95))`,
              boxShadow: "0 0 12px rgba(255,255,255,0.25)",
            }} />
        </div>
      </div>
    </div>
  );
}

// ── Season stats table ─────────────────────────────────────────────────────
const STAT_COLS: { key: keyof SeasonStat; label: string; isAdvanced?: boolean }[] = [
  { key: "gp",    label: "GP" },
  { key: "pts",   label: "PPG" },
  { key: "reb",   label: "RPG" },
  { key: "ast",   label: "APG" },
  { key: "fg",    label: "FG%" },
  { key: "three", label: "3P%" },
  { key: "ft",    label: "FT%" },
  { key: "ts",    label: "TS%",  isAdvanced: true },
  { key: "per",   label: "PER",  isAdvanced: true },
];

function StatsTable({ seasons }: { seasons: SeasonStat[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: B.card }}>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: BG.raised }}>
              <th className="text-left px-4 py-3" style={{ color: T.label, fontSize: FONT.xs, fontWeight: 600, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>赛季</th>
              <th className="text-left px-4 py-3" style={{ color: T.label, fontSize: FONT.xs, fontWeight: 600, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>联赛</th>
              <th className="text-left px-4 py-3" style={{ color: T.label, fontSize: FONT.xs, fontWeight: 600, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>球队</th>
              {STAT_COLS.map(c => (
                <th key={c.key} className="text-right px-3 py-3" style={{ color: c.isAdvanced ? "rgba(255,165,0,0.5)" : T.label, fontSize: FONT.xs, fontWeight: 600, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seasons.map((s, i) => (
              <tr key={s.year} style={{ background: BG.card, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-3" style={{ color: T.white, fontSize: FONT.base, whiteSpace: "nowrap" }}>{s.year}</td>
                <td className="px-4 py-3" style={{ color: T.body, fontSize: FONT.sm, whiteSpace: "nowrap" }}>{s.level}</td>
                <td className="px-4 py-3" style={{ color: T.body, fontSize: FONT.sm, whiteSpace: "nowrap" }}>{s.team}</td>
                {STAT_COLS.map(c => (
                  <td key={c.key} className="text-right px-3 py-3" style={{ color: c.isAdvanced ? "rgba(255,165,0,0.7)" : "rgba(255,255,255,0.75)", fontSize: FONT.base, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {s[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2" style={{ borderTop: B.divider, background: BG.card }}>
        <span style={{ color: "rgba(255,165,0,0.5)", fontSize: FONT.xs }}>橙色列为高阶数据</span>
        <span style={{ color: T.body, fontSize: FONT.xs, marginLeft: "12px" }}>TS% = 真实命中率 · PER = 球员效率值</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
interface PlayerProfileProps {
  playerName?: string;
  onBack: () => void;
  followed: Set<string>;
  onToggleFollow: (name: string) => void;
}

export function PlayerProfile({ playerName, onBack, followed, onToggleFollow }: PlayerProfileProps) {
  const [tab, setTab] = useState(0);
  // Look up in 2026 draft DB by English or Chinese name, fallback to first DB player
  const dbPlayer: DraftPlayer | null = playerName
    ? ((draftDB as DraftPlayer[]).find((p) => p.name === playerName || (p as any).nameCn === playerName) ?? null)
    : null;
  const playerFound = dbPlayer !== null;
  const player = dbPlayer ? adaptDraftPlayer(dbPlayer) : DEFAULT;

  // Collect all name variants for this player
  const playerNames = [player.en, player.name, dbPlayer?.name].filter(Boolean) as string[];
  const isFollowed = playerNames.some(n => followed.has(n));

  // Find the exact stored name (for correct unfollow), fallback to en for follow
  const toggleKey = playerNames.find(n => followed.has(n)) ?? player.en;

  const { overview: cleanOverview, template: templateRef } = extractTemplate(player.overview);

  return (
    <div style={{ fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>

      {/* ── Hero ── */}
      <div className="relative mb-8 rounded-3xl" style={{ background: BG.card, border: B.card, padding: "40px 28px" }}>
        <button onClick={onBack}
          className="flex items-center gap-2 transition-opacity hover:opacity-70 mb-6"
          style={{ color: T.body, fontSize: FONT.md }}>
          ← 返回
        </button>

        {/* Row: Pos + School + Follow */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span style={{ color: T.body, fontSize: FONT.md, fontWeight: 500 }}>{player.pos}</span>
            <span style={{ color: T.dim, fontSize: FONT.md }}>/ {player.school}</span>
          </div>
          <button
            onClick={() => onToggleFollow(toggleKey)}
            disabled={!playerFound}
            className="px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: isFollowed ? BG.overlay : T.white,
              border: isFollowed ? B.visible : "1px solid transparent",
              color: isFollowed ? T.body : BG.page,
              fontSize: FONT.sm, fontWeight: 600,
            }}>
            {isFollowed ? "已关注" : "关注"}
          </button>
        </div>

        {/* Player name — Chinese */}
        <h1 style={{ color: T.white, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "4px" }}>
          {player.name}
        </h1>

        {/* English name below */}
        {player.en !== player.name && (
          <p style={{ color: T.label, fontSize: FONT.lg }}>{player.en}</p>
        )}

        {/* Measurements */}
        <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: B.divider }}>
          {[
            ["身高", player.heightMetric],
            ["臂展", player.wingspanMetric],
            ["体重", player.weightMetric],
          ].map(([label, value]) => (
            <div key={label}>
              <span style={{ color: T.dim, fontSize: FONT.xs }}>{label}</span>
              <div style={{ color: T.white, fontSize: FONT.md, fontWeight: 500, marginTop: "2px" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl"
        style={{ background: BG.card, border: B.card, display: "inline-flex" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className="px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
            style={{
              background: tab === i ? BG.overlay : "transparent",
              color: tab === i ? T.white : T.dim,
              fontWeight: tab === i ? 600 : 400,
              fontSize: FONT.base,
            }}>
            <span className="inline-block w-0.5 h-2.5 rounded-full shrink-0"
              style={{ background: tab === i ? T.white : "transparent" }} />
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* ── 概览 ── */}
        {tab === 0 && (
          <div className="space-y-6">
            {/* 1. 能力特征饼图 — 全宽，先给直觉 */}
            <div className="p-6 rounded-2xl" style={{ background: BG.card, border: B.card }}>
              <p style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>能力特征</p>
              <SkillChart slices={player.pie} />
            </div>

            {/* 2. 球员综述 + 模板参考 | 优势/待观察 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
              <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: BG.card, border: B.card }}>
                <p style={{ color: T.label, fontSize: FONT.sm, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>球员综述</p>
                <p style={{ color: T.hero, fontSize: FONT.lg, lineHeight: 1.75 }}>{cleanOverview}</p>
                {templateRef && (
                  <div className="mt-4 p-4 rounded-xl"
                    style={{ background: BG.subtle, border: B.subtle }}>
                    <span style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.1em", marginRight: "8px" }}>模板参考</span>
                    <span style={{ color: "rgba(255,255,255,0.75)", fontSize: FONT.base, lineHeight: 1.65 }}>{templateRef}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-2xl" style={{ background: BG.card, border: B.card }}>
                  <p style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "14px" }}>优势</p>
                  <ul className="space-y-2.5">
                    {player.strengths.map(s => (
                      <li key={s} className="flex items-start gap-2.5">
                        <div className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: T.white }} />
                        <span style={{ color: T.body, fontSize: FONT.base, lineHeight: 1.5 }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 rounded-2xl" style={{ background: BG.card, border: B.card }}>
                  <p style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "14px" }}>待观察</p>
                  <ul className="space-y-2.5">
                    {player.weaknesses.map(w => (
                      <li key={w} className="flex items-start gap-2.5">
                        <div className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: T.label }} />
                        <span style={{ color: T.body, fontSize: FONT.base, lineHeight: 1.5 }}>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. 联赛数据 */}
            <div className="p-5 rounded-2xl" style={{ background: BG.card, border: B.card }}>
              <p style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "14px" }}>联赛数据</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span style={{ color: T.label, fontSize: FONT.sm }}>位置</span>
                  <div style={{ color: T.white, fontSize: FONT.base, fontWeight: 500, marginTop: "4px" }}>{player.pos}</div>
                </div>
                <div>
                  <span style={{ color: T.label, fontSize: FONT.sm }}>球队</span>
                  <div style={{ color: T.white, fontSize: FONT.base, fontWeight: 500, marginTop: "4px" }}>{player.school}</div>
                </div>
                {player.projection && player.projection !== "2026 NBA Draft" && (
                  <div>
                    <span style={{ color: T.label, fontSize: FONT.sm }}>预测顺位</span>
                    <div style={{ color: T.white, fontSize: FONT.base, fontWeight: 500, marginTop: "4px" }}>{player.projection.split("—")[0].trim()}</div>
                  </div>
                )}
                {player.seasonStats.length > 0 && (
                  <div>
                    <span style={{ color: T.label, fontSize: FONT.sm }}>最近赛季</span>
                    <div style={{ color: T.white, fontSize: FONT.base, fontWeight: 500, marginTop: "4px" }}>
                      {player.seasonStats[player.seasonStats.length - 1].level} · {player.seasonStats[player.seasonStats.length - 1].pts} PPG
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Videos — 待开发 */}
            <div>
              <p style={{ color: T.label, fontSize: FONT.sm, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>精彩视频</p>
              <div className="py-10 text-center rounded-2xl"
                style={{ background: BG.card, border: B.card }}>
                <p style={{ color: T.ghost, fontSize: FONT.md }}>待开发</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 数据 ── */}
        {tab === 1 && (
          <div>
            {dbPlayer ? (
              <>
                <p style={{ color: T.label, fontSize: FONT.sm, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>2026 NBA 联合试训数据</p>
                <DraftCombineTable dp={dbPlayer} />
              </>
            ) : (
              <>
                <p style={{ color: T.label, fontSize: FONT.sm, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>历年赛季数据</p>
                <StatsTable seasons={player.seasonStats} />
              </>
            )}
          </div>
        )}

        {/* ── AI 洞察 ── */}
        {tab === 2 && (
          <div className="py-16 text-center rounded-2xl"
            style={{ background: BG.card, border: B.card }}>
            <p style={{ color: T.ghost, fontSize: FONT.xl }}>待开发</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
