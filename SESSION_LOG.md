# 开发会话日志

> 每次对话结束后在此追加。下次新对话从此文件续上。

---

## 2026-06-23/24 — Session 10-11 · 13D 数据库重构 + 三层匹配引擎 + Bug 修复

### 做了什么
- **对照 AI 产品研发六阶段评估**：输出 Next Star 已达/未达评估报告，识别 5 大缺口（指标/数据库/算法/正规部署/安全检测）
- **球星模板库 36 人 13D 重构**：
  - 2KOL2 雷达图风格：身体/突破/篮下/背身/中投/三分/传球/控运/内防/外防/抢断/盖帽/篮板
  - 2K26 官方数据做锚点参考（爬取 2kratings.com），DeepSeek 批量生成
  - 评分规则：99 天花板，65 及格线
  - `src/data/star-players-13d.json`（36 人）+ Prompt 可复用
- **新秀库 36 人 13D 同步重构**：
  - DeepSeek 读球探报告 + 锚点 Prompt 生成
  - 新增 `isPolished`/`polishedReason` 标签（即战力/潜力股铆定在新秀库）
  - 合并回 `2026-draft-database.json`
- **三层匹配引擎重写**：
  - 50% 13D 余弦相似度 + 25% 位置匹配 + 25% 身体匹配（身高/臂展/体重）
  - 新增 Jaccard 标签相似度用于可解释性
  - 删除 `generateDNA()` 中 `polishedType` 权重调节
- **Onboarding 精简**：删除 Step 2（即战力/潜力股选择），3 步 → 2 步
- **UI 适配**：
  - DNAResult：6D → 13D 柱状图
  - PlayerProfile：饼图恢复，13D → 5 组融合扇区（内线进攻/投射/组织控运/防守/身体篮板）
  - Recommendations：5 条 → 13D 紧凑排序柱状图
  - 设计 Token PIE 6 色 → 5 组融合色
- **服务端 VECTOR_PROMPT 6D → 13D**
- **Bug 修复**（Session 11 代码审查）：
  - 🔴 LLM 输出键名与 `attrsToVector` 不匹配 → scout 查询向量全废
  - 🔴 embedding 10 维 vs 切片 13 维 → NaN 污染排序
  - 🔴 positionBonus 声明但从未应用 → 死代码删除
  - 🟡 Onboarding 死代码/不可达按钮/无效进度条
  - 🟡 rankLabels 数组越界
  - 🟡 PIE 未使用导入/else-if 不可达分支

### 关键决策
- 评分不用社区投票，用 2K26 官方数据
- 标签 + 向量双轨制（向量排序，标签解释）
- 即战力/潜力股从 DNA 阶段迁到新秀库标签
- 位置权重从 15% → 25%，新增身材层 25%
- 13D 饼图融合成 5 组避免拥挤

### 改动文件
- `src/data/star-players.ts` — 重写：13D 接口 + body + skills/style，删 polishedType
- `src/utils/dna-engine.ts` — 重写：三层匹配 (50/25/25) + Jaccard
- `src/styles/design-tokens.ts` — PIE 5 组融合色
- `src/app/App.tsx` — 删 polishedType，新增 body ref
- `src/app/components/Onboarding.tsx` — 删 Step 2，清死代码
- `src/app/components/DNAResult.tsx` — 13D 渲染
- `src/app/components/PlayerProfile.tsx` — 饼图 + 13D 融合柱状图
- `src/app/components/Recommendations.tsx` — 13D 柱状图
- `server/index.js` — VECTOR_PROMPT 13D + attrsToVector + NaN 修复
- `src/store/app-store.ts` — 无改动（类型兼容）
- **新建**：`star-players-13d.json`、`prospects-13d.json`、`star-template-prompt.md`、`prospect-13d-prompt.md`、生成脚本 ×2

### 架构

```
匹配引擎 (V3):
  用户选球星 → 13D 向量平均 → DNA
       │
       ├── 50% 13D 余弦相似度 vs 36 新秀
       ├── 25% 位置匹配（同位置 1.0 / 相邻 0.7 / 远 0.0）
       └── 25% 身体匹配（身高 ±3cm=1.0 / ±8cm=0.7 / ±15cm=0.3）
       │
       ▼
  综合排名 + Jaccard 标签差异说明

饼图融合:
  13D → 5 组扇区
  🔴 内线进攻 (突破+篮下+背身) / 🟢 投射 (中投+三分)
  🟡 组织控运 (传球+控运) / 🔵 防守 (内防+外防+抢断+盖帽)
  🟣 身体篮板 (身体+篮板)
```

