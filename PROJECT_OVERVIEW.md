# 🏀 Premium Basketball Discovery App — 项目全景文档

## 一句话概述

一款面向 NBA 球迷的 **2026 年 NBA 选秀新秀发现平台**。用户通过 3 步入职流程生成个人"篮球 DNA"，算法匹配最契合的选秀新秀；同时内置 AI 球探搜索引擎、球员详情页、关注列表和个性化资讯推送。

---

## 1. 产品体验

### 用户旅程

```
入职流程（首次）→ DNA 展示 → 推荐球员 → 主页 → 自由浏览
```

#### 第一步：位置选择 → 球星选择 → 天赋/勤奋偏好
- 从 5 个位置（控卫/分卫/小前锋/大前锋/中锋）中选择
- 每个位置展示 5 名传奇球星（如控卫：库里、欧文、保罗、威少、乔丹）
- 选择 1 名最欣赏的球星，或跳过
- 选择"天赋型"或"勤奋型"篮球哲学

#### 第二步：AI 生成"篮球 DNA"
- 算法综合所选球星的 5 维属性向量，生成用户专属 DNA
- 5 个维度：**终结能力 / 投篮能力 / 组织能力 / 防守能力 / 运动天赋**
- 以全屏动画展示 5 根进度条依次加载

#### 第三步：余弦相似度匹配 → 推荐 3 名新秀
- 将用户 DNA 向量与 36 名 2026 选秀球员的属性向量逐一比对
- 优先推荐同位置球员，再跨位置补充
- 展示匹配分数、球员卡片

#### 进入主页后
- **侧边栏导航**：主页 / 球探台 / 资讯推送 / 关注列表
- 点击任意球员卡片进入详情页
- 详情页含概览（综述+能力饼图）、数据（联合试训/赛季统计）、AI 洞察（生涯模拟+模板对比+成长计划）

---

## 2. 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | UI 组件与类型安全 |
| 构建工具 | Vite 6.3.5 | 开发服务器与生产构建 |
| CSS | Tailwind CSS v4 | 原子化样式 |
| 图表 | Recharts 2.x (PieChart) | 球员能力饼图 |
| 动画 | motion (Framer Motion) | 页面过渡、加载动画 |
| 状态管理 | Zustand + persist → localStorage | 全局状态（DNA、关注列表） |
| 数据缓存 | TanStack Query (React Query) v5 | 异步数据获取与缓存 |
| NBA 数据 | @balldontlie/sdk | NBA 球员赛季数据 API |
| 后端 | Express.js (Node.js) | AI 球探搜索、文本翻译 |
| AI | DeepSeek API | 自然语言→属性向量转换、球员解释生成、中英翻译 |
| 算法 | 余弦相似度 | 球员匹配核心算法 |

---

## 3. 架构图

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                     │
│                                                       │
│  App.tsx (路由状态机)                                  │
│  ├── Onboarding (3步入职)                              │
│  ├── DNAResult (DNA展示)                               │
│  ├── Recommendations (推荐结果)                        │
│  ├── HomePage (主页)                                   │
│  ├── ScoutPage (AI球探台)                              │
│  ├── PlayerProfile (球员详情)                          │
│  ├── FollowingPage (关注列表)                          │
│  ├── PushPage (资讯推送)                               │
│  └── Sidebar (侧边栏导航)                              │
│                                                       │
│  State: Zustand Store (persist → localStorage)        │
│  Cache: TanStack Query                                │
│  Data: 2026-draft-database.json (36 players)          │
│         star-players.ts (25 legends)                   │
│                                                       │
│  Algorithm: dna-engine.ts                              │
│  └── DNA生成 / 余弦相似度 / 位置优先匹配               │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────────────┐
│              Express Backend (:3001)                   │
│                                                       │
│  POST /api/scout         AI 球探搜索 (3阶段)          │
│  POST /api/scout/quick   快速模式 (仅向量匹配)         │
│  GET  /api/nba/stats     球星赛季数据                 │
│  POST /api/translate     单条文本翻译                  │
│  POST /api/translate/batch 批量翻译36人综述             │
│  GET  /api/health        健康检查                      │
│                                                       │
│  External: DeepSeek API (deepseek-chat)                │
└─────────────────────────────────────────────────────┘
```

---

## 4. 核心算法

### 4.1 篮球 DNA 生成 (`dna-engine.ts`)

```
输入：selectedPosition, selectedStarPlayerIds[], talentType
                    ↓
        1. 提取选中球星的 5D 属性向量
        2. 无选中时回退到位置基线向量
        3. 逐元素平均 → rawAvg
        4. 应用天赋/勤奋权重向量（元素乘）
           talentType="talent": [1.08, 0.95, 0.95, 0.88, 1.12]
           talentType="hardwork": [0.90, 0.95, 0.95, 1.12, 0.88]
        5. 归一化到 [0, 100] → 最终 DNA 向量
        6. 生成描述文本 + 位置画像
                    ↓
