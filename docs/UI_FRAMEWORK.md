# Next Star UI Framework v3

> 所有新功能、新页面必须遵循本文档。  
> Token 定义在 `src/styles/design-tokens.ts`，改一处全局生效。

---

## 1. 字体

```ts
fontFamily: "'Noto Sans SC', 'Inter', sans-serif"
```

- 中文优先 Noto Sans SC，数字/英文回退 Inter
- 数据表、英文名、数字使用 `fontFamily: "'Inter', sans-serif"`
- 全站统一，禁止使用其他字体

---

## 2. 颜色系统 (Token `T`)

| Token | 值 | 用途 | 禁止用于 |
|---|---|---|---|
| `T.white` | `#fff` | 页面主标题、球员名、激活态文字 | 正文段落 |
| `T.hero` | `rgba(255,255,255,0.70)` | 综述正文、长段落 | — |
| `T.body` | `rgba(255,255,255,0.50)` | 常规文字、描述、标签文字 | 标题 |
| `T.label` | `rgba(255,255,255,0.42)` | 副标题、输入框标签、section label | 正文、标题 |
| `T.dim` | `rgba(255,255,255,0.30)` | 弱化文字、非激活导航、时间戳 | 重要信息 |
| `T.hint` | `rgba(255,255,255,0.22)` | 占位提示、次要 meta | — |
| `T.ghost` | `rgba(255,255,255,0.15)` | 最弱文字、空状态、"待开发" | — |
| `T.accent` | `#ffd60a` | AI 功能高亮、特殊标记 | 非 AI 场景 |
| `T.danger` | `#ff453a` | 风险标签、删除按钮 | — |
| `T.success` | `#30d158` | 优势标签、高分标记 | — |

### 颜色使用铁律

- **标题永远是 `T.white`**，不允许用 body/dim 做标题
- **正文永远是 `T.body`**（短文本）或 `T.hero`（长段落综述）
- **标签永远是 `T.label`**，uppercase + letter-spacing
- **分割线/弱化内容用 `T.dim` ~ `T.ghost`**，按重要程度递减
- 不要用 `opacity` 属性来降透明度——直接用 Token 对应的值

---

## 3. 背景系统 (Token `BG`)

| Token | 值 | 用途 |
|---|---|---|
| `BG.page` | `#000` | 页面底色 |
| `BG.card` | `#0a0a0a` | 卡片、表格、面板底色 |
| `BG.raised` | `#111` | 表头、更高层级表面 |
| `BG.overlay` | `rgba(255,255,255,0.06)` | 激活态、选中态叠加 |
| `BG.hover` | `rgba(255,255,255,0.04)` | hover 高亮 |
| `BG.subtle` | `rgba(255,255,255,0.03)` | 极浅叠加 |

规则：
- 页面根节点 `background: BG.page`
- 所有卡片 `background: BG.card` + `border: B.card`
- 激活/选中元素用 `BG.overlay` 叠加
- **不要硬编码 `#0a0a0a` 或 `rgba(...)` 作为背景色**

---

## 4. 边框系统 (Token `B`)

| Token | 透明度 | 用途 |
|---|---|---|
| `B.card` | 8% | 卡片外框（默认） |
| `B.subtle` | 10% | 次要按钮、非激活卡片 |
| `B.visible` | 14% | 需要突出的元素 |
| `B.active` | 35% | 强激活/聚焦 |
| `B.divider` | 6% | 内部分割线 |

规则：
- 卡片一律 `border: B.card`
- 列表项之间分割用 `borderBottom: B.divider`
- 非激活按钮 `border: B.subtle`
- **不要硬编码 `1px solid rgba(255,255,255,0.xx)`**

---

## 5. 字号层级 (Token `FONT`)

| Token | 大小 | 用途 |
|---|---|---|
| `FONT.xs` | 11px | 徽章、uppercase 标签、表格脚注 |
| `FONT.sm` | 13px | 次要文字、meta 信息、时间戳 |
| `FONT.base` | 14px | 正文、按钮、标签、导航 |
| `FONT.md` | 15px | 子标题、强调文字 |
| `FONT.lg` | 16px | 卡片名、列表标题 |
| `FONT.xl` | 18px | 长文正文、大号强调 |

