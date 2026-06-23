你是一位资深 NBA 球探数据专家。请为以下 36 名 NBA 球星生成统一的球员模板数据库。

## 输出格式（每个球员严格遵循 JSON）

{
  "id": "curry",
  "name": "斯蒂芬·库里",
  "en": "Stephen Curry",
  "position": "PG",
  "positions": ["PG"],
  "height": 188,
  "wingspan": 192,
  "weight": 84,
  "attributes": {
    "身体": 0,
    "突破": 0,
    "篮下": 0,
    "背身": 0,
    "中投": 0,
    "三分": 0,
    "传球": 0,
    "控运": 0,
    "内防": 0,
    "外防": 0,
    "抢断": 0,
    "盖帽": 0,
    "篮板": 0
  },
  "skills": [],
  "style": []
}

## 13D 评分规则

- 范围 0-99
- 99 = 历史天花板（该维度史上第一人）
- 95 = 历史级（该维度历史前 5）
- 90 = 联盟顶级（同位置 Top 3）
- 80 = 精英级别（同位置 Top 10）
- 65 = NBA 轮换水平及格线（不会被针对的弱项）
- 40 = 明显偏弱（比赛中会被针对利用）
- 20 = 几乎不具备该能力
- 同一位置球员在同一维度必须有层次差异，禁止 3 人以上同分
- **每个球员必须有至少 1 项 >= 90（招牌技能），这是硬性要求。没有例外。**
- SGA 必须以 2K26 数据为基准：中投 >= 95，传球 >= 90，篮下 >= 90，控运 >= 93，抢断 >= 88
- T-Mac 巅峰期：中投/突破/身体至少一项 >= 92
- Vince Carter 巅峰期：突破/身体至少一项 >= 93
- Jimmy Butler：外防/突破至少一项 >= 90
- Carmelo Anthony：中投/篮下至少一项 >= 90
- Joel Embiid：背身/中投至少一项 >= 90
- Bam Adebayo：内防/身体至少一项 >= 90
- Jamal Crawford：控运 >= 92
- J.R. Smith：三分 >= 90
- 以上球员的硬性要求必须满足，不满足则重新生成

## 各维度定义与锚点

### 1. 身体 — Speed/Strength/Vertical/Agility 综合运动天赋
99: LeBron James（巅峰）— 历史最完美的身体标本
95: Giannis Antetokounmpo — 现代怪物身体
90: Shaquille O'Neal（巅峰）— 力量+速度的非人组合
85: Vince Carter（巅峰）— 弹跳+速度的完美结合
80: Dwyane Wade（巅峰）— 爆发力顶级
65: Devin Booker — 合格 NBA 运动能力
40: Nikola Jokic — 靠技巧补偿运动能力
25: Chris Paul（2025）— 年龄衰减的身体状态

### 2. 突破 — SpeedWithBall + DrivingDunk 面框持球冲击力
99: Dwyane Wade（巅峰）— 闪电第一步，不可阻挡的面框突破
95: Russell Westbrook（巅峰）— 暴力冲击
90: Michael Jordan — 第一步+空中调整
85: LeBron James — 力量型突破
80: Shai Gilgeous-Alexander — 节奏型突破大师
65: Klay Thompson — 能突但不是主要武器
40: Dirk Nowitzki — 几乎不持球突破
20: Rudy Gobert — 完全不持球攻

### 3. 篮下 — CloseShot + Layup + StandingDunk 篮筐附近终结效率
99: Shaquille O'Neal — 历史禁区统治者
95: Giannis Antetokounmpo — 现代篮下之王
90: LeBron James — 转换进攻篮下终结顶级
85: Hakeem Olajuwon — 脚步+终结完美结合
80: Anthony Davis — 多手段篮下终结
65: Klay Thompson — 切入篮下能终结
40: Stephen Curry — 篮下靠节奏不靠身体
20: Jamal Crawford — 外线飘着打

### 4. 背身 — PostControl + PostFade + PostHook 背筐进攻能力
99: Hakeem Olajuwon — 梦幻脚步，历史第一背身
98: Shaquille O'Neal — 碾压式背身无解
92: Tim Duncan — 打板投篮+基本功背身
90: Nikola Jokic — 现代背身魔术师
85: Kobe Bryant — 后卫中最强背身之一
80: Michael Jordan — 后三连时期背身是主要武器
70: Carmelo Anthony — 三威胁背身结合
65: LeBron James — 有背身但不是核心武器
45: Kevin Durant — 身高优势背身但非习惯
25: Stephen Curry — 偶尔使用
15: Kyrie Irving — 后卫不背身

