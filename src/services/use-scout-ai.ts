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

export type ScoutAIErrorCode = "timeout" | "network" | "rate-limit" | "configuration" | "server" | "request";

export class ScoutAIError extends Error {
  code: ScoutAIErrorCode;
  retryable: boolean;
  status?: number;

  constructor(code: ScoutAIErrorCode, message: string, retryable: boolean, status?: number) {
    super(message);
    this.name = "ScoutAIError";
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

function responseError(status: number, serverMessage?: string): ScoutAIError {
  if (status === 429) return new ScoutAIError("rate-limit", "请求过于频繁，请稍等片刻后重试。", true, status);
  if (status === 401 || status === 403) return new ScoutAIError("configuration", "AI 服务配置异常，请稍后再试。", false, status);
  if (status === 504) return new ScoutAIError("timeout", "AI 分析用时过长，请重新尝试。", true, status);
  if (status >= 500) return new ScoutAIError("server", "AI 服务暂时不可用，请稍后重试。", true, status);
  return new ScoutAIError("request", serverMessage || `请求失败 (${status})`, false, status);
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
          throw responseError(response.status, errData.error);
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
