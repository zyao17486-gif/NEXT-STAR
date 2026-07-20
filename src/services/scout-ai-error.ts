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

export function createScoutAIResponseError(status: number, serverMessage?: string): ScoutAIError {
  if (status === 429) return new ScoutAIError("rate-limit", "请求过于频繁，请稍等片刻后重试。", true, status);
  if (status === 401 || status === 403) return new ScoutAIError("configuration", "AI 服务配置异常，请稍后再试。", false, status);
  if (status === 504) return new ScoutAIError("timeout", "AI 分析用时过长，请重新尝试。", true, status);
  if (status >= 500) return new ScoutAIError("server", "AI 服务暂时不可用，请稍后重试。", true, status);
  return new ScoutAIError("request", serverMessage || `请求失败 (${status})`, false, status);
}