### 5. 中投 — Mid-Range Shot 中距离投射
99: Michael Jordan — 中距离之王，后三连以此为核心
97: Kevin Durant — 历史级无差别中投
95: Kobe Bryant — 脚步创造中距离空间
93: Dirk Nowitzki — 金鸡独立不可封盖
92: Kawhi Leonard — 当代中距离大师
90: Devin Booker — 三威胁中距离
88: Shaun Livingston... 修正↓
88: DeMar DeRozan — 中距离为主要武器
85: Carmelo Anthony — 刺探步接中投
75: LeBron James — 中投稳步提升但非核心
55: Giannis Antetokounmpo — 中投仍是弱项
25: Shaquille O'Neal — 罚球线外无威胁

### 6. 三分 — Three-Point Shot 三分投射
99: Stephen Curry — 历史第一三分手
92: Klay Thompson — 完美接球投三分手
91: Kevin Durant — 身高+手感无解三分
85: Paul George — 侧翼顶级三分
82: Kyrie Irving — 持球三分高手
80: Kawhi Leonard — 稳健三分
78: Tracy McGrady — 干拔三分
75: Michael Jordan — 三分不是主要武器
40: Giannis Antetokounmpo — 三分弱环
25: Shaquille O'Neal — 完全不投三分

### 7. 传球 — PassAccuracy + PassIQ + PassVision 组织传球能力
99: Chris Paul — 历史级传球大师
94: Nikola Jokic — 组织中锋革命者
90: LeBron James — 转换传球顶级
88: James Harden — 持球大核传球
78: Russell Westbrook — 助攻王级别但失误多
75: Kevin Durant — 合格侧翼传导
65: Kawhi Leonard — 能传不失误
45: Klay Thompson — 不负责组织
25: Rudy Gobert — 终结者不传球

### 8. 控运 — BallHandle 控球运球能力
99: Kyrie Irving — 历史第一人球结合
97: Stephen Curry — 控球+投射结合
92: James Harden — 节奏型控球大师
90: Chris Paul — 稳如磐石的控球
88: Tim Hardaway... 修正↓
85: Kobe Bryant — 华丽控球
82: Kevin Durant — 身高 6'11" 下的非凡控球
78: Paul George — 侧翼顶级控球
65: Klay Thompson — 够用但不花哨
40: Giannis Antetokounmpo — 大步流星非精细控球
20: Rudy Gobert — 完全不控球

### 9. 内防 — InteriorDefense + Block 内线防守/护框综合
99: Hakeem Olajuwon — 历史护框天花板
96: Ben Wallace — 矮个内线防守传奇
95: Tim Duncan — 防守基石
93: Kevin Garnett — 防守覆盖全场
92: Draymond Green — 小个内线防守大师
90: Rudy Gobert — 当代顶级护框
88: Anthony Davis — 现代换防型护框
65: Dirk Nowitzki — 努力但非强项
30: Stephen Curry — 后卫不护框

### 10. 外防 — PerimeterDefense 外线单防/换防能力
99: Kawhi Leonard — 死亡缠绕历史级
98: Michael Jordan — DPOY 级别外防
95: Dennis Rodman — 1-5 号位通吃
92: Scottie Pippen... 修正↓
90: Paul George — 外线大锁
88: Jimmy Butler — 铁血外线防守
80: Klay Thompson — 稳健防守者
65: Stephen Curry — 不拖后腿但非优势
40: Dirk Nowitzki — 脚步慢被针对
20: Jamal Crawford — 防守漏洞

### 11. 抢断 — Steal 抢断能力
99: Michael Jordan — 生涯 2.3 断的历史级抢断手
97: Chris Paul — 多次抢断王
90: Kawhi Leonard — 大手+预判=抢断机器
80: Jimmy Butler — 协防抢断高手
70: Russell Westbrook — 赌博式抢断
65: Stephen Curry — 偶尔偷球
40: Dirk Nowitzki — 不抢断
20: Shaquille O'Neal — 内线不抢断

### 12. 盖帽 — Block 盖帽能力
99: Hakeem Olajuwon — 历史盖帽王
98: Shaquille O'Neal — 禁飞区
96: Ben Wallace — 矮个盖帽传奇
92: Anthony Davis — 现代盖帽王
88: Kevin Garnett — 协防大帽
80: Giannis Antetokounmpo — 追帽高手
60: LeBron James — 追帽是招牌
25: Stephen Curry — 后卫正常水平
15: Chris Paul — 矮个不盖帽

### 13. 篮板 — OffensiveRebound + DefensiveRebound
99: Dennis Rodman — 历史篮板痴汉
97: Shaquille O'Neal — 统治级篮板手
94: Ben Wallace — 篮板机器
92: Kevin Garnett — 连续赛季篮板王
90: Tim Duncan — 稳定两双机器
85: Anthony Davis — 现代篮板高手
80: Giannis Antetokounmpo — 后场篮板推进
65: LeBron James — 三双级别篮板
45: Stephen Curry — 后卫合格篮板
20: Jamal Crawford — 几乎不抢板

## 技能标签 skills（固定枚举，通常选 3-6 项）

可选值：Three Point / Mid-range / Finishing / Post / Handle / Isolation / Off-ball / Passing Vision / Tempo Control / Rebounding / POA Defense / Rim Protection

