你是 NBA 选秀球探数据分析师。根据以下 36 名 2026 年 NBA 选秀新秀的球探报告，为每位新秀生成统一的球员数据结构。

## 输出格式（严格 JSON 数组）

[
  {
    "id": 1,
    "name": "AJ Dybantsa",
    "nameCn": "AJ·迪班萨",
    "position": "SF",
    "positions": ["SF", "SG"],
    "team": "BYU",
    "age": 19,
    "height": 206,
    "wingspan": 213,
    "weight": 98,
    "attributes": {
      "身体": 0, "突破": 0, "篮下": 0, "背身": 0,
      "中投": 0, "三分": 0, "传球": 0, "控运": 0,
      "内防": 0, "外防": 0, "抢断": 0, "盖帽": 0, "篮板": 0
    },
    "skills": [],
    "style": [],
    "isPolished": true,
    "polishedReason": "大三场均22分即插即用"
  }
]

## 13D 评分规则

- 范围 0-99
- 65 = NBA 轮换及格线
- 80 = 同位置精英新秀
- 90 = 顶级新秀特质（进 NBA 即竞争同位置前列）
- 99 = 历史级天赋（仅 Wemby 级别极少数）
- **关键：你是球探，不是球迷。基于报告事实打分。**
  - 投篮命中率 28% → 三分不该超 55
  - 报告反复批评防守 → 外防不该超 50
  - 身高 6'0" 后卫 → 盖帽不该超 25
  - 报告未提及的能力默认为 50（联赛平均水平）
- **每个新秀必须有至少 1 项 >= 85（相对同届突出的招牌技能）**

## 各维度锚定参考

1. 身体：99 LeBron / 95 Giannis / 90 Shaq / 80 Wade / 65 Booker / 40 Jokic / 25 老年CP3
2. 突破：99 Wade / 95 Westbrook / 90 Jordan / 80 SGA / 65 Klay / 40 Dirk / 20 Gobert
3. 篮下：99 Shaq / 95 Giannis / 90 LeBron / 85 Hakeem / 65 Klay / 40 Curry / 20 Crawford
4. 背身：99 Hakeem / 98 Shaq / 92 Duncan / 90 Jokic / 65 LeBron / 45 KD / 15 Kyrie
5. 中投：99 Jordan / 97 KD / 95 Kobe / 90 Booker / 75 LeBron / 55 Giannis / 25 Shaq
6. 三分：99 Curry / 92 Klay / 91 KD / 82 Kyrie / 75 Jordan / 40 Giannis / 25 Shaq
7. 传球：99 CP3 / 94 Jokic / 90 LeBron / 88 Harden / 65 Kawhi / 45 Klay / 25 Gobert
8. 控运：99 Kyrie / 97 Curry / 92 Harden / 85 Kobe / 78 PG / 40 Giannis / 20 Gobert
9. 内防：99 Hakeem / 96 Ben Wallace / 95 Duncan / 92 Draymond / 90 Gobert / 65 Dirk / 30 Curry
10. 外防：99 Kawhi / 98 Jordan / 95 Rodman / 90 PG / 88 Jimmy / 65 Curry / 40 Dirk / 20 Crawford
11. 抢断：99 Jordan / 97 CP3 / 90 Kawhi / 80 Jimmy / 65 Curry / 40 Dirk / 20 Shaq
12. 盖帽：99 Hakeem / 98 Shaq / 96 Ben Wallace / 92 AD / 80 Giannis / 25 Curry / 15 CP3
13. 篮板：99 Rodman / 97 Shaq / 94 Ben Wallace / 90 Duncan / 80 Giannis / 65 LeBron / 45 Curry / 20 Crawford

## 技能标签 skills（固定枚举，选 3-6 项）

Three Point / Mid-range / Finishing / Post / Handle / Isolation / Off-ball / Passing Vision / Tempo Control / Rebounding / POA Defense / Rim Protection

## 风格标签 style（固定枚举，选 1-3 项）

Shooter / ISO / Dunk Finisher / Primary Creator / Point Forward / Playmaking Big / Two-Way / 3&D / Defensive Anchor / Small-Ball Center / Glue Guy / Sixth Man

## 即战力/潜力股判断规则

**isPolished = true（即战力）** 需满足至少 2 条：
- 大学/联赛场均得分 > 15 且总命中率 > 45%
- 球探报告明确提到 "NBA-ready" / "plug-and-play" / "polished" / "ready now"
- 技术成熟度被报告评价为「已成型 / refined」
- 大三/大四球员（age >= 21）

**isPolished = false（潜力股）** 满足至少 2 条：
- 大一球员（age <= 19）且报告强调 "upside" / "ceiling" / "raw" / "potential"
- 身体天赋突出但技术被评价为「粗糙 / developing」
- 报告反复提到「需要时间培养 / 发展联盟 / project」

**polishedReason**：一句话中文解释（15 字以内），如「大三即战力即插即用」「19岁毛胚天赋待打磨」

## 评分步骤（逐球员执行）

1. 认真阅读球探报告（profile_text）
2. 提取报告中提到的具体数据（命中率/场均/排名/体测）
3. 对每个 13D 维度：报告说了什么？事实是什么？最接近哪个球星锚点？
4. 基于事实打分，不可拔高。未提及的能力 = 50
5. 选择 skills（3-6 项）和 style（1-3 项）
6. 判定 isPolished

## 输出要求

1. 完整 JSON 数组，36 人全部
2. 保留原始字段：id / name / nameCn / position / positions / team / age / height / weight / wingspan
3. 新增/更新：attributes（13D）/ skills[] / style[] / isPolished / polishedReason
4. 输出后附自检报告（不要 markdown 格式，跟在 JSON 数组后用文字）：
   - 13D 最高分球员及维度
   - isPolished=true 和 false 各多少
   - 哪些球员评分你最不确定需人工复核