输出：DNAResult { vector: number[5], dimensions, description, positionProfile }
```

### 4.2 余弦相似度匹配

```javascript
cosineSimilarity(a, b) = (a·b) / (|a| × |b|)  // 值域 [0, 1]

// 位置优先策略：
// 1. 从同位置球员中选 topN
// 2. 不足时从其他位置补充
// 3. 按相似度降序排列
```

### 4.3 AI 球探搜索（3 阶段流水线）

```
Phase 1: Query → Vector (DeepSeek)
  用户自然语言 → LLM 转换为 5D 属性向量
  例："能投篮还会传球的控卫" → {finishing:60, shooting:85, playmaking:90, defense:55, athleticism:70}

Phase 2: Cosine Similarity Ranking (本地计算)
  查询向量 × 36名球员属性向量 → 相似度排名 → Top 3
  
  混合策略：
  - 属性余弦相似度：80% 权重
  - Embedding 余弦相似度：20% 权重
  - 若用户已完成入职，查询向量与用户DNA 7:3 混合

Phase 3: LLM Explained (DeepSeek)
  Top 3 球员上下文 → LLM 生成推荐理由、优势、风险
```

---

## 5. 页面功能详解

### 5.1 主页 (`HomePage.tsx`)
- 运营卡片轮播（热门新秀、球探台入口）
- "潜力新秀"网格：展示 36 名2026选秀球员卡片
- 点击卡片 → 跳转球员详情
- 侧边栏导航

### 5.2 球员详情 (`PlayerProfile.tsx`)
**概览标签页：**
- **Hero 区**：球员照片、位置标签、球队、姓名（中/英）、预测顺位、关注按钮
- **球员综述**：AI 翻译的中文球探报告
  - 模板参考句自动从综述中摘出，以 📋 高亮条单独展示
- **优势 / 待观察**：各 3 项固定条目
- **联赛数据**：位置、球队、预测顺位、最近赛季 PPG
- **能力特征饼图**：非线性对比放大（幂变换 1.8）突出球员最鲜明风格，主导项高亮
- **模板对比**：最佳/风险模板展示（概览下独立模块）

**数据标签页：**
- 联合试训数据表（站立摸高、弹跳、速度测试 + 排名）
- 或历年赛季数据表（GP/PPG/RPG/APG/FG%/3P%/FT%/TS%/PER）

**AI 洞察标签页：**
- 职业生涯模拟（最好/正常/保底三种情景）
- 最佳与最差模板对比
- 三年成长计划

### 5.3 AI 球探台 (`ScoutPage.tsx`)
- 搜索框：自然语言搜索球员（如"谁最像杨瀚森"、"3D侧翼投篮好"）
- 位置筛选：按控卫/分卫/小前锋/大前锋/中锋过滤
- 搜索结果卡片：匹配分数 + AI 推荐理由 + 优势/风险
- 点击结果 → 跳转球员详情

### 5.4 关注列表 (`FollowingPage.tsx`)
- 展示已关注球员卡片
- 点击 → 球员详情

### 5.5 资讯推送 (`PushPage.tsx`)
- NBA 选秀相关资讯推送
- 点击文章 → 文章详情页

---

## 6. 数据层

### 6.1 2026 选秀球员数据库 (`2026-draft-database.json`)
- 36 名 2026 年 NBA 选秀热门新秀
- 字段：id, name, position, team, height/weight/wingspan, heightInches
- 属性向量：`attributes.{finishing, shooting, playmaking, defense, athleticism}` (0–100)
- 球探标签：`tags[]` (120+ 英文标签 → 中文映射)
- 球探报告：`profile_text` (英文原文) + `profile_text_cn` (DeepSeek 翻译)
- 联合试训数据：`combine.{standingReach, maxVert, laneAgility, ...}`
- Embedding 向量：用于语义混合搜索
- 图片：`img` + `imgHero`

### 6.2 传奇球星库 (`star-players.ts`)
- 25 名历史/现役传奇球星（5 个位置 × 5 人）
- 每人包含：5D 属性向量 + 标签 + 天赋值 (talentRatio)

### 6.3 中文翻译映射 (`TAG_CN`)
- 120+ 篮球术语英→中对照表
- 例："pick-and-roll maestro" → "挡拆大师"

---

## 7. 状态管理

```
Zustand Store (localStorage 持久化)

