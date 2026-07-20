import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../store/app-store";
import { createScoutAIResponseError, ScoutAIError } from "./scout-ai-error";
export { ScoutAIError } from "./scout-ai-error";

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

      try {
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

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw createScoutAIResponseError(response.status, errData.error);
        }

        return response.json();
      } catch (error) {
        if (error instanceof ScoutAIError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new ScoutAIError("timeout", "AI 分析用时过长，请重新尝试。", true);
        }
        throw new ScoutAIError("network", "无法连接 AI 服务，请检查网络后重试。", true);
      } finally {
        clearTimeout(timeout);
      }
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      error instanceof ScoutAIError ? error.retryable && failureCount < 1 : failureCount < 1,
  });
}