### 待办
- [ ] 端到端实测（`npm run dev:all`，输入「亚历山大」验证匹配结果）
- [ ] VECTOR_PROMPT 调优（首次使用 2K26 锚点，需验证输出质量）
- [ ] 属性数据库质量审计（Session 9 遗留）

---

## 2026-06-22 — Session 9 · 产品策略会议

### 做了什么
- **完整产品策略会议**（6 阶段引导式推进）：
  - Phase 1 定位：用户双覆盖（泛球迷+深度球迷），情感锚点「找到下一个篮球信仰」
  - Phase 2 问题验证：4 大痛点排序——不知道有谁 > 找不到信息 > 无法直觉匹配 > 无法跟踪
  - Phase 3 方案探索：DNA 匹配最核心，关注功能最薄弱；产品形态定为「以球员为主体的半社交半信息平台」
  - Phase 4 路线图：V1 ✅ → V2 爬虫+DB → V3 Stock → V4 球员入驻 → V5 国内球员
  - Phase 5/6 待后续推进
- **关键洞察**：中代球迷面临偶像退役（詹/库/杜），「下一个十年该看谁」是产品最强叙事
- **竞争策略**：短期先发卡位 + Prompt 护城河；警惕腾讯/咪咕等版权巨头跟进

### 关键决策
- 关注功能须从「收藏夹」进化为「球员 Stock」动态追踪
- 验证策略：先用户测试（4）→ 手动 MVP（1）→ 再投入 V2 爬虫基建
- 产品形态：球员为主体，数据+新闻聚合，UGC 是补充，不做论坛
- 近期重点：用户测试 + AI PM 产出包（用于岗位 JD）

### 改动文件
- `PRODUCT_STRATEGY.md` — **新建**，完整策略输出（定位/痛点/路线图/行动项/决策记录）
- `TASK_BOARD.md` — 更新 V2 任务 + 新增用户测试/PM 产出包任务
- `SESSION_LOG.md` — 本条目

### 发现的问题
- **属性数据库质量问题**（邓肯 shooting=55 严重低估）：25 位球星 + 36 位新秀均为手写/AI 估算，缺乏统一评分标准。shooting 维度隐性偏向三分而忽略中距离。余弦相似度稀释了极端值差异（邓肯防守 95 vs Peat 62 仍被匹配）。需系统性数据审计，暂缓修复。
- **关注功能最薄弱**：当前只是收藏夹，需进化为 Stock 动态追踪
- **翻译接口无防护**：`/api/translate` 和 `/api/translate/batch` 缺少限流，已修复
- **CORS 裸奔**：已收紧为仅允许前端域名 + localhost

### 待办
- [ ] 属性数据库系统性审计（25 球星 + 36 新秀）
- [ ] 用户测试脚本 + 执行（5-10 人）
- [ ] AI PM 产出包（策略文档/用户故事/路线图/PRD）
- [ ] V2 爬虫设计（先验证再基建）

---

## 2026-06-22 — Session 8 · 关注同步修复 + 重置功能 + 引导 Tour + 访客计数器

### 做了什么
- **关注全链路同步修复**：
  - ScoutPage 新增关注/取消关注按钮（本地搜索 & AI 结果），接收 `followed`/`onToggleFollow` props
  - FollowingPage `lookupPlayerCard` 改为 draft DB 中英文双匹配，卡片按英文名去重
  - HomePage 位置标签中文化（POS_CN），关注球员卡片去重
  - PlayerProfile 球员不在 DB 时禁用关注按钮（防止误关注 DEFAULT 球员）
  - app-store `toggleFollow` 加 `isValidFollowName` 校验；新增 v1→v2 migration 自动清理旧中文名称
  - App.tsx 启动时 `cleanStaleFollows()` 强制扫 localStorage 清理残留
- **重置全部功能**：
  - Sidebar 新增「重置全部」按钮 + 确认弹窗（红色 T.danger 确认按钮）
  - app-store 新增 `fullReset()`：清 localStorage + 重置所有字段 + tourStep
