import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Onboarding } from "./components/Onboarding";
import { DNAResult } from "./components/DNAResult";
import { Recommendations } from "./components/Recommendations";
import { HomePage } from "./components/HomePage";
import { PlayerProfile } from "./components/PlayerProfile";
import { ScoutPage } from "./components/ScoutPage";
import { FollowingPage } from "./components/FollowingPage";
import { Sidebar } from "./components/Sidebar";
import { ArticlePage } from "./components/ArticlePage";
import { TourGuide } from "./components/TourGuide";
import { generateDNA, findTopMatches } from "../utils/dna-engine";
import { useAppStore } from "../store/app-store";

import draftDB from "../data/2026-draft-database.json";
import star13DDB from "../data/star-players-13d.json";

/** Force-clean stale followed names that can't resolve in the 2026 draft DB */
function cleanStaleFollows() {
  const raw = localStorage.getItem("basketball-app-store");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const followed: string[] = data?.state?.followed;
    if (!followed || followed.length === 0) return;
    const valid = followed.filter((name: string) =>
      (draftDB as any[]).some(
        (p: any) => p.name === name || (p as any).nameCn === name
      )
    );
    if (valid.length !== followed.length) {
      console.log(
        `🧹 Cleaned ${followed.length - valid.length} stale follows:`,
        followed.filter((n: string) => !valid.includes(n))
      );
      data.state.followed = valid;
      localStorage.setItem("basketball-app-store", JSON.stringify(data));
    }
  } catch { /* ignore parse errors */ }
}

type Screen =
  | { id: "onboarding" }
  | { id: "dna" }
  | { id: "recommendations" }
  | { id: "home" }
  | { id: "player"; name?: string; from: string }
  | { id: "scout" }
  | { id: "following" }
  | { id: "article"; title: string; source: string; url: string; content: string; time: string; from: string };

const MAIN_SCREENS = ["home", "scout", "following", "player", "article"];

const VALID_RETURN_SCREENS = new Set(["home", "scout", "following"]);

function isKnownPlayer(name?: string): boolean {
  return !!name && (draftDB as any[]).some(
    (player: any) => player.name === name || player.nameCn === name
  );
}

