import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DNAResult, ProspectMatch } from "../utils/dna-engine";

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

  // ── Onboarding state (so returning users skip it) ──
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Followed ──
      followed: [],
      toggleFollow: (name: string) => {
        const current = get().followed;
        const next = current.includes(name)
          ? current.filter(n => n !== name)
          : [...current, name];
        set({ followed: next });
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

      // ── Onboarding ──
      hasCompletedOnboarding: false,
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: "basketball-app-store",
      partialize: (state) => ({
        followed: state.followed,
        dnaData: state.dnaData,
        dnaVector: state.dnaVector,
        recommendations: state.recommendations,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
