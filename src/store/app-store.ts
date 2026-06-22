import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DNAResult, ProspectMatch } from "../utils/dna-engine";
import draftDB from "../data/2026-draft-database.json";

/** Check if a follow-name can be resolved in the 2026 draft DB */
function isValidFollowName(name: string): boolean {
  return (draftDB as any[]).some(
    (p: any) => p.name === name || (p as any).nameCn === name
  );
}

interface AppState {
  // ── Followed players ──
  followed: string[];
  toggleFollow: (name: string) => void;
  isFollowed: (name: string) => boolean;

  // ── DNA & Recommendations (persisted across refreshes) ──
  dnaData: DNAResult | null;
  dnaVector: number[] | null;
  recommendations: ProspectMatch[];
  setDNA: (data: DNAResult, recs: ProspectMatch[]) => void;
  clearDNA: () => void;
  fullReset: () => void;

  // ── Onboarding state (so returning users skip it) ──
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => void;

  // ── First-use guided tour ──
  tourStep: "idle" | "step1-hamburger" | "step2-scout" | "step3-ai" | "done";
  advanceTour: () => void;
  dismissTour: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Followed ──
      followed: [],
      toggleFollow: (name: string) => {
        const current = get().followed;
        if (current.includes(name)) {
          // Unfollow — always allow
          set({ followed: current.filter(n => n !== name) });
        } else {
          // Follow — only add if the name resolves to a DB player
          if (!isValidFollowName(name)) return;
          set({ followed: [...current, name] });
        }
      },
      isFollowed: (name: string) => get().followed.includes(name),

      // ── DNA ──
      dnaData: null,
      dnaVector: null,
      recommendations: [],
      setDNA: (data, recs) =>
        set({ dnaData: data, dnaVector: data.vector, recommendations: recs }),
      clearDNA: () =>
        set({ dnaData: null, dnaVector: null, recommendations: [] }),

      // ── Full reset — start from scratch ──
      fullReset: () => {
        localStorage.removeItem("basketball-app-store");
        set({
          followed: [],
          dnaData: null,
          dnaVector: null,
          recommendations: [],
          hasCompletedOnboarding: false,
          tourStep: "idle",
        });
      },

      // ── Onboarding ──
      hasCompletedOnboarding: false,
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),

      // ── Tour ──
      tourStep: "idle",
      advanceTour: () => {
        const step = get().tourStep;
        const next: Record<string, AppState["tourStep"]> = {
          idle: "step1-hamburger",
          "step1-hamburger": "step2-scout",
          "step2-scout": "step3-ai",
          "step3-ai": "done",
          done: "done",
        };
        set({ tourStep: next[step] || "done" });
      },
      dismissTour: () => set({ tourStep: "done" }),
    }),
    {
      name: "basketball-app-store",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // V2 migration: clean up old hardcoded Chinese names (e.g. "迪伦·哈珀")
          // that no longer exist in the 2026 draft database
          const oldFollowed: string[] = persistedState.followed || [];
          const cleaned = oldFollowed.filter(isValidFollowName);
          return { ...persistedState, followed: cleaned };
        }
        return persistedState as any;
      },
      partialize: (state) => ({
        followed: state.followed,
        dnaData: state.dnaData,
        dnaVector: state.dnaVector,
        recommendations: state.recommendations,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        tourStep: state.tourStep,
      }),
    }
  )
);