- **移动端 AI 搜索框溢出修复**：placeholder 从 23 字缩为 10 字 + `text-ellipsis` 截断
- **首次使用引导 Tour**：
  - 新组件 `TourGuide.tsx`：遮罩 + 聚光灯 + 定位提示卡片（三步：☰→球探→AI 球探）
  - app-store 新增 `tourStep` 状态机（idle→step1→step2→step3→done）
  - 桌面端自动跳过 step1（侧边栏常显）；DNA 生成后进入主页自动触发
- **首页刷新黑屏修复**：Zustand 异步 hydration 改为同步读 localStorage 决定初始 screen
- **跳过引导修复**：`handleOnboardingSkip` 现在也标记 `hasCompletedOnboarding = true`
- **全局访客计数器**：
  - 新建 `functions/api/visitor.js`（Cloudflare Pages Function），用 Cache API 持久化
  - `index.html` 每页访问自动 POST `/api/visitor`
  - 终端查询：`curl -s https://next-star-5s9.pages.dev/api/visitor`

### 改动文件
- `src/app/components/ScoutPage.tsx` — 关注按钮 + AI placeholder 修复 + data-tour
- `src/app/components/FollowingPage.tsx` — lookupPlayerCard 双匹配 + 去重
- `src/app/components/HomePage.tsx` — 位置中文化 + 去重
- `src/app/components/PlayerProfile.tsx` — dbPlayer null 安全防护
- `src/app/components/Sidebar.tsx` — 重置按钮 + 确认弹窗 + data-tour
- `src/app/components/TourGuide.tsx` — **新建**，引导覆盖层组件
- `src/app/App.tsx` — cleanStaleFollows + 同步读 localStorage + handleReset + Tour 触发 + 跳过修复
- `src/store/app-store.ts` — isValidFollowName + v2 migration + fullReset + tourStep + advanceTour/dismissTour
- `index.html` — 访客计数器 script
- `functions/api/visitor.js` — **新建**，Cloudflare Pages Function 持久化计数器

### 关键决策
- 关注系统统一用 English name 存储，所有页面中英文双匹配查找
- 旧版硬编码中文名（迪伦·哈珀等）通过 migration + cleanStaleFollows 双保险清理
- 重置功能放在 Sidebar 底部弱色小字，不抢主导航
- 引导 Tour 用全屏遮罩 + CSS 定位箭头，不引入第三方库
- 访客计数器用 Cloudflare Cache API 持久化（免费、无需外部服务、自动跨边缘节点）

### 待办
- [ ] 配 Cloudflare 自定义域名
- [ ] 球员对比功能（V2）
- [ ] 计数器迁移到 KV 以获得更高持久性

---

## 2026-06-21 — Session 7 · 零成本上线 + 安全加固

### 做了什么
- **Railway 后端部署**：Express 服务部署到 `next-star-production.up.railway.app`，36 名球员加载成功，DeepSeek 已连接
- **GitHub Pages 部署**（已废弃）：SSH key 生成、base path 配置、gh-pages 分支
- **Cloudflare Pages 前端部署**：最终域名 `https://next-star-5s9.pages.dev`，`base: '/'`，不暴露 GitHub 账号
- **环境变量**：Cloudflare Pages 配 `VITE_API_URL` 指向 Railway
- **GitHub Pages 清理**：删除 gh-pages 分支、GitHub Actions 工作流、Settings → None
- **API 安全**：新增限流中间件——每 IP 每分钟 10 次 AI 搜索，超限返回 429。零依赖纯内存实现
- **Ball Profile 修复**：Hero 区域恢复身高/臂展/体重横排展示
- **球探台移动端修复**：工具栏换行、AI 分析按钮全宽 + ⚡ 图标
- **文件清理**：删除 DEPLOY.md、QQ 截屏、.github/workflows、Procfile、nixpacks.toml

### 最终架构
```
用户 → Cloudflare Pages (前端) → Railway (后端) → DeepSeek API
       next-star-5s9.pages.dev    :8080             api.deepseek.com
       (免费, 自动部署)           (免费额度)         (~¥10/月)
```

### 部署流程
改代码 → `git push` → Cloudflare + Railway 自动部署，1-3 分钟生效。

