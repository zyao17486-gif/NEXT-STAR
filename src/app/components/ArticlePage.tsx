import { T, BG, B, FONT } from "../../styles/design-tokens";

interface ArticlePageProps {
  title: string;
  source: string;
  url: string;
  content: string;
  time: string;
  onBack: () => void;
}

export function ArticlePage({ title, source, url, content, time, onBack }: ArticlePageProps) {
  return (
    <div style={{ fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 mb-8 transition-opacity hover:opacity-70"
        style={{ color: T.label, fontSize: FONT.md }}>
        ← 返回主页
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span style={{ color: T.label, fontSize: FONT.xs, letterSpacing: "0.06em" }}>{source}</span>
          <span style={{ color: T.ghost, fontSize: FONT.xs }}>·</span>
          <span style={{ color: T.hint, fontSize: FONT.xs }}>{time}</span>
        </div>
        <h1 style={{ color: T.white, fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
          {title}
        </h1>
      </div>

      {/* Body */}
      <div className="max-w-2xl mb-12">
        {content.split(/\n\n+/).map((para, i) => (
          <p key={i} style={{ color: T.hero, fontSize: FONT.xl, lineHeight: 1.9, marginBottom: "24px" }}>
            {para.trim()}
          </p>
        ))}
        <p style={{ color: T.label, fontSize: FONT.base, lineHeight: 1.8, marginTop: "32px" }}>
          本文翻译自 {source} 报道，内容经整理编辑。原文请查阅下方链接。
        </p>
      </div>

      {/* Original link */}
      <div className="pt-6" style={{ borderTop: B.divider }}>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-60"
          style={{ color: T.dim, fontSize: FONT.md, textDecoration: "none" }}>
          阅读原文
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H4.5M10 2v5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
