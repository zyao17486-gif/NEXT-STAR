import { useState } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell } from "recharts";
// V2: 20-player 2026 draft database for AI Scout result profiles
import draftDB from "../../data/2026-draft-database.json";
import { T, BG, B, FONT, PIE } from "../../styles/design-tokens";

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
function adaptDraftPlayer(dp: DraftPlayer): typeof DEFAULT {
  const pieKeys = ["finishing", "shooting", "playmaking", "defense", "rebounding"] as const;
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
    pie: [
      { key: "finishing", value: attrs.finishing },
      { key: "shooting", value: attrs.shooting },
      { key: "playmaking", value: attrs.playmaking },
      { key: "defense", value: attrs.defense },
      { key: "rebounding", value: attrs.rebounding },
    ] as { key: keyof typeof PIE; value: number }[],
    athleticism: attrs.athleticism,
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

// ── Player data ────────────────────────────────────────────────────────────
export const PLAYERS_DATA: Record<string, {
  name: string; en: string; pos: string;
  school: string; schoolEn: string;
  height: string; heightMetric: string;
  wingspan: string; wingspanMetric: string;
  weight: string; weightMetric: string;
  birthday: string; projection: string; img: string;
  overview: string; strengths: string[]; weaknesses: string[];
  seasonStats: SeasonStat[];
  pie: { key: keyof typeof PIE; value: number }[];
  athleticism: number; // 0-100, shown as separate white bar
  bestTemplate: { name: string; desc: string };
  worstTemplate: { name: string; desc: string };
  devPlan: [string, string][];
}> = {
  "迪伦·哈珀": {
    name: "迪伦·哈珀", en: "Dylan Harper", pos: "控卫",
    school: "罗格斯大学", schoolEn: "Rutgers",
    height: "6'5\"", heightMetric: "196 cm",
    wingspan: "6'8\"", wingspanMetric: "203 cm",
    weight: "205 lbs", weightMetric: "93 kg",
    birthday: "2006年2月4日", projection: "#2 顺位 — 2025",
    img: "https://images.unsplash.com/photo-1590227632180-80a3bf110871?w=1200&h=800&fit=crop&auto=format&q=90",
    overview: "天才级别的进攻创造者，持球能力与大局观远超同龄人。哈珀能在场上任何位置创造出清晰的出手机会，是近年来最令人兴奋的大学选手。",
    strengths: ["精英控球与进攻创造", "挡拆进攻驾驭能力", "传球视野与组织意识"],
    weaknesses: ["三分稳定性（33%）", "防守积极性有待提升", "NBA 级别身体对抗"],
    seasonStats: [
      { year: "2022-23", level: "高中", team: "AZ Compass Prep", gp: 28, pts: 22.1, reb: 4.2, ast: 5.8, fg: 48.3, three: 36.1, ft: 81.2, ts: 58.4, per: 28.1 },
      { year: "2023-24", level: "高中", team: "AZ Compass Prep", gp: 30, pts: 26.4, reb: 5.1, ast: 7.2, fg: 50.1, three: 37.8, ft: 84.0, ts: 61.2, per: 31.7 },
      { year: "2024-25", level: "大学", team: "Rutgers", gp: 33, pts: 21.3, reb: 3.6, ast: 6.8, fg: 47.2, three: 33.1, ft: 78.9, ts: 59.1, per: 26.4 },
    ],
    pie: [{ key: "playmaking", value: 45 }, { key: "finishing", value: 35 }, { key: "shooting", value: 20 }],
    athleticism: 68,
    bestTemplate: { name: "凯里·欧文", desc: "全明星级别的持球主导者，能在任何局面下自主创造高质量出手，比赛末端掌控力极强，连续多赛季跻身联盟最难防的进攻方之列。" },
    worstTemplate: { name: "蒙特·莫里斯", desc: "可靠的轮换控卫，能在体系内提供稳定的组织输出，但缺乏主导权与爆炸性，难以成为球队真正的一号得分选项。" },
    devPlan: [["第一年", "适应 NBA 节奏，专注无球跑动与三分稳定性。"], ["第二年", "确立先发位置，逐步成为主要持球人，场均 18+ 分。"], ["第三年", "全明星轨道。确立挡拆主导权，成为顶级得分手。"]],
  },
  "艾斯·贝利": {
    name: "艾斯·贝利", en: "Ace Bailey", pos: "小前锋",
    school: "罗格斯大学", schoolEn: "Rutgers",
    height: "6'10\"", heightMetric: "208 cm",
    wingspan: "7'2\"", wingspanMetric: "218 cm",
    weight: "195 lbs", weightMetric: "88 kg",
    birthday: "2006年12月23日", projection: "前5顺位 — 2026",
    img: "https://images.unsplash.com/photo-1569731683228-5e7850ae0034?w=1200&h=800&fit=crop&auto=format&q=90",
    overview: "细腻的得分能力加上 6'10\" 的身高，让贝利在每个级别都像是开了外挂。超长臂展搭配灵动的投篮手感，令人不禁想起年轻时的杜兰特。",
    strengths: ["超长臂展与身体天赋", "三分区得分", "无球跑动中的投射"],
    weaknesses: ["身体对抗能力尚待加强", "表现稳定性", "面对紧逼压迫时的持球"],
    seasonStats: [
      { year: "2023-24", level: "高中", team: "Gill St. Bernard's", gp: 26, pts: 19.8, reb: 8.4, ast: 2.1, fg: 52.0, three: 38.5, ft: 76.3, ts: 62.1, per: 27.8 },
      { year: "2024-25", level: "大学", team: "Rutgers", gp: 34, pts: 18.7, reb: 7.2, ast: 1.9, fg: 44.8, three: 35.2, ft: 74.1, ts: 57.3, per: 22.6 },
    ],
    pie: [{ key: "shooting", value: 53 }, { key: "finishing", value: 47 }],
    athleticism: 78,
    bestTemplate: { name: "凯文·杜兰特", desc: "身高手长的全能型得分怪兽，能以极高的效率在三个得分区域主宰比赛，成为联盟得分榜常客，并凭借防守端的存在感入选全明星阵容。" },
    worstTemplate: { name: "威利·科利-斯坦", desc: "具备优秀身体条件但进攻创造能力有限的蓝领侧翼，在轮换阵容中担任防守与篮板工人，难以成长为球队进攻核心。" },
    devPlan: [["第一年", "增重强化对抗，建立体系内无球跑动的可靠性。"], ["第二年", "扩大持球进攻比重，提升三分出手量与稳定性。"], ["第三年", "成为球队第一或第二进攻选项，锁定全明星候选资格。"]],
  },
  "诺亚·埃森格": {
    name: "诺亚·埃森格", en: "Noa Essengue", pos: "小前锋",
    school: "乌尔姆（德国）", schoolEn: "Ratiopharm Ulm",
    height: "6'9\"", heightMetric: "206 cm",
    wingspan: "7'1\"", wingspanMetric: "216 cm",
    weight: "190 lbs", weightMetric: "86 kg",
    birthday: "2007年2月23日", projection: "前15顺位 — 2025",
    img: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=1200&h=800&fit=crop&auto=format&q=90",
    overview: "卢卡以来最令人期待的国际新秀。埃森格的双向直觉、防守端的阅读球能力，以及稳步提升的进攻维度，让他具备成为球队基石的潜质。",
    strengths: ["精英防守本能", "超长臂展与身体延伸", "无球移动与跑位"],
    weaknesses: ["NBA 级别的持球创造能力", "需要积累更多比赛经验", "主导进攻的稳定性"],
    seasonStats: [
      { year: "2023-24", level: "欧洲青年联赛", team: "Ratiopharm Ulm U18", gp: 22, pts: 11.4, reb: 5.2, ast: 1.4, fg: 49.1, three: 31.2, ft: 68.4, ts: 54.7, per: 19.3 },
      { year: "2024-25", level: "欧洲青年联赛", team: "Ratiopharm Ulm", gp: 24, pts: 14.2, reb: 5.8, ast: 1.7, fg: 51.3, three: 34.1, ft: 71.2, ts: 57.8, per: 22.1 },
    ],
    pie: [{ key: "defense", value: 48 }, { key: "rebounding", value: 32 }, { key: "shooting", value: 20 }],
    athleticism: 85,
    bestTemplate: { name: "卡哇伊·伦纳德", desc: "两端统治力兼备的顶级侧翼，防守端入选最佳防守阵容，进攻端凭借高效的低位与中距离能力成为球队季后赛绝对核心。" },
    worstTemplate: { name: "德里克·乔内斯", desc: "依靠运动天赋和防守强度在轮换阵容中立足的侧翼，进攻端主要依赖空切和快攻，缺乏独立创造机会的能力。" },
    devPlan: [["第一年", "专注防守端立足，扩展三分出手稳定性。"], ["第二年", "发展中距离与持球进攻，成为双向侧翼先发。"], ["第三年", "全面成型，争取最佳防守阵容提名。"]],
  },
  "布吉·弗兰德": {
    name: "布吉·弗兰德", en: "Boogie Fland", pos: "控卫",
    school: "阿肯色大学", schoolEn: "Arkansas",
    height: "6'3\"", heightMetric: "191 cm",
    wingspan: "6'6\"", wingspanMetric: "198 cm",
    weight: "185 lbs", weightMetric: "84 kg",
    birthday: "2006年2月27日", projection: "前10顺位 — 2025",
    img: "https://images.unsplash.com/photo-1519432473078-0151c4f90335?w=1200&h=800&fit=crop&auto=format&q=90",
    overview: "爆炸级启动速度让防守者无所适从。弗兰德的创造性得分与无畏的急停跳投，赋予了他在现代 NBA 中的明星潜力。",
    strengths: ["第一步爆发力", "擦板挑篮技巧", "急停三分球"],
    weaknesses: ["身体框架与耐久性", "持球防守端", "快攻中的决策速度"],
    seasonStats: [
      { year: "2022-23", level: "高中", team: "IMG Academy", gp: 30, pts: 18.4, reb: 3.1, ast: 5.6, fg: 46.2, three: 38.4, ft: 82.1, ts: 59.8, per: 24.5 },
      { year: "2023-24", level: "高中", team: "Brewster Academy", gp: 29, pts: 21.7, reb: 3.8, ast: 6.4, fg: 47.9, three: 40.1, ft: 84.3, ts: 62.4, per: 27.3 },
      { year: "2024-25", level: "大学", team: "Arkansas", gp: 34, pts: 19.4, reb: 3.2, ast: 5.1, fg: 43.9, three: 36.2, ft: 79.8, ts: 56.7, per: 23.8 },
    ],
    pie: [{ key: "finishing", value: 47 }, { key: "playmaking", value: 35 }, { key: "shooting", value: 18 }],
    athleticism: 82,
    bestTemplate: { name: "贾·莫兰特", desc: "凭借惊人的第一步与高难度终结能力颠覆联盟的爆炸型控卫，能在任何对位中制造进攻机会，且随着视野成长逐渐进化为顶级组织者。" },
    worstTemplate: { name: "肯特·贝兹摩尔", desc: "在联盟长期立足但始终未能成为球队核心的得分型后卫，球队进攻依赖时表现出色，但缺乏稳定的主导进攻能力。" },
    devPlan: [["第一年", "展示运动天赋，建立快攻与挡拆中的进攻价值。"], ["第二年", "扩展组织端，提升助攻与失误比。"], ["第三年", "奠定先发主控资格，场均 20/6 冲击。"]],
  },
  "VJ 埃吉科姆": {
    name: "VJ 埃吉科姆", en: "VJ Edgecombe", pos: "得分后卫",
    school: "贝勒大学", schoolEn: "Baylor",
    height: "6'5\"", heightMetric: "196 cm",
    wingspan: "6'8\"", wingspanMetric: "203 cm",
    weight: "195 lbs", weightMetric: "88 kg",
    birthday: "2006年3月14日", projection: "前5顺位 — 2025",
    img: "https://images.unsplash.com/photo-1551330299-5b92e951b570?w=1200&h=800&fit=crop&auto=format&q=90",
    overview: "爆炸性运动能力搭配精准投篮——埃吉科姆是天生的得分机器，无球时的跑动与空切同样具备威胁。",
    strengths: ["超强运动天赋", "有球无球均可得分", "空切与跑动能力"],
    weaknesses: ["组织传球有待提升", "面对夹击的处理", "持球进攻多样性"],
    seasonStats: [
      { year: "2023-24", level: "高中", team: "Link Year Prep", gp: 27, pts: 20.3, reb: 5.4, ast: 2.8, fg: 51.2, three: 40.3, ft: 78.9, ts: 63.1, per: 26.7 },
      { year: "2024-25", level: "大学", team: "Baylor", gp: 35, pts: 17.8, reb: 4.1, ast: 2.4, fg: 46.2, three: 37.8, ft: 75.3, ts: 60.4, per: 21.9 },
    ],
    pie: [{ key: "finishing", value: 52 }, { key: "shooting", value: 48 }],
    athleticism: 91,
    bestTemplate: { name: "安东尼·爱德华兹", desc: "爆炸性的运动天赋配合持续扩展的持球能力，成长为联盟顶级双能卫，凭借绝对的身体统治力在季后赛中展现领袖气质。" },
    worstTemplate: { name: "泰伦斯·罗斯", desc: "具备高光时刻但无法保持稳定性的角色型得分手，进攻依赖体系，难以在高强度防守下独立创造出手机会。" },
    devPlan: [["第一年", "以运动天赋为切入点，专注空切和快攻中的得分。"], ["第二年", "发展持球进攻，提高挡拆使用频率。"], ["第三年", "进化为球队第二进攻选项，实现真正的双能卫蜕变。"]],
  },
};

const DEFAULT = PLAYERS_DATA["迪伦·哈珀"];

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

// ── 2D refined pie + athleticism bar ──────────────────────────────────────
// 饼图色块不严格适配数值占比，而是通过非线性放大突出球员最鲜明的风格特征
function SkillChart({ slices, athleticism }: {
  slices: { key: string; value: number }[];
  athleticism: number;
}) {
  // 对比度放大指数：>1 时数值差距被放大，主导风格更突出
  const CONTRAST_EXPONENT = 1.8;

  const rawData = slices.map(s => ({
    key: s.key,
    originalValue: s.value,
    // 非线性变换：放大数值差距，让主导能力在视觉上占据更显著的比例
    amplified: Math.pow(s.value, CONTRAST_EXPONENT),
    color: PIE[s.key]?.light ?? T.white,
    label: PIE[s.key]?.label ?? s.key,
  }));

  // 找到主导能力（原值最大者），用于图例高亮
  const maxOrig = Math.max(...rawData.map(d => d.originalValue));

  // 饼图用的 data（使用放大后的值）
  const pieData = rawData.map(d => ({
    key: d.key,
    value: d.amplified,
    color: d.color,
    originalValue: d.originalValue,
    label: d.label,
  }));

  return (
    <div>
      {/* 1. Legend — 显示原始数值，主导项高亮 */}
      <div className="flex flex-wrap gap-x-5 gap-y-2.5 mb-6">
        {rawData.map(d => {
          const isDominant = d.originalValue === maxOrig;
          return (
            <div key={d.key} className="flex items-center gap-2">
              <div
                className="shrink-0 rounded-full"
                style={{
                  width: isDominant ? "10px" : "8px",
                  height: isDominant ? "10px" : "8px",
                  background: d.color,
                  boxShadow: isDominant
                    ? `0 0 10px ${d.color}cc, 0 0 20px ${d.color}66`
                    : `0 0 4px ${d.color}66`,
                  transition: "all 0.3s ease",
                }}
              />
              <span style={{
                color: isDominant ? T.white : T.label,
                fontSize: FONT.sm,
                fontWeight: isDominant ? 600 : 400,
                transition: "all 0.3s ease",
              }}>
                {d.label}
              </span>
              <span style={{
                color: T.body,
                fontSize: FONT.sm,
                fontWeight: isDominant ? 500 : 400,
                transition: "all 0.3s ease",
              }}>
                {d.originalValue}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Pie chart (2D donut, refined) — 使用放大后的值驱动扇区大小 */}
      <div className="flex justify-center mb-6" style={{ filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.5))", outline: "none", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}>
        <PieChart width={210} height={210} style={{ outline: "none" }}>
          <Pie
            data={pieData}
            cx={105} cy={105}
            outerRadius={92} innerRadius={54}
            paddingAngle={2}
            dataKey="value"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={1}
            startAngle={90} endAngle={-270}
            isAnimationActive
            animationBegin={80} animationDuration={900}
            animationEasing="ease-out"
          >
            {pieData.map((d, i) => {
              const isDominant = d.originalValue === maxOrig;
              return (
                <Cell
                  key={i}
                  fill={d.color}
                  stroke={isDominant ? d.color : "rgba(0,0,0,0.25)"}
                  strokeWidth={isDominant ? 1.5 : 1}
                  style={isDominant ? { filter: `drop-shadow(0 0 6px ${d.color}88)` } : undefined}
                />
              );
            })}
          </Pie>
        </PieChart>
      </div>

      {/* 3. Athleticism bar (white, separate from pie) */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ color: T.body, fontSize: FONT.sm }}>运动天赋</span>
          <span style={{ color: T.body, fontSize: FONT.sm, fontFamily: "'Inter', sans-serif" }}>{athleticism} / 100</span>
        </div>
        <div style={{ height: "2px", background: BG.overlay, borderRadius: "1px", overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", background: "rgba(255,255,255,0.75)", borderRadius: "1px" }}
            initial={{ width: 0 }}
            animate={{ width: `${athleticism}%` }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
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
  // Look up in old PLAYERS_DATA first, then 2026 draft DB, fallback to DEFAULT
  const dbPlayer: DraftPlayer | null = playerName
    ? ((draftDB as DraftPlayer[]).find((p) => p.name === playerName) ?? null)
    : null;
  const player = (playerName && PLAYERS_DATA[playerName])
    || (dbPlayer ? adaptDraftPlayer(dbPlayer) : null)
    || DEFAULT;
  const isFollowed = followed.has(player.name);
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
          <button onClick={() => onToggleFollow(player.name)}
            className="px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
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
            className="px-5 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              background: tab === i ? BG.overlay : "transparent",
              color: tab === i ? T.white : T.body,
              fontWeight: tab === i ? 600 : 400,
            }}>
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
              <p style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>能力特征</p>
              <SkillChart slices={player.pie} athleticism={player.athleticism} />
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