### 改动文件
- `server/index.js` — DB 路径修复 + 限流中间件
- `vite.config.ts` — base 路径：`/NEXT-STAR/` → `/` → Cloudflare
- `src/app/components/PlayerProfile.tsx` — Hero 恢复体测数据
- `src/app/components/ScoutPage.tsx` — 移动端工具栏换行
- 删除：`.github/workflows/`、`DEPLOY.md`、`QQ*.png`、`Procfile`、`nixpacks.toml`

### 待办
- [ ] 配 Cloudflare 自定义域名（需先购买）
- [ ] Railway 免费额度监控（500h/月）
- [ ] 球员对比功能（V2）

---

## 2026-06-21 — Session 6 · 设计系统 + 响应式 + 图片全删 + UI 重构

### 做了什么
- **设计 Token 系统**：新增 `src/styles/design-tokens.ts`，全站 10 个组件中所有硬编码颜色/字号/边框统一收敛为 T/BG/B/FONT/PIE/SCORE 常量。改一个值全站生效
- **图片全部删除**：PlayerProfile Hero→文字卡；Onboarding/DNAResult→删除全屏图片面板；ScoutPage→删除球员头像；HomePage/FollowingPage 早已无图片
- **响应式移动端**：侧边栏桌面固定左侧，手机端改为顶部导航栏+汉堡菜单滑入；主内容区 `lg:pl-[232px]`、手机 `px-5` 全宽
- **PlayerProfile Hero 重构**：位置去方框纯文字+"/学校"+关注按钮齐平右侧→中文名大字→英文名弱显示
- **概览 Tab 布局重排**：饼图全宽置顶→球员综述+优势/待观察→联赛数据→视频
- **饼图移动端蓝色方框修复**：globals.css 添加 Recharts SVG 全局 `outline:none`
- **中文名修正**：`adaptDraftPlayer` 中 `name` 从英文改为 `nameCn`，中文名大字+英文名弱显示
- **DNAResult bug 修复**：`talentType`→`polishedType`，AI 画像卡片标签从永远显示"勤奋型"改为正确的即战力/潜力型
- **代码审计**：删除 6 处死代码（MeasurementsCard/generateReason/toggle/Section arrow/onToggleFollow/无引用导出），修复 ScoutPage `setAiResult` 不存在的运行时 bug
- **globals.css 合并**：修复重复的 `*` 选择器导致 tap-highlight 规则被覆盖

### 关键决策
- 设计 Token 不等于代码优化——是维护性优化。后续改 UI 只改一个文件
- 移动端不做响应式重设计，只做基础适配（侧边栏+内边距+网格）
- 图片全删后不替代新图片——纯文字 UI 更诚实，比假 Unsplash 链接好

### 改动文件
- `src/styles/design-tokens.ts` — 新建，全站设计常量
- `src/styles/globals.css` — 合并 `*` 规则 + Recharts 焦点修复
- `src/app/components/PlayerProfile.tsx` — Hero 重构、概览重排、饼图焦点修复、中文名
- `src/app/components/Sidebar.tsx` — 响应式汉堡菜单
- `src/app/components/App.tsx` — 响应式主内容区
- `src/app/components/ScoutPage.tsx` — 删除头像、修复 setAiResult bug、useEffect 包装
- `src/app/components/Onboarding.tsx` — 删除左侧图片面板
- `src/app/components/DNAResult.tsx` — 删除右侧图片面板、talentType→polishedType
- `src/app/components/Recommendations.tsx` — Token 迁移、删除 generateReason
- `src/app/components/FollowingPage.tsx` — Token 迁移
- `src/app/components/HomePage.tsx` — Token 迁移、删除 onToggleFollow/arrow
- `src/app/components/ArticlePage.tsx` — Token 迁移

### 待办
- [ ] 接入真实新闻 URL
- [ ] 球员对比功能原型
- [ ] 移动端更多页面适配测试

---

## 2026-06-21 — Session 5 · 全面清理 + 产品收尾