function screenFromHash(): Screen | null {
  const route = window.location.hash.replace(/^#\/?/, "");
  if (!route) return null;

  const [path, query = ""] = route.split("?");
  if (path === "home" || path === "scout" || path === "following") {
    return { id: path };
  }

  if (path === "player") {
    const params = new URLSearchParams(query);
    const name = params.get("name") || undefined;
    const requestedFrom = params.get("from") || "home";
    if (!isKnownPlayer(name)) return { id: "home" };
    return {
      id: "player",
      name,
      from: VALID_RETURN_SCREENS.has(requestedFrom) ? requestedFrom : "home",
    };
  }

  return { id: "home" };
}

function hashForScreen(screen: Screen): string | null {
  if (screen.id === "home" || screen.id === "scout" || screen.id === "following") {
    return `#/${screen.id}`;
  }
  if (screen.id === "player" && isKnownPlayer(screen.name)) {
    const params = new URLSearchParams({
      name: screen.name!,
      from: VALID_RETURN_SCREENS.has(screen.from) ? screen.from : "home",
    });
    return `#/player?${params.toString()}`;
  }
  return null;
}

export default function App() {
  const store = useAppStore();
  // Derive Set for components that expect it
  const followedSet = useMemo(() => new Set(store.followed), [store.followed]);

  // One-time cleanup of stale follows from localStorage (e.g. old "迪伦·哈珀")
  useEffect(() => { cleanStaleFollows(); }, []);

  // Sync read from localStorage — avoids Zustand async hydration race condition
  const [screen, setScreen] = useState<Screen>(() => {
    try {
      const raw = localStorage.getItem("basketball-app-store");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.state?.hasCompletedOnboarding) {
          return screenFromHash() || { id: "home" };
        }
      }
    } catch {}
    return { id: "onboarding" };
  });

  const goToScreen = useCallback((next: Screen, replace = false) => {
    const hash = hashForScreen(next);
    if (hash && window.location.hash !== hash) {
      window.history[replace ? "replaceState" : "pushState"](null, "", hash);
    }
    setScreen(next);
  }, []);

  // Restore app navigation when users use the browser back/forward controls.
  useEffect(() => {
    const handleHistoryNavigation = () => {
      setScreen(screenFromHash() || { id: "home" });
    };
    window.addEventListener("popstate", handleHistoryNavigation);
    return () => window.removeEventListener("popstate", handleHistoryNavigation);
  }, []);

  // Player profile analytics must run once per actual navigation, not per render.
  useEffect(() => {
    if (screen.id !== "player" || !screen.name) return;
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "player_profile_view", {
        player_name: screen.name,
        from: screen.from,
      });
    }
  }, [screen.id, screen.id === "player" ? screen.name : null, screen.id === "player" ? screen.from : null]);

  const handleOnboardingComplete = useCallback((data: {
    selectedPosition: string;
    selectedStarPlayers: string[];
    polishedType?: "polished" | "raw" | null;
  }) => {
    // Build star body reference for body-layer matching
    const selectedStars = data.selectedStarPlayers
      .map((id: string) => (star13DDB as any[]).find((s: any) => s.id === id))
      .filter(Boolean) as any[];
    const starBodyRef = selectedStars.length > 0
      ? {
          height: Math.round(selectedStars.reduce((s: number, p: any) => s + (p.height || 200), 0) / selectedStars.length),
          weight: Math.round(selectedStars.reduce((s: number, p: any) => s + (p.weight || 95), 0) / selectedStars.length),
          wingspan: Math.round(selectedStars.reduce((s: number, p: any) => s + (p.wingspan || 210), 0) / selectedStars.length),
        }
      : undefined;

    const dna = generateDNA({
      selectedPosition: data.selectedPosition,
      selectedStarPlayerIds: data.selectedStarPlayers,
    });

    const matches = findTopMatches(dna.vector, draftDB, data.selectedPosition, 4, starBodyRef, data.polishedType);

    store.setDNA(dna, matches);
    store.setOnboardingComplete();

    // GA: DNA 生成完成
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "dna_generated", {
        position: data.selectedPosition,
      });
    }

    setScreen({ id: "dna" });
  }, [store]);

  const handleOnboardingSkip = useCallback(() => {
    store.setOnboardingComplete();
    goToScreen({ id: "home" }, true);
  }, [store, goToScreen]);

  const handleReset = useCallback(() => {
    store.fullReset();
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setScreen({ id: "onboarding" });
  }, [store]);

  // Auto-start guided tour when landing on Home page after DNA generation
  useEffect(() => {
    if (
      screen.id === "home" &&
      store.dnaData &&
      store.tourStep === "idle"
    ) {
      store.advanceTour(); // idle → step1-hamburger
    }
  }, [screen.id, store.dnaData, store.tourStep]);

  const navigate = (page: string, data?: Record<string, string>) => {
    const currentMain =
      "from" in screen ? (screen as { from: string }).from :
      MAIN_SCREENS.includes(screen.id) ? screen.id : "home";

    if (page === "player") {
      const next = { id: "player", name: data?.name, from: currentMain } as Screen;
      goToScreen(isKnownPlayer(data?.name) ? next : { id: "home" });
    } else if (page === "article") {
      setScreen({ id: "article", ...data } as unknown as Screen);
    } else {
      goToScreen({ id: page as Screen["id"] } as Screen);
    }
  };

  const isMain = MAIN_SCREENS.includes(screen.id);

  const activeNav =
    (screen.id === "player" || screen.id === "article")
      ? (screen as { from: string }).from
      : screen.id as string;

  const mainContent = () => {
    if (screen.id === "home") {
      return <HomePage onNavigate={navigate} followed={followedSet} />;
    }
    if (screen.id === "player") {
      const ps = screen as { id: "player"; name?: string; from: string };
      return (
        <PlayerProfile
          playerName={ps.name}
          followed={followedSet}
          onToggleFollow={store.toggleFollow}
          onBack={() => goToScreen({ id: ps.from as Screen["id"] } as Screen)}
        />
      );
    }
    if (screen.id === "scout") {
      return (
        <ScoutPage
          onSelectPlayer={(name) => goToScreen({ id: "player", name, from: "scout" })}
          followed={followedSet}
          onToggleFollow={store.toggleFollow}
        />
      );
    }
    if (screen.id === "following") {
      return (
        <FollowingPage
          followed={followedSet}
          onToggleFollow={store.toggleFollow}
          onSelectPlayer={(name) =>
            goToScreen({ id: "player", name, from: "following" })
          }
        />
      );
    }
    if (screen.id === "article") {
      const s = screen as { id: "article"; title: string; source: string; url: string; content: string; time: string; from: string };
      return (
        <ArticlePage
          title={s.title}
          source={s.source}
          url={s.url}
          content={s.content}
          time={s.time}
          onBack={() => goToScreen({ id: "home" })}
        />
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#000", fontFamily: "'Noto Sans SC', 'Inter', sans-serif" }}>
      <AnimatePresence mode="wait">
        {screen.id === "onboarding" && (
          <motion.div key="onboarding" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}
            style={{ position: "fixed", inset: 0, zIndex: 50 }}>
            <Onboarding
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
            />
          </motion.div>
        )}
        {screen.id === "dna" && (
          <motion.div key="dna" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
            <DNAResult
              dnaData={store.dnaData}
              onContinue={() => setScreen({ id: "recommendations" })}
            />
          </motion.div>
        )}
        {screen.id === "recommendations" && (
          <motion.div key="recommendations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto" }}>
            <Recommendations
              recommendations={store.recommendations}
              dnaData={store.dnaData}
              followed={followedSet}
              onToggleFollow={store.toggleFollow}
              onContinue={() => goToScreen({ id: "home" }, true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isMain && (
        <div className="flex" style={{ minHeight: "100dvh" }}>
          <Sidebar active={activeNav} onNavigate={navigate} onReset={handleReset} />
          <main className="flex-1 overflow-y-auto" style={{ minHeight: "100dvh" }}>
            <div className="px-5 lg:pl-[232px] lg:pr-16 pt-16 lg:pt-14 pb-14 max-w-6xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen.id + ((screen as { name?: string }).name || "")}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {mainContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}

      {/* ── Guided tour overlay (fixed, renders above everything) ── */}
      {isMain && store.tourStep !== "done" && store.tourStep !== "idle" && (
        <TourGuide
          step={store.tourStep as "step1-hamburger" | "step2-scout" | "step3-ai"}
          onAdvance={store.advanceTour}
          onDismiss={store.dismissTour}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