### 标题字号（clamp 响应式，不用 FONT token）

| 场景 | 字号 | 字重 | letterSpacing |
|---|---|---|---|
| 页面主标题 (H1) | `clamp(32px, 3.5vw, 52px)` | 700 | `-0.025em` |
| 推荐页大标题 | `clamp(40px, 5vw, 72px)` | 700 | `-0.025em` |
| 球员名（卡片内） | `40px` | 700 | `-0.02em` |
| 球员名（详情页） | `clamp(28px, 4vw, 48px)` | 700 | `-0.02em` |
| Section 标题 | `18px` | 600 | `-0.01em` |
| Onboarding 问题 | `36px` | 700 | `-0.02em` |

**规则：不要硬编码裸 px 字号，除 clamp 标题外一律用 `FONT.xx`**

---

## 6. 圆角 (Token `R`)

| Token | 值 | 用途 |
|---|---|---|
| `R.sm` | 8px | 小徽章、表格内元素 |
| `R.md` | 12px | 按钮、tab、输入框 |
| `R.lg` | 16px | 卡片（默认） |
| `R.xl` | 24px | 大面板 |

### 实际 Tailwind 映射

| 场景 | className | 对应 R |
|---|---|---|
| 卡片 | `rounded-2xl` | 16px ≈ R.lg |
| 按钮、输入框、tab | `rounded-xl` | 12px ≈ R.md |
| 胶囊按钮 (关注) | `rounded-full` | — |
| 模态弹窗 | `rounded-2xl` | 16px |
| 小徽章 | `rounded-full` 或 `rounded-lg` | — |

**规则：所有卡片统一 `rounded-2xl`，所有按钮/输入框统一 `rounded-xl`**

---

## 7. 间距系统

| Token | 值 | Tailwind 近似 |
|---|---|---|
| `S.xs` | 4px | `gap-1` / `p-1` |
| `S.sm` | 8px | `gap-2` |
| `S.md` | 12px | `gap-3` |
| `S.lg` | 16px | `gap-4` / `p-4` |
| `S.xl` | 20px | `gap-5` / `p-5` |
| `S.xxl` | 28px | `gap-7` / `p-7` |

### 常用间距模式

- **Section 之间**: `mb-14` ~ `mb-16` (56~64px)
- **卡片内 padding**: `p-5` ~ `p-6` (20~24px)
- **标题与内容间距**: `mb-6` (24px)
- **卡片网格 gap**: `gap-4` ~ `gap-6`
- **Header 与内容**: `mb-10` ~ `mb-12`

---

## 8. 页面布局模式

### 8.1 页面根容器

```tsx
<div style={{ fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
  {/* 内容 */}
</div>
```

### 8.2 页面 Header

```tsx
<div className="mb-10">
  <h1 style={{
    color: T.white,
    fontSize: "clamp(32px, 3.5vw, 52px)",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
    marginBottom: "8px"
  }}>
    页面标题
  </h1>
  <p style={{ color: T.label, fontSize: FONT.base }}>
    页面副标题或描述
  </p>
</div>
```

### 8.3 Section（带竖线标题）

```tsx
<section className="mb-16">
  <div className="flex items-center justify-between mb-6">
    <h2 className="flex items-center gap-2.5"
      style={{ color: T.white, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
      <span className="inline-block w-0.5 h-4 rounded-full shrink-0"
        style={{ background: T.white }} />
      Section 名称
    </h2>
  </div>
  {children}
</section>
```

### 8.4 Uppercase 小标签（Section 上方）

```tsx
<p style={{
  color: T.label,
  fontSize: FONT.xs,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "20px"
}}>
  标签文字
</p>
```

---

## 9. 组件模式

### 9.1 卡片

```tsx
<div className="rounded-2xl p-6"
  style={{ background: BG.card, border: B.card }}>
  {/* 卡片内容 */}
</div>
```

### 9.2 主要按钮（白底黑字）

