// 25 legendary NBA star players with 6D attribute vectors for DNA generation
// Organized by position: PG, SG, SF, PF, C
// V2: 6D (added rebounding), talentType → polishedType (polished/upside)

export interface StarPlayer {
  id: string;
  name: string;       // 中文名
  en: string;         // English name
  position: "PG" | "SG" | "SF" | "PF" | "C";
  attributes: {
    finishing: number;    // 终结能力 — rim pressure, dunking, layups, foul-drawing
    shooting: number;     // 投篮能力 — 3PT, midrange, FT, shot mechanics
    playmaking: number;   // 组织能力 — passing vision, P&R reads, assist creation
    defense: number;      // 防守能力 — on-ball, off-ball, steals, blocks, IQ
    athleticism: number;  // 运动能力 — vertical, lateral quickness, speed, strength
    rebounding: number;   // 篮板能力 — offensive/defensive rebounding, positioning
  };
  tags: string[];
  polishedType: "polished" | "upside";  // 即战力 vs 潜力股
  polishedRatio: number;   // 0 = pure upside/raw, 100 = pure polished/ready-now
}

export const POSITION_LABELS: Record<string, string> = {
  PG: "控球后卫",
  SG: "得分后卫",
  SF: "小前锋",
  PF: "大前锋",
  C:  "中锋",
};

