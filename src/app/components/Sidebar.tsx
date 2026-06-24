import { useState } from "react";
import { T, BG, B, FONT } from "../../styles/design-tokens";

interface SidebarProps {
  active: string;
  onNavigate: (page: string) => void;
  onReset: () => void;
}

const NAV = [
  { id: "home",      label: "主页" },
  { id: "scout",     label: "球探" },
  { id: "following", label: "关注" },
];

export function Sidebar({ active, onNavigate, onReset }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
        style={{ background: BG.page, borderBottom: B.card }}>
        <span style={{ color: T.white, fontSize: FONT.md, fontWeight: 700, letterSpacing: "0.15em" }}>NEXT STAR</span>
        <button data-tour="hamburger" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: T.white, fontSize: "20px", lineHeight: 1 }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}
          style={{ background: "rgba(0,0,0,0.6)" }} />
      )}

      {/* ── Sidebar (desktop fixed + mobile slide-in) ── */}
      <div className={[
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col px-6 py-8 w-52 transition-transform duration-300",
        "max-lg:translate-x-[-100%]",
        mobileOpen ? "max-lg:!translate-x-0" : "",
      ].join(" ")}
        style={{ background: BG.page, borderRight: B.card }}>
        {/* Logo — hidden on mobile (shown in top bar) */}
        <div className="hidden lg:flex items-center gap-2.5 mb-14">
          <div className="w-5 h-5 rounded-full bg-white" />
          <span style={{ color: T.white, fontSize: FONT.md, fontWeight: 700, letterSpacing: "0.15em" }}>NEXT STAR</span>
        </div>

        {/* Mobile spacer for top bar */}
        <div className="lg:hidden h-10" />

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => handleNav(n.id)}
              data-tour={n.id === "scout" ? "scout-nav" : undefined}
              className="text-left px-3 py-2.5 rounded-xl transition-all duration-200"
              style={{
                color: active === n.id ? T.white : T.dim,
                background: active === n.id ? BG.overlay : "transparent",
                fontSize: FONT.lg,
                fontWeight: active === n.id ? 600 : 400,
              }}>
              {n.label}
            </button>
          ))}
        </nav>

        {/* DNA 测评入口 */}
        <button onClick={() => handleNav("onboarding")}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 mb-3 hover:bg-white/[0.04]"
          style={{ border: B.subtle }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
            <path d="M8 5v3l2 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ color: T.label, fontSize: FONT.base }}>DNA 测评</span>
        </button>

        {/* Divider + Reset */}
        <div className="h-px mx-3 my-3" style={{ background: "rgba(255,255,255,0.04)" }} />

        <button onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.04] mb-3"
          style={{ border: B.subtle }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8a6 6 0 1010-5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3H9.5v2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: T.label, fontSize: FONT.base }}>重置全部</span>
        </button>

      </div>

      {/* ── Reset confirmation modal ── */}
      {showResetConfirm && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
            <div
              className="pointer-events-auto mx-5 p-6 rounded-2xl max-w-[300px] w-full"
              style={{ background: BG.card, border: B.card }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: T.white, fontSize: FONT.md, fontWeight: 600, marginBottom: "6px" }}>
                确认重置全部数据？
              </h3>
              <p style={{ color: T.dim, fontSize: FONT.sm, lineHeight: 1.6, marginBottom: "20px" }}>
                这将清除你的 DNA 测评结果、球员关注列表和偏好设置。此操作无法撤销。
              </p>
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/[0.04]"
                  style={{ color: T.body, fontSize: FONT.sm, border: B.subtle }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    onReset();
                  }}
                  className="px-4 py-2 rounded-lg transition-all duration-150"
                  style={{ background: T.danger, color: T.white, fontSize: FONT.sm, fontWeight: 600, borderRadius: "8px" }}
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