### 做了什么
- **产品收敛**：删除 PushPage/ArticlePage（第一次），视频模块→待开发，AI洞察→待开发，Stock→待开发
- **主页实用化**：日期改为实时计算 + 选秀倒计时；新闻改为3篇真实翻译文章（ESPN/The Athletic/Bleacher Report），点击进应用内文章页，底部附原文链接；副标题一句话显示
- **推荐页优化**：标签简化为仅位置；卡片格式 POS/SEC·School；中文名+弱英文
- **关注页/主页关注卡片**：删除图片，纯色文字卡片，中文名+弱英文
- **球探台**：删除位置筛选标签，普通搜索+AI搜索结果均限5条
- **数据库**：36名球员新增 nameCn 中文名、混合位置 positions[]、bbiq/motor/physicalScore/injuryFlag/age/productionScore/isPolished
- **代码清理审计**：修复2个运行时bug（DNAResult talentType→polishedType、ScoutPage setAiResult不存在→setAiSearchQuery）；删除6处死代码（MeasurementsCard/generateReason/toggle/Section arrow/onToggleFollow/无引用导出）；修复DNAResult永远显示"勤奋型"的bug
- **侧边栏**：添加DNA测评入口，删除推送导航

### 关键决策
- ArticlePage 重建为轻量新闻阅读页（含原文外链）
- 视频/Stock/AI洞察全部标"待开发"——不假装有功能
- 新闻用真实来源 + 完整翻译文章，不做假新闻
- 球探台精简化：去筛选、限结果

### 改动文件
- `src/app/components/HomePage.tsx` — 实时日期、新闻翻译、卡片去图、Stock/视频→待开发
- `src/app/components/PlayerProfile.tsx` — 视频→待开发、AI洞察→待开发、删除MeasurementsCard
- `src/app/components/Recommendations.tsx` — 标签简化、卡片格式、中文名、删除generateReason
- `src/app/components/ScoutPage.tsx` — 去筛选标签、限5条、修复setAiResult bug
- `src/app/components/FollowingPage.tsx` — 卡片去图、中文名
- `src/app/components/ArticlePage.tsx` — 重建为新闻阅读页
- `src/app/components/Sidebar.tsx` — 删推送、加DNA测评
- `src/app/components/DNAResult.tsx` — 修复talentType→polishedType bug
- `src/app/components/Onboarding.tsx` — 删除死代码toggle
- `src/app/App.tsx` — 精简Screen类型、文章路由
- `src/data/2026-draft-database.json` — nameCn + 新字段
- `scripts/update-db.mjs` — 数据库更新脚本

### 待办
- [ ] 接入真实 URL（需要确认 ESPN/The Athletic 具体文章链接）
- [ ] 球员对比功能原型
- [ ] 收藏列表智能分析

---

## 2026-06-21 — Session 4 · 6D 系统升级 + 位置加权 + 即战力/潜力股

### 做了什么
- **5D → 6D**：DNA 引擎、数据库全部加入 rebounding（篮板）维度
- **位置过滤 → 位置加权**：同位置 +15% 分数加成，不再排除其他位置球员
- **Top 3 → Top 4 + 多样性约束**：确保推荐覆盖至少 2 种不同主导风格
- **天赋/勤奋 → 即战力/潜力股**：Onboarding Step 3 重命名，权重向量更新
- **数据库新增 8 个字段**：rebounding、positions[]（混合位置）、bbiq、motor、physicalScore、injuryFlag、age、productionScore、isPolished
- **饼图 6 扇区**：运动天赋从独立进度条移入饼图，6 色完整展示
- **球星库 6D 更新**：25 名球星全部补充 rebounding + polishedType/polishedRatio
- **后端 6D**：VECTOR_PROMPT 6 维、余弦相似度 6D、DNA 混合支持

### 关键决策
- 位置问题由混合位置数组 `positions[]` 解决（如 AJ Dybantsa = ["SF","SG"]）
- 即战力/潜力股的权重差异侧重不同维度：即战力 boost 投篮+防守+篮板，潜力股 boost 终结+运动
- 饼图不再展示独立运动天赋进度条（6 维统一在 donut 中）

### 改动文件
- `scripts/update-db.mjs` — 批量数据库更新脚本
- `src/data/2026-draft-database.json` — 36 人新增 8 字段
- `src/data/star-players.ts` — 25 人 6D + polishedType
- `src/utils/dna-engine.ts` — 6D 引擎重写 + 位置加权 + 多样性
- `src/app/App.tsx` — talentType→polishedType, topN=4
- `src/app/components/Onboarding.tsx` — 即战力/潜力股新文案
- `src/app/components/PlayerProfile.tsx` — 6 扇区饼图
- `src/app/components/DNAResult.tsx` — 6D 展示
- `server/index.js` — 6D 向量 + 位置加权

