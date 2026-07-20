import { randomUUID } from "node:crypto";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,100}$/;

export function createRequestId(candidate) {
  return typeof candidate === "string" && REQUEST_ID_PATTERN.test(candidate)
    ? candidate
    : randomUUID();
}

export function logEvent(level, event, fields = {}) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  const writer = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  writer(payload);
}

export function requestLogger(req, res, next) {
  const requestId = createRequestId(req.get("X-Request-ID"));
  const startedAt = process.hrtime.bigint();
  req.requestId = requestId;
  res.set("X-Request-ID", requestId);

  res.once("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logEvent(res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info", "http_request", {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
    });
  });
  next();
}