## 风格标签 style（固定枚举，通常选 1-3 项）

可选值：Shooter / ISO / Dunk Finisher / Primary Creator / Point Forward / Playmaking Big / Two-Way / 3&D / Defensive Anchor / Small-Ball Center / Glue Guy / Sixth Man

## 36 名球员（分 6 组，按位置）

### PG 组（5 人）
1. Stephen Curry — 斯蒂芬·库里 | PG | 188cm | 192cm | 84kg
2. Kyrie Irving — 凯里·欧文 | PG | 188cm | 193cm | 88kg
3. Chris Paul — 克里斯·保罗 | PG | 183cm | 194cm | 79kg
4. Russell Westbrook — 拉塞尔·威斯布鲁克 | PG | 193cm | 203cm | 91kg
5. Shai Gilgeous-Alexander — 谢伊·吉尔杰斯-亚历山大 | PG | 198cm | 213cm | 88kg

### SG 组（10 人）
6. Michael Jordan — 迈克尔·乔丹 | SG | 198cm | 212cm | 98kg
7. Kobe Bryant — 科比·布莱恩特 | SG | 198cm | 211cm | 96kg
8. James Harden — 詹姆斯·哈登 | SG | 196cm | 210cm | 100kg
9. Dwyane Wade — 德维恩·韦德 | SG | 193cm | 210cm | 100kg
10. Devin Booker — 德文·布克 | SG | 196cm | 204cm | 93kg
11. Klay Thompson — 克莱·汤普森 | SG | 196cm | 206cm | 98kg
12. Tracy McGrady — 特雷西·麦克格雷迪 | SG | 203cm | 218cm | 102kg
13. Vince Carter — 文斯·卡特 | SG | 198cm | 212cm | 100kg
14. Jamal Crawford — 贾马尔·克劳福德 | SG | 196cm | 208cm | 88kg
15. J.R. Smith — J.R.史密斯 | SG | 196cm | 208cm | 102kg

### SF 组（6 人）
16. LeBron James — 勒布朗·詹姆斯 | SF | 206cm | 214cm | 113kg
17. Kevin Durant — 凯文·杜兰特 | SF | 211cm | 226cm | 109kg
18. Kawhi Leonard — 科怀·伦纳德 | SF | 201cm | 221cm | 104kg
19. Paul George — 保罗·乔治 | SF | 203cm | 211cm | 100kg
20. Jimmy Butler — 吉米·巴特勒 | SF | 201cm | 203cm | 104kg
21. Carmelo Anthony — 卡梅洛·安东尼 | SF | 203cm | 213cm | 108kg

### PF 组（5 人）
22. Giannis Antetokounmpo — 扬尼斯·阿德托昆博 | PF | 211cm | 222cm | 110kg
23. Tim Duncan — 蒂姆·邓肯 | PF | 211cm | 230cm | 113kg
24. Dirk Nowitzki — 德克·诺维茨基 | PF | 213cm | 215cm | 111kg
25. Kevin Garnett — 凯文·加内特 | PF | 211cm | 226cm | 109kg
26. Dennis Rodman — 丹尼斯·罗德曼 | PF | 201cm | 218cm | 95kg

### C 组（10 人）
27. Nikola Jokic — 尼古拉·约基奇 | C | 211cm | 222cm | 129kg
28. Joel Embiid — 乔尔·恩比德 | C | 213cm | 231cm | 127kg
29. Shaquille O'Neal — 沙奎尔·奥尼尔 | C | 216cm | 231cm | 147kg
30. Hakeem Olajuwon — 哈基姆·奥拉朱旺 | C | 213cm | 218cm | 116kg
31. Victor Wembanyama — 维克托·文班亚马 | C | 224cm | 244cm | 107kg
32. Rudy Gobert — 鲁迪·戈贝尔 | C | 216cm | 236cm | 117kg
33. Bam Adebayo — 巴姆·阿德巴约 | C | 206cm | 218cm | 116kg
34. Anthony Davis — 安东尼·戴维斯 | C | 208cm | 227cm | 115kg
35. Draymond Green — 德雷蒙德·格林 | C | 198cm | 217cm | 104kg
36. Ben Wallace — 本·华莱士 | C | 206cm | 218cm | 109kg

## 输出要求

1. 输出完整 JSON 数组，以上 36 名球员全部包含
2. 每个球员的 13D 分数必须在锚定参考系内，同位置球员有区分度
3. skills 选 3-6 项，style 选 1-3 项，均来自枚举
4. id 使用英文小写连字符格式（如 "kevin-durant"）
5. positions 数组反映可打多个位置（如 KD 可打 SF 和 PF）
6. 输出后附自检报告（用中文或英文均可）：
   - 哪 3 个球员最难归类（标签覆盖不足或跨类别）
   - 13D 每个维度的最高分/最低分/中位数
   - style 标签使用频次排名
   - skills 标签使用频次排名

只输出 JSON 和自检报告，不要任何额外的解释文字。
