import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../store/app-store";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AIRecommendation {
  name: string;
  en: string;
  matchScore: number;
  reason: string;
  strengths: string[];
  risks: string[];
}

interface AIResult {
  recommendations: AIRecommendation[];
  summary: string;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * TanStack Query hook for AI scout search.
 * Caches results by query string, auto-retries on failure, stale after 5 min.
 * Includes user DNA vector for personalized results.
 */
export function useScoutAI(query: string, enabled: boolean) {
  const dnaVector = useAppStore((s) => s.dnaVector);

  return useQuery<AIResult>({
    queryKey: ["scout-ai", query, dnaVector],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const apiBase = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiBase}/api/scout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          dnaVector: dnaVector || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `请求失败 (${response.status})`);
      }

      return response.json();
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
