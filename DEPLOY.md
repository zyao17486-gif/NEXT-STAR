# Next Star 零成本部署指南

> 20 分钟上线，之后关电脑照常运行，总花费 ¥0。

## 前置准备

- GitHub 账号（免费）：github.com
- Vercel 账号（免费，用 GitHub 登录）：vercel.com
- Railway 账号（免费，用 GitHub 登录）：railway.app

## Step 1：推送到 GitHub（5 分钟）

1. 在 GitHub 点 "New Repository"，名称填 `next-star`，不要勾选任何初始化选项
2. 在终端执行：

```bash
git remote add origin https://github.com/你的用户名/next-star.git
git branch -M main
git push -u origin main
```

## Step 2：部署后端到 Railway（5 分钟）

1. 打开 railway.app，点 "New Project" → "Deploy from GitHub repo"
2. 选择 `next-star` 仓库
3. Railway 会自动检测到 `server/` 目录下有 `package.json`
4. **关键**：在 Railway 的环境变量里添加：
   ```
   DEEPSEEK_API_KEY=sk-你的DeepSeek密钥
   ```
5. 点 Deploy。部署完成后你会得到一个 URL，类似：
   ```
   https://next-star-api.railway.app
   ```
   记下这个 URL。

## Step 3：部署前端到 Vercel（5 分钟）

1. 打开 vercel.com，点 "New Project" → 选择 `next-star` 仓库
2. Vercel 会自动检测到 Vite 项目
3. **关键**：在环境变量里添加：
   ```
   VITE_API_URL=https://next-star-api.railway.app
   ```
   （用 Step 2 的实际 Railway URL 替换）
4. 点 Deploy。部署完成后你会得到一个 URL，类似：
   ```
   https://next-star.vercel.app
   ```

## Step 4：验证（1 分钟）

1. 打开 `https://next-star.vercel.app`，确认页面能正常加载
2. 点击"球探台"，输入一个搜索词，确认 AI 搜索能返回结果

## 以后怎么改代码

```bash
改代码 → git add -A → git commit -m "描述" → git push
```

Vercel 和 Railway 会自动检测到 GitHub 更新，30 秒后自动上线。和你本地开发只差 30 秒。

## 费用

| 项目 | 费用 |
|------|------|
| Vercel（前端托管） | ¥0/月 |
| Railway（后端托管） | ¥0/月（免费额度 500 小时/月） |
| DeepSeek API | ~¥10/月（日活 100 人） |
| 域名（可选） | ¥50/年 |
| **总计** | **≈ ¥10/月** |

## 自定义域名（可选）

1. 在 Cloudflare 买域名（¥50/年）
2. 在 Vercel 设置里添加域名
3. Vercel 自动配置 SSL 证书
