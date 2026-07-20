interface VisitorCache {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<void>;
}

export function handleVisitorRequest(input: {
  request: Request;
  cache: VisitorCache;
  waitUntil(promise: Promise<unknown>): void;
}): Promise<Response>;

export function onRequest(context: {
  request: Request;
  waitUntil(promise: Promise<unknown>): void;
}): Promise<Response>;