### 待办
- [ ] 删除 PushPage/ArticlePage 组件及路由
- [ ] 删除 YouTube 搜索链接
- [ ] 删除 `/api/nba/stats` 端点
- [ ] 球员对比功能原型（V2）

---

## 2026-06-21 — Session 3 · 产品审计 + 饼图对比放大 + 模板句摘出 + 体测删除

### 做了什么
- **饼图对比放大**：`SkillChart` 用 `Math.pow(value, 1.8)` 非线性放大扇区差距，主导项扇区+发光描边+图例高亮。不再严格按数值比例
- **优势固定 3 条**：`adaptDraftPlayer` 从 `slice(0,6)` 改 `slice(0,3)`，PLAYERS_DATA 中 5 人 strengths 从 5 条裁为 3 条
- **删除体测数据**：移除 Hero 下方独立 `MeasurementsCard` + 右侧列"体测数据"段落。右侧列只剩联赛数据 + 能力饼图
- **模板句摘出**：新增 `extractTemplate()` 函数，14 种关键词匹配（模板/可比拟/对标/对比/类比/比较/式…），从综述末尾自动提取模板参考句，在概述卡片中以 📋 高亮条单独展示。34/36 球员覆盖
- **标签亮度全局提升**：`0.3→0.5` / `0.28→0.45` / `0.35→0.55` / `0.4→0.6` / `0.2→0.4`

### 产品审计结论
- ✅ 保留 8 项：入职/DNA/匹配/搜索/详情/饼图/关注/中文报告
- ❌ 删除 4 项：PushPage、ArticlePage、YouTube 假链接、`/api/nba/stats` 无用端点
- ⏸️ 延后 8 项：生涯模拟、三年计划、模板卡片、试训排名、球员对比、趋势排名、视频策展、社交分享

### 改动文件
- `src/app/components/PlayerProfile.tsx` — 上述所有 UI 改动
- `NEXT_STAR_ARCHITECTURE.md` — 新建，产品审计 + 9 个 Skill 规格 + V1/V2/V3 路线图
- `PROJECT_OVERVIEW.md` — 新建，给 GPT 读的项目全景文档

### 待办（下次对话可接手）
- [ ] 删除 PushPage.tsx / ArticlePage.tsx 组件及 App.tsx 路由
- [ ] 删除 YouTube 搜索链接（或替换为真实视频源）
- [ ] 删除 `server/index.js` 中 `/api/nba/stats` 端点
- [ ] 球员对比功能原型（并排雷达图 + AI 差异总结）
- [ ] 收藏列表智能分析

---

## 2026-06-21 — Session 1-2 · UI 优化与数据展示改进

### 做了什么
- **主页关注球员卡片**：点击直接跳转球员详情页（不再跳转关注页）
- **球员详情页 Hero 区域清理**：
  - 删除重复学校名称（中文+英文重复）
  - 删除重复球员英文名（DB 球员中英文名相同的情况）
  - 预测顺位仅在有真实顺位时显示（无则隐藏）
- **全部数据公制化**：
  - `MeasurementsCard` 仅显示公制（cm/kg），移除英制
  - `DraftCombineTable` 体测数据全部转为公制（英寸→厘米）
  - 所有数值取整不保留小数
- **中文化**：
  - 新增 120+ 篮球标签英→中翻译映射（`TAG_CN`）
  - DB 球员的 strengths/weaknesses 标签自动翻译
  - 全部 UI 标签中文化
- **概览右侧改为体测数据+联赛数据**：
  - 右栏上方新增「体测数据」（身高/臂展/体重/站立摸高）
  - 右栏下方新增「联赛数据」（位置/球队/预测顺位/最近赛季）
  - 「能力特征」饼图保留在下方
- **饼图权重优化**：5 维属性值归一化为百分比（总和=100%），分布更清晰
- **球探台重建**：
  - 本地搜索数据源从 6 人扩展至 36 人完整选秀数据库
  - 列表移除头像
  - 筛选改为按位置（控卫/得分后卫/小前锋/大前锋/中锋）

### 修改文件
- `src/app/components/HomePage.tsx` — 卡片点击导航修复
- `src/app/components/PlayerProfile.tsx` — Hero 清理 + 公制 + 中文化 + 布局调整 + 饼图数据归一化 + profile_text_cn
- `src/app/components/ScoutPage.tsx` — 球员列表替换为 36 人 DB + 去头像
- `src/app/components/FollowingPage.tsx` — 预测顺位条件显示
- `server/index.js` — 新增 `/api/translate` 和 `/api/translate/batch` 翻译端点
- `src/data/2026-draft-database.json` — 36 名球员新增 `profile_text_cn` 中文字段

