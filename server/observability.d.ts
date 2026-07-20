import type { NextFunction, Request, Response } from "express";

export function createRequestId(candidate: unknown): string;
export function logEvent(level: "info" | "warn" | "error", event: string, fields?: Record<string, unknown>): void;
export function requestLogger(req: Request, res: Response, next: NextFunction): void;