├── followed: string[]          关注球员名称列表
├── dnaData: DNAResult | null  用户篮球 DNA
├── dnaVector: number[] | null 5D DNA 向量
├── recommendations: []        推荐新秀列表
└── hasCompletedOnboarding: bool 是否已完成入职
```

---

## 8. 项目结构

```
Premium Basketball Discovery App/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # 路由状态机（9 个 Screen）
│   │   └── components/
│   │       ├── Onboarding.tsx          # 3 步入职流程
│   │       ├── DNAResult.tsx           # DNA 全屏展示
│   │       ├── Recommendations.tsx     # 推荐结果页
│   │       ├── HomePage.tsx            # 主页（新秀卡片+运营位）
│   │       ├── PlayerProfile.tsx       # 球员详情（3标签页）
│   │       ├── ScoutPage.tsx           # AI 球探台
│   │       ├── FollowingPage.tsx       # 关注列表
│   │       ├── PushPage.tsx            # 资讯推送
│   │       ├── ArticlePage.tsx         # 文章详情
│   │       └── Sidebar.tsx            # 侧边栏导航
│   ├── data/
│   │   ├── 2026-draft-database.json   # 36 名选秀球员完整数据
│   │   └── star-players.ts            # 25 名传奇球星
│   ├── store/
│   │   └── app-store.ts               # Zustand 全局状态
│   ├── services/
│   │   ├── use-scout-ai.ts            # AI 球探 Hook
│   │   └── stats-service.ts           # NBA 数据服务
│   ├── utils/
│   │   └── dna-engine.ts              # 核心算法（DNA+匹配）
│   └── main.tsx                        # Vite 入口
├── server/
│   └── index.js                        # Express 后端（DeepSeek API）
├── package.json
├── vite.config.ts
└── index.html
```

---

## 9. 本地运行

```bash
# 安装依赖
npm install

# 同时启动前端 (Vite :5173) 和后端 (Express :3001)
npm run dev:all

# 或分别启动
npm run dev          # 前端
npm run dev:server   # 后端
```

**后端依赖 `.env` 文件：**
```
DEEPSEEK_API_KEY=sk-xxx    # DeepSeek API 密钥（AI 球探功能必需）
PORT=3001                   # 后端端口（可选）
```

---

## 10. UI 设计特征

- **暗色主题**：全黑背景 (#000)，卡片使用 `#0a0a0a`
- **层级边框**：`rgba(255,255,255,0.06)` 细线分隔
- **发光点缀**：饼图主导扇区带 `drop-shadow` 发光
- **运动动画**：Framer Motion 页面过渡 + Recharts 饼图入场动画
- **中文本地化**：所有标签、标签、球探报告均已中文化
- **字体**：Noto Sans SC（中文）+ Inter（数字/英文）