---

## 2026-06-20 — 项目清理与优化

### 做了什么
- **清理 48 个未使用的 shadcn/ui 组件** (`src/app/components/ui/`)，这些来自 Figma 模板但项目中完全未引用
- **删除死代码**：`BottomNav.tsx`（只返回 `null`）、`src/imports/image.png`、`default_shadcn_theme.css`、`guidelines/Guidelines.md`、`ATTRIBUTIONS.md`、`pnpm-workspace.yaml`
- **卸载 152 个未使用的 npm 包**：MUI、Emotion、react-router、react-dnd、react-hook-form、sonner、vaul、cmdk、所有 Radix UI 原语等
- **合并 App.tsx 重复的 React 导入**（`useMemo` 原为独立 import）
- `node_modules` 从约 210MB 缩减至 104MB
- 构建验证通过 ✅

### 当前剩余依赖（精简后）
| 包 | 用途 |
|---|---|
| `react` / `react-dom` | 框架 |
| `motion` | 动画（framer-motion） |
| `zustand` | 状态管理 + localStorage 持久化 |
| `@tanstack/react-query` | API 缓存 |
| `@balldontlie/sdk` | NBA 数据 |
| `recharts` | 球员雷达图 |
| `tailwindcss` / `@tailwindcss/vite` / `tw-animate-css` | 样式 |
| `vite` / `@vitejs/plugin-react` | 构建工具 |

---

## 2026-06-20（之前）— 核心功能开发

### 做了什么
- 搭建 React + TypeScript + Vite 项目（Figma 模板生成）
- 创建 36 人 2026 年 NBA 选秀数据库 (`src/data/2026-draft-database.json`)
- 创建 25 位传奇球星数据库 (`src/data/star-players.ts`)
- 实现篮球 DNA 算法引擎 (`src/utils/dna-engine.ts`)
  - 余弦相似度匹配
  - 5 维属性模型（终结、投篮、组织、防守、运动能力）
  - 位置首选匹配 + 天赋/勤奋权重微调
- 重写 3 步入职流程 (`Onboarding.tsx`)
  - 位置选择 → 球星选择 → 天赋/勤奋偏好 → 算法生成 DNA → 推荐球员
- 集成 Zustand 状态管理（`src/store/app-store.ts`）
- 集成 balldontlie NBA 数据 API（`src/services/stats-service.ts`）
- 集成 TanStack Query 缓存（`src/services/query-client.ts`, `use-scout-ai.ts`）
- AI 球探搜索页面（Express 后端 + DeepSeek API）
- 球员详情页、关注页、推送页、文章页
- 公制单位转换（英寸→厘米，磅→千克）

### 项目架构
```
src/
  app/
    App.tsx              — 主状态机（屏幕切换）
    components/
      Onboarding.tsx      — 3 步入职流程
      DNAResult.tsx       — DNA 结果展示
      Recommendations.tsx — 推荐球员卡片
      HomePage.tsx        — 首页（明日之星）
      ScoutPage.tsx       — AI 球探搜索
      PlayerProfile.tsx   — 球员详情
      FollowingPage.tsx   — 关注列表
      PushPage.tsx        — 推送页
      ArticlePage.tsx     — 文章页
      Sidebar.tsx         — 侧边导航
  data/
    2026-draft-database.json — 36 名选秀球员
    star-players.ts          — 25 名传奇球星
  utils/
    dna-engine.ts            — DNA 算法核心
  store/
    app-store.ts             — Zustand 全局状态
  services/
    query-client.ts          — TanStack Query 配置
    use-scout-ai.ts          — AI 搜索 Hook
    stats-service.ts         — NBA 数据服务
  styles/
    index.css                — 样式入口
    fonts.css                — 字体加载（Noto Sans SC + Inter）
    globals.css              — 全局样式（滚动条、选中）
    tailwind.css             — Tailwind v4 配置
    theme.css                — 暗色主题变量
server/
  index.js                   — Express 后端 + DeepSeek API
```

### 启动方式
```bash
npm run dev          # 前端（Vite）
npm run dev:server   # 后端（Express）
npm run dev:all      # 同时启动
```