```tsx
<button
  className="px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
  style={{ background: T.white, color: BG.page, fontSize: FONT.md, fontWeight: 600 }}>
  按钮文字
</button>
```

### 9.3 次要按钮（透明+边框）

```tsx
<button
  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.04]"
  style={{ border: B.subtle }}>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    {/* icon paths — stroke 用 rgba(255,255,255,0.5) */}
  </svg>
  <span style={{ color: T.label, fontSize: FONT.base }}>按钮文字</span>
</button>
```

### 9.4 关注按钮

```tsx
<button
  className="px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
  style={{
    background: isFollowed ? BG.overlay : T.white,
    border: isFollowed ? B.visible : "1px solid transparent",
    color: isFollowed ? T.body : BG.page,
    fontSize: FONT.sm,
    fontWeight: 600,
  }}>
  {isFollowed ? "已关注" : "关注"}
</button>
```

### 9.5 徽章 (Badge)

```tsx
<span className="px-2.5 py-1 rounded-full font-semibold"
  style={{
    background: BG.overlay,
    color: T.label,
    fontSize: FONT.xs,
    letterSpacing: "0.04em"
  }}>
  NO. {rank}
</span>
```

### 9.6 Tab 切换

```tsx
<div className="flex gap-1 mb-8 p-1 rounded-xl"
  style={{ background: BG.card, border: B.card, display: "inline-flex" }}>
  {tabs.map((t, i) => (
    <button key={t} onClick={() => setTab(i)}
      className="px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
      style={{
        background: active === i ? BG.overlay : "transparent",
        color: active === i ? T.white : T.dim,
        fontWeight: active === i ? 600 : 400,
        fontSize: FONT.base,
      }}>
      <span className="inline-block w-0.5 h-2.5 rounded-full shrink-0"
        style={{ background: active === i ? T.white : "transparent" }} />
      {t}
    </button>
  ))}
</div>
```

### 9.7 搜索输入框

```tsx
<div className="flex items-center gap-3 px-5 py-3 rounded-xl"
  style={{ background: BG.card, border: B.subtle }}>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    {/* search icon — stroke rgba(255,255,255,0.25) */}
  </svg>
  <input
    className="flex-1 bg-transparent outline-none"
    style={{ color: T.white, fontSize: FONT.base }}
    placeholder="搜索…"
  />
</div>
```

### 9.8 空状态

```tsx
<div className="flex flex-col items-center justify-center py-32">
  <div className="mb-4" style={{ color: BG.overlay, fontSize: "64px", lineHeight: 1 }}>○</div>
  <p style={{ color: T.ghost, fontSize: FONT.lg, textAlign: "center", lineHeight: 1.7 }}>
    还没有任何内容<br />前往某处添加
  </p>
</div>
```

### 9.9 "待开发"占位

```tsx
<div className="py-10 text-center rounded-2xl"
  style={{ background: BG.card, border: B.card }}>
  <p style={{ color: T.ghost, fontSize: FONT.md }}>待开发</p>
</div>
```

### 9.10 模态弹窗

```tsx
{/* 遮罩 */}
<div className="fixed inset-0 z-[60]"
  style={{ background: "rgba(0,0,0,0.65)" }}
  onClick={onClose} />

{/* 弹窗 */}
<div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
  <div className="pointer-events-auto mx-5 p-6 rounded-2xl max-w-[300px] w-full"
    style={{ background: BG.card, border: B.card }}
    onClick={e => e.stopPropagation()}>
    <h3 style={{ color: T.white, fontSize: FONT.md, fontWeight: 600, marginBottom: "6px" }}>
      标题
    </h3>
    <p style={{ color: T.dim, fontSize: FONT.sm, lineHeight: 1.6, marginBottom: "20px" }}>
      描述文字
    </p>
    <div className="flex gap-2.5 justify-end">
      <button className="px-4 py-2 rounded-lg"
        style={{ color: T.body, fontSize: FONT.sm, border: B.subtle }}>
        取消
      </button>
      <button className="px-4 py-2 rounded-lg"
        style={{ background: T.danger, color: T.white, fontSize: FONT.sm, fontWeight: 600 }}>
        确认
      </button>
    </div>
  </div>
</div>
```

