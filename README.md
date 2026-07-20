# Next Star

面向中国 NBA 球迷的 2026 届新秀发现应用。用户选择场上位置和喜欢的 NBA 球星后，系统生成 13 维篮球 DNA，并结合球风、位置和身体条件推荐新秀；AI 球探支持使用自然语言描述目标球员类型。

- 正式站：[next-star-5s9.pages.dev](https://next-star-5s9.pages.dev)
- 前端：React 18、TypeScript、Vite、Tailwind CSS、Zustand、TanStack Query
- 后端：Node.js、Express、DeepSeek API
- 部署：Cloudflare Pages + Railway

## 核心功能

- 位置与球星偏好引导
- 13 维篮球 DNA 生成
- 球风、位置和身体条件三层匹配
- 新秀详情、选秀信息与球探报告
- AI 自然语言球探搜索
- 本地持久化的关注列表
- 响应式布局与键盘可访问性

## 项目结构

```text
src/                  React 前端
  app/                页面与组件
  data/               前端主数据库与球星模板
  services/           API 查询与缓存
  store/              Zustand 持久化状态
  utils/              DNA 与匹配算法
server/               Express / DeepSeek 后端
functions/            Cloudflare Pages Functions
scripts/              数据生成与同步脚本
docs/                 UI 与数据维护规范
```

## 本地开发

要求 Node.js 20 或更高版本。

```bash
npm install
```

复制环境变量示例：

```bash
copy .env.example .env
copy server\.env.example server\.env
```

在 `server/.env` 中配置 `DEEPSEEK_API_KEY`。不要提交 `.env` 或真实密钥。

分别启动前后端：

```bash
npm run dev
npm run dev:server
```

Windows 下也可以同时启动：

```bash
npm run dev:all
```

前端默认运行在 `http://localhost:5173`，并将 `/api` 代理到 `http://localhost:3001`。

## 常用命令

```bash
npm run dev          # 启动前端
npm run dev:server   # 同步数据并启动后端
npm run dev:all      # Windows：同时启动前后端
npm run sync:data    # 将前端主数据库同步到 server/data
npm run typecheck    # TypeScript 静态检查
npm test             # 运行核心单元测试
npm run check        # 执行完整交付检查
npm run build        # 生成生产构建
```

## 数据维护

`src/data/2026-draft-database.json` 是新秀数据的主副本。修改后必须执行：

```bash
npm run sync:data
```

提交前应确认 `src/data/2026-draft-database.json` 与 `server/data/2026-draft-database.json` 一致。球员字段规范见 [docs/DATA_AUTHORING.md](docs/DATA_AUTHORING.md)，UI 规范见 [docs/UI_FRAMEWORK.md](docs/UI_FRAMEWORK.md)。

`scripts/prompts/` 和生成脚本用于维护 13 维球员数据；生成的原始中间文件已被 Git 忽略。

## 部署

### Cloudflare Pages

- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量：`VITE_API_URL=https://next-star-production.up.railway.app`

### Railway

- 服务根目录：`server`
- 启动命令：`npm start`
- 必需环境变量：`DEEPSEEK_API_KEY`

部署前必须先运行 `npm run sync:data` 并提交同步后的服务端数据库。Railway 的生产启动不能依赖 `server/` 目录之外的脚本。

## 交付检查

```bash
npm run check
```

该命令依次检查前后端依赖高危漏洞、数据库一致性、TypeScript、核心单元测试、服务端语法、生产构建和入口包体积。入口 JavaScript 的 gzip 预算为 185 KiB；安全审计固定使用 npm 官方公告接口，避免本地镜像源缺少审计能力。

GitHub Actions 会在质量分支、`main` 推送和面向 `main` 的 Pull Request 上自动运行同一套检查。

上线后检查：

- `/` 返回前端页面
- `/api/visitor` 可由 Cloudflare Function 响应
- Railway `/api/health` 返回 `status: ok`、`ready: true`、`playersLoaded: 38`，并携带 `release` 与 `uptimeSeconds`
- 正式站域名通过后端 CORS 预检

Railway 日志采用单行 JSON：每个请求包含 `requestId`、方法、路径、状态码和耗时，响应同步返回 `X-Request-ID`。AI 失败及核心任务完成事件使用同一请求 ID 串联；日志不会记录用户搜索原文、翻译正文或内部向量。
