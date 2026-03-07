import { randomUUID } from "crypto";

export type LogLevel = "info" | "warn" | "error";

export type RequestContext = {
  requestId: string;
  app: string;
  route?: string;
  userId?: string;
};

type LogInput = {
  level?: LogLevel;
  message: string;
  context: RequestContext;
  metadata?: Record<string, unknown>;
};

function sanitize(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  const clone = { ...metadata };
  const secretKeys = ["password", "token", "secret", "apiKey", "authorization"];

  for (const key of Object.keys(clone)) {
    if (secretKeys.some((item) => key.toLowerCase().includes(item.toLowerCase()))) {
      clone[key] = "[REDACTED]";
    }
  }

  return clone;
}

export function log(input: LogInput): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level: input.level ?? "info",
    message: input.message,
    context: input.context,
    metadata: sanitize(input.metadata),
  };

  const serialized = JSON.stringify(payload);
  if (payload.level === "error") {
    console.error(serialized);
    return;
  }

  if (payload.level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export function createRequestContext(params: Omit<RequestContext, "requestId"> & { requestId?: string }): RequestContext {
  return {
    requestId: params.requestId ?? randomUUID(),
    app: params.app,
    route: params.route,
    userId: params.userId,
  };
}