---

## 10. 动画规范

统一使用 `motion/react`：

```tsx
import { motion, AnimatePresence } from "motion/react";
```

### 入场动画（页面元素）

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}>
```

### 卡片列表 stagger

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 + i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
```

### Tab 内容切换

```tsx
<motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}>
```

### AnimatePresence 包裹动态列表

```tsx
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <motion.div key={item.id} layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.22 } }}>
```

---

## 11. 响应式断点

| 断点 | 前缀 | 典型用途 |
|---|---|---|
| 640px | `sm:` | — |
| 768px | `md:` | 关注页列数 |
| 1024px | `lg:` | Sidebar 显示、3 列布局 |
| 1280px | `xl:` | 双栏布局 |

### 常用响应式模式

```tsx
// 卡片网格：手机2列 → 桌面3列
className="grid grid-cols-2 lg:grid-cols-3 gap-6"

// 关注页：递增列数
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"

// 页面横向 padding
className="px-8 lg:px-20"
```

---

## 12. 图标规范

- 统一使用内联 `<svg>`，**不引入图标库**
- 图标尺寸：导航/按钮 = `16×16`，小图标 = `12×12`
- 默认描边色 `rgba(255,255,255,0.5)`，用 `stroke="currentColor"` 时继承父元素 color
- AI 相关图标用 `T.accent` (#ffd60a)

---

## 13. 数据展示模式

### 13.1 表格

- 表头背景 `BG.raised`，文字 `T.label` + `FONT.xs` + `letterSpacing: "0.1em"`
- 数据行背景 `BG.card`，行间 `borderTop: "1px solid rgba(255,255,255,0.04)"`
- 数字列右对齐，`fontVariantNumeric: "tabular-nums"`
- 高阶数据列用橙色 `rgba(255,165,0,0.5)` 标识
- 表格底部加脚注行

### 13.2 属性条 (Bar)

```tsx
<div className="h-1 rounded-full" style={{ background: BG.overlay }}>
  <div className="h-1 rounded-full transition-all duration-1000"
    style={{ width: `${value}%`, background: color }} />
</div>
```

---

## 14. 禁止事项

| ❌ 禁止 | ✅ 应该 |
|---|---|
| 硬编码 `#000`, `#fff`, `#0a0a0a` | 使用 `BG.page`, `T.white`, `BG.card` |
| 硬编码 `rgba(255,255,255,0.xx)` | 使用 `T.xxx` / `B.xxx` / `BG.xxx` |
| 用 `opacity` 降透明度 | 直接用对应透明度的 Token |
| 卡片用 `rounded-3xl` | 统一用 `rounded-2xl` |
| 按钮用 `rounded-2xl` | 统一用 `rounded-xl` 或 `rounded-full` |
| 硬编码 `fontSize: "14px"` | 使用 `FONT.base` |
| 硬编码 `fontSize: "20px"` 做标题 | 用 Section 标题规范或 clamp |
| 引入第三方图标库 | 手写 `<svg>` |
| 新字体 | Noto Sans SC + Inter 已足够 |
| 彩色背景卡片（红/蓝/绿底） | 只在边框/小元素上用彩色点缀 |

---

## 15. 新页面 Checklist

开工前逐项确认：

- [ ] 根容器 `fontFamily: "'Noto Sans SC', 'Inter', sans-serif"`
- [ ] 页面 Header 使用 clamp 标题 + `T.label` 副标题
- [ ] 所有卡片 `rounded-2xl` + `BG.card` + `B.card`
- [ ] 所有按钮 `rounded-xl` 或 `rounded-full`
- [ ] 字号通过 `FONT.xx` token，标题除外
- [ ] 颜色全部走 `T / BG / B` token，无硬编码
- [ ] Section 标题带白色竖线
- [ ] 空状态和"待开发"占位按规范
- [ ] 列表有 AnimatePresence + stagger 动画
- [ ] 表格按规范（表头 BG.raised、tabular-nums）
- [ ] 移动端响应式（至少手机 2 列 + 桌面多列）
- [ ] `vite build` 通过
