import { useState, useCallback, useMemo } from "react";
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
import { generateDNA, findTopMatches } from "../utils/dna-engine";
import { useAppStore } from "../store/app-store";

import draftDB from "../data/2026-draft-database.json";

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

export default function App() {
  const store = useAppStore();
  // Derive Set for components that expect it
  const followedSet = useMemo(() => new Set(store.followed), [store.followed]);

  const [screen, setScreen] = useState<Screen>(
    store.hasCompletedOnboarding ? { id: "home" } : { id: "onboarding" }
  );

  const handleOnboardingComplete = useCallback((data: {
    selectedPosition: string;
    selectedStarPlayers: string[];
    polishedType: "polished" | "upside";
  }) => {
    const dna = generateDNA({
      selectedPosition: data.selectedPosition,
      selectedStarPlayerIds: data.selectedStarPlayers,
      polishedType: data.polishedType,
    });

    const matches = findTopMatches(dna.vector, draftDB, data.selectedPosition, 4);

    store.setDNA(dna, matches);
    store.setOnboardingComplete();

    setScreen({ id: "dna" });
  }, [store]);

  const handleOnboardingSkip = useCallback(() => {
    setScreen({ id: "home" });
  }, []);

  const navigate = (page: string, data?: Record<string, string>) => {
    const currentMain =
      "from" in screen ? (screen as { from: string }).from :
      MAIN_SCREENS.includes(screen.id) ? screen.id : "home";

    if (page === "player") {
      setScreen({ id: "player", name: data?.name, from: currentMain });
    } else if (page === "article") {
      setScreen({ id: "article", ...data } as unknown as Screen);
    } else {
      setScreen({ id: page as Screen["id"] } as Screen);
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
          onBack={() => setScreen({ id: ps.from as Screen["id"] } as Screen)}
        />
      );
    }
    if (screen.id === "scout") {
      return (
        <ScoutPage
          onSelectPlayer={(name) => setScreen({ id: "player", name, from: "scout" })}
        />
      );
    }
    if (screen.id === "following") {
      return (
        <FollowingPage
          followed={followedSet}
          onToggleFollow={store.toggleFollow}
          onSelectPlayer={(name) =>
            setScreen({ id: "player", name, from: "following" })
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
          onBack={() => setScreen({ id: "home" })}
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
              onContinue={() => setScreen({ id: "home" })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isMain && (
        <div className="flex" style={{ minHeight: "100dvh" }}>
          <Sidebar active={activeNav} onNavigate={navigate} />
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
    </div>
  );
}