export const STAR_PLAYERS: Record<string, StarPlayer[]> = {
  PG: [
    {
      id: "curry", name: "斯蒂芬·库里", en: "Stephen Curry", position: "PG",
      attributes: { finishing: 70, shooting: 99, playmaking: 85, defense: 55, athleticism: 65, rebounding: 30 },
      tags: ["三分之王", "无球跑动", "革命性投手", "引力核心"],
      polishedType: "polished", polishedRatio: 75,
    },
    {
      id: "kyrie", name: "凯里·欧文", en: "Kyrie Irving", position: "PG",
      attributes: { finishing: 92, shooting: 78, playmaking: 80, defense: 45, athleticism: 80, rebounding: 25 },
      tags: ["控球大师", "终结艺术家", "单打", "脚步华丽"],
      polishedType: "polished", polishedRatio: 70,
    },
    {
      id: "cp3", name: "克里斯·保罗", en: "Chris Paul", position: "PG",
      attributes: { finishing: 60, shooting: 75, playmaking: 96, defense: 82, athleticism: 55, rebounding: 30 },
      tags: ["组织大师", "篮球智商", "中距离", "防守领袖"],
      polishedType: "polished", polishedRatio: 90,
    },
    {
      id: "westbrook", name: "拉塞尔·威斯布鲁克", en: "Russell Westbrook", position: "PG",
      attributes: { finishing: 85, shooting: 50, playmaking: 88, defense: 65, athleticism: 98, rebounding: 45 },
      tags: ["三双机器", "爆发力", "转换进攻", "能量型"],
      polishedType: "upside", polishedRatio: 40,
    },
    {
      id: "rose", name: "德里克·罗斯", en: "Derrick Rose", position: "PG",
      attributes: { finishing: 88, shooting: 55, playmaking: 75, defense: 58, athleticism: 95, rebounding: 28 },
      tags: ["MVP", "爆发力", "突破", "弹跳"],
      polishedType: "upside", polishedRatio: 35,
    },
  ],

  SG: [
    {
      id: "jordan", name: "迈克尔·乔丹", en: "Michael Jordan", position: "SG",
      attributes: { finishing: 95, shooting: 82, playmaking: 78, defense: 92, athleticism: 96, rebounding: 45 },
      tags: ["GOAT", "中距离之王", "防守大锁", "杀手本能"],
      polishedType: "polished", polishedRatio: 85,
    },
    {
      id: "kobe", name: "科比·布莱恩特", en: "Kobe Bryant", position: "SG",
      attributes: { finishing: 90, shooting: 85, playmaking: 70, defense: 88, athleticism: 85, rebounding: 45 },
      tags: ["曼巴精神", "脚步万花筒", "关键先生", "技术大师"],
      polishedType: "polished", polishedRatio: 80,
    },
    {
      id: "wade", name: "德维恩·韦德", en: "Dwyane Wade", position: "SG",
      attributes: { finishing: 92, shooting: 60, playmaking: 78, defense: 85, athleticism: 93, rebounding: 40 },
      tags: ["闪电侠", "盖帽后卫", "欧洲步", "终结者"],
      polishedType: "upside", polishedRatio: 55,
    },
    {
      id: "edwards", name: "安东尼·爱德华兹", en: "Anthony Edwards", position: "SG",
      attributes: { finishing: 88, shooting: 78, playmaking: 62, defense: 72, athleticism: 95, rebounding: 40 },
      tags: ["新一代飞人", "隔扣", "自信", "上升期"],
      polishedType: "upside", polishedRatio: 45,
    },
    {
      id: "harden", name: "詹姆斯·哈登", en: "James Harden", position: "SG",
      attributes: { finishing: 80, shooting: 88, playmaking: 92, defense: 55, athleticism: 68, rebounding: 35 },
      tags: ["得分王", "后撤步", "造犯规", "持球大核"],
      polishedType: "polished", polishedRatio: 75,
    },
  ],

  SF: [
    {
      id: "durant", name: "凯文·杜兰特", en: "Kevin Durant", position: "SF",
      attributes: { finishing: 88, shooting: 92, playmaking: 65, defense: 72, athleticism: 78, rebounding: 50 },
      tags: ["得分机器", "身高臂长", "无解投篮", "错位噩梦"],
      polishedType: "polished", polishedRatio: 80,
    },
    {
      id: "lebron", name: "勒布朗·詹姆斯", en: "LeBron James", position: "SF",
      attributes: { finishing: 94, shooting: 72, playmaking: 90, defense: 80, athleticism: 95, rebounding: 60 },
      tags: ["全能之王", "篮球智商", "转换进攻", "统治力"],
      polishedType: "upside", polishedRatio: 50,
    },
    {
      id: "tatum", name: "杰森·塔图姆", en: "Jayson Tatum", position: "SF",
      attributes: { finishing: 82, shooting: 85, playmaking: 68, defense: 80, athleticism: 78, rebounding: 50 },
      tags: ["侧翼得分手", "技术全面", "关键球", "努力型"],
      polishedType: "polished", polishedRatio: 72,
    },
    {
      id: "kawhi", name: "科怀·伦纳德", en: "Kawhi Leonard", position: "SF",
      attributes: { finishing: 78, shooting: 80, playmaking: 58, defense: 97, athleticism: 80, rebounding: 50 },
      tags: ["死亡缠绕", "FMVP", "中距离", "安静杀手"],
      polishedType: "polished", polishedRatio: 78,
    },
    {
      id: "pg13", name: "保罗·乔治", en: "Paul George", position: "SF",
      attributes: { finishing: 75, shooting: 86, playmaking: 60, defense: 90, athleticism: 82, rebounding: 48 },
      tags: ["3D天花板", "丝滑跳投", "全能侧翼", "防守悍将"],
      polishedType: "polished", polishedRatio: 75,
    },
  ],

  PF: [
    {
      id: "giannis", name: "扬尼斯·阿德托昆博", en: "Giannis Antetokounmpo", position: "PF",
      attributes: { finishing: 95, shooting: 45, playmaking: 72, defense: 88, athleticism: 98, rebounding: 80 },
      tags: ["希腊怪兽", "篮下统治", "快攻暴扣", "DPOY"],
      polishedType: "upside", polishedRatio: 35,
    },
    {
      id: "duncan", name: "蒂姆·邓肯", en: "Tim Duncan", position: "PF",
      attributes: { finishing: 82, shooting: 55, playmaking: 70, defense: 95, athleticism: 62, rebounding: 85 },
      tags: ["大基本功", "防守基石", "打板投篮", "领袖"],
      polishedType: "polished", polishedRatio: 92,
    },
    {
      id: "garnett", name: "凯文·加内特", en: "Kevin Garnett", position: "PF",
      attributes: { finishing: 75, shooting: 60, playmaking: 72, defense: 94, athleticism: 80, rebounding: 85 },
      tags: ["血性", "全能大前锋", "铁血防守", "激情"],
      polishedType: "upside", polishedRatio: 55,
    },
    {
      id: "dirk", name: "德克·诺维茨基", en: "Dirk Nowitzki", position: "PF",
      attributes: { finishing: 72, shooting: 92, playmaking: 55, defense: 50, athleticism: 55, rebounding: 65 },
      tags: ["金鸡独立", "投篮型大前", "FMVP", "一人一城"],
      polishedType: "polished", polishedRatio: 82,
    },
    {
      id: "zion", name: "锡安·威廉姆森", en: "Zion Williamson", position: "PF",
      attributes: { finishing: 94, shooting: 50, playmaking: 55, defense: 60, athleticism: 98, rebounding: 70 },
      tags: ["暴力美学", "篮筐摧毁者", "体重与弹跳", "天赋异禀"],
      polishedType: "upside", polishedRatio: 30,
    },
  ],

  C: [
    {
      id: "jokic", name: "尼古拉·约基奇", en: "Nikola Jokic", position: "C",
      attributes: { finishing: 85, shooting: 80, playmaking: 94, defense: 65, athleticism: 42, rebounding: 85 },
      tags: ["组织中锋", "MVP", "篮球智商", "低位魔术师"],
      polishedType: "polished", polishedRatio: 78,
    },
    {
      id: "wemby", name: "维克托·文班亚马", en: "Victor Wembanyama", position: "C",
      attributes: { finishing: 82, shooting: 78, playmaking: 60, defense: 95, athleticism: 85, rebounding: 80 },
      tags: ["独角兽", "历史级臂展", "盖帽怪兽", "未来之星"],
      polishedType: "upside", polishedRatio: 25,
    },
    {
      id: "shaq", name: "沙奎尔·奥尼尔", en: "Shaquille O'Neal", position: "C",
      attributes: { finishing: 98, shooting: 10, playmaking: 40, defense: 75, athleticism: 96, rebounding: 95 },
      tags: ["统治力", "禁区霸主", "扣碎篮板", "三连冠"],
      polishedType: "upside", polishedRatio: 30,
    },
    {
      id: "hakeem", name: "哈基姆·奥拉朱旺", en: "Hakeem Olajuwon", position: "C",
      attributes: { finishing: 92, shooting: 40, playmaking: 55, defense: 96, athleticism: 88, rebounding: 88 },
      tags: ["梦幻脚步", "盖帽王", "两连冠", "技术中锋"],
      polishedType: "polished", polishedRatio: 85,
    },
    {
      id: "ad", name: "安东尼·戴维斯", en: "Anthony Davis", position: "C",
      attributes: { finishing: 88, shooting: 65, playmaking: 55, defense: 92, athleticism: 88, rebounding: 82 },
      tags: ["现代中锋", "护框精英", "攻防一体", "玻璃人"],
      polishedType: "upside", polishedRatio: 58,
    },
  ],
};

export function getAllStarPlayers(): StarPlayer[] {
  return Object.values(STAR_PLAYERS).flat();
}

export function getStarPlayerById(id: string): StarPlayer | undefined {
  return getAllStarPlayers().find(p => p.id === id);
}
