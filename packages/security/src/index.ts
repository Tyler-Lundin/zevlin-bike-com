import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "crypto";
import { connect as connectNet } from "net";
import { connect as connectTls } from "tls";
import { getEnv } from "@zevlin/config";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const RATE_LIMIT_CACHE_MAX_KEYS = 10_000;
const REDIS_TIMEOUT_MS = 2_000;
const RATE_LIMIT_LUA_SCRIPT = `
local key = KEYS[1]
local window_ms = tonumber(ARGV[1])
local max_requests = tonumber(ARGV[2])
local current = redis.call("INCR", key)
if current == 1 then
  redis.call("PEXPIRE", key, window_ms)
end
local ttl_ms = redis.call("PTTL", key)
if ttl_ms < 0 then
  ttl_ms = window_ms
end
return {current, ttl_ms, max_requests}
`;

type SensitiveFieldType =
  | "customer_phone"
  | "billing_address"
  | "shipping_address"
  | "b2b_contact"
  | "generic";

export type CipherPayload = {
  version: "v1";
  fieldType: SensitiveFieldType;
  keyId: string;
  algorithm: typeof ALGORITHM;
  iv: string;
  tag: string;
  ciphertext: string;
  createdAt: string;
};

export type AuditEvent = {
  id?: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
  requestId?: string;
};

export type KeyProvider = {
  keyId: string;
  getKey: () => Buffer;
};

export type AuditSink = {
  write: (event: Required<Pick<AuditEvent, "id" | "occurredAt">> & AuditEvent) => Promise<void>;
};

type HeaderSource = {
  get(name: string): string | null;
};

export type RateLimitInput = {
  namespace: string;
  identifier: string;
  max: number;
  windowMs: number;
  nowMs?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
  backend: "redis" | "memory";
};

type FixedWindowState = {
  count: number;
  resetAt: number;
};

type RedisConfig = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  database: number;
  tls: boolean;
};

type RespValue = string | number | null | RespValue[] | Error;

type ParsedResp = {
  value: RespValue;
  nextOffset: number;
};

export type ApiRateLimitPolicy = {
  namespace: string;
  max: number;
  windowMs: number;
  identifier?: string;
  errorMessage?: string;
};

export type ApiRateLimitContext = {
  rateLimit: RateLimitResult;
  rateLimitHeaders: Record<string, string>;
};

class EnvKeyProvider implements KeyProvider {
  public readonly keyId: string;

  constructor() {
    // Avoid validating the full runtime env during module evaluation.
    this.keyId = process.env.KMS_KEY_ID?.trim() || "local-kms-emulation";
  }

  getKey(): Buffer {
    const env = getEnv();
    const key = env.FIELD_ENCRYPTION_KEY_B64;
    if (!key) {
      throw new Error("FIELD_ENCRYPTION_KEY_B64 is required for field-level encryption");
    }

    const buffer = Buffer.from(key, "base64");
    if (buffer.length !== KEY_BYTES) {
      throw new Error("FIELD_ENCRYPTION_KEY_B64 must decode to exactly 32 bytes");
    }

    return buffer;
  }
}

class ConsoleAuditSink implements AuditSink {
  async write(event: Required<Pick<AuditEvent, "id" | "occurredAt">> & AuditEvent): Promise<void> {
    console.info(JSON.stringify({ type: "audit_event", ...event }));
  }
}

const defaultKeyProvider = new EnvKeyProvider();
let cachedDefaultAuditSink: AuditSink | null = null;
const fixedWindowStore = new Map<string, FixedWindowState>();

function getRateLimitSalt(): string {
  try {
    return getEnv().FIELD_HASH_SALT ?? "dev-rate-limit-salt";
  } catch {
    return "dev-rate-limit-salt";
  }
}

function normalizeRateLimitIdentifier(input: string): string {
  return input.trim().toLowerCase();
}

function toRateLimitCacheKey(namespace: string, identifier: string): string {
  const salt = getRateLimitSalt();
  return createHash("sha256")
    .update(`ratelimit:${namespace}:${salt}:${normalizeRateLimitIdentifier(identifier)}`)
    .digest("hex");
}

function cleanupRateLimitStore(nowMs: number): void {
  for (const [key, state] of fixedWindowStore) {
    if (state.resetAt <= nowMs) {
      fixedWindowStore.delete(key);
    }
  }

  while (fixedWindowStore.size > RATE_LIMIT_CACHE_MAX_KEYS) {
    const oldestKey = fixedWindowStore.keys().next().value;
    if (!oldestKey) {
      break;
    }
    fixedWindowStore.delete(oldestKey);
  }
}

function parseRedisConfig(redisUrl: string): RedisConfig {
  const parsed = new URL(redisUrl);
  const tls = parsed.protocol === "rediss:";
  const host = parsed.hostname;
  const port = parsed.port ? Number(parsed.port) : tls ? 6380 : 6379;

  if (!host) {
    throw new Error("REDIS_URL must include a host");
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("REDIS_URL must include a valid port");
  }

  const databaseRaw = parsed.pathname.replace("/", "").trim();
  const database = databaseRaw.length === 0 ? 0 : Number(databaseRaw);
  if (!Number.isInteger(database) || database < 0) {
    throw new Error("REDIS_URL path must be a non-negative integer database index");
  }

  const username = parsed.username ? decodeURIComponent(parsed.username) : undefined;
  const password = parsed.password ? decodeURIComponent(parsed.password) : undefined;

  return {
    host,
    port,
    username,
    password,
    database,
    tls,
  };
}

function encodeRedisCommand(parts: string[]): Buffer {
  const chunks: string[] = [`*${parts.length}\r\n`];
  for (const part of parts) {
    const value = String(part);
    chunks.push(`$${Buffer.byteLength(value)}\r\n${value}\r\n`);
  }

  return Buffer.from(chunks.join(""), "utf8");
}

function parseRespValue(buffer: Buffer, offset = 0): ParsedResp | null {
  if (offset >= buffer.length) {
    return null;
  }

  const type = String.fromCharCode(buffer[offset] ?? 0);
  const lineEnd = buffer.indexOf("\r\n", offset);
  if (lineEnd < 0) {
    return null;
  }

  const line = buffer.toString("utf8", offset + 1, lineEnd);
  const nextLineOffset = lineEnd + 2;

  if (type === "+") {
    return { value: line, nextOffset: nextLineOffset };
  }

  if (type === "-") {
    return { value: new Error(line), nextOffset: nextLineOffset };
  }

  if (type === ":") {
    return { value: Number.parseInt(line, 10), nextOffset: nextLineOffset };
  }

  if (type === "$") {
    const length = Number.parseInt(line, 10);
    if (length === -1) {
      return { value: null, nextOffset: nextLineOffset };
    }

    if (!Number.isInteger(length) || length < 0) {
      throw new Error(`Invalid RESP bulk length: ${line}`);
    }

    const payloadEnd = nextLineOffset + length;
    if (buffer.length < payloadEnd + 2) {
      return null;
    }

    const value = buffer.toString("utf8", nextLineOffset, payloadEnd);
    return { value, nextOffset: payloadEnd + 2 };
  }

  if (type === "*") {
    const count = Number.parseInt(line, 10);
    if (count === -1) {
      return { value: null, nextOffset: nextLineOffset };
    }

    if (!Number.isInteger(count) || count < 0) {
      throw new Error(`Invalid RESP array count: ${line}`);
    }

    const values: RespValue[] = [];
    let cursor = nextLineOffset;
    for (let index = 0; index < count; index += 1) {
      const parsedItem = parseRespValue(buffer, cursor);
      if (!parsedItem) {
        return null;
      }

      values.push(parsedItem.value);
      cursor = parsedItem.nextOffset;
    }

    return { value: values, nextOffset: cursor };
  }

  throw new Error(`Unsupported RESP token: ${type}`);
}

async function runRedisCommands(config: RedisConfig, commands: string[][]): Promise<RespValue[]> {
  if (commands.length === 0) {
    return [];
  }

  return new Promise((resolve, reject) => {
    const socket = config.tls
      ? connectTls({
          host: config.host,
          port: config.port,
          servername: config.host,
        })
      : connectNet({
          host: config.host,
          port: config.port,
        });

    socket.setTimeout(REDIS_TIMEOUT_MS);
    socket.setNoDelay(true);

    let buffer = Buffer.alloc(0);
    const responses: RespValue[] = [];
    const expectedResponses = commands.length;

    const cleanup = () => {
      socket.removeAllListeners("connect");
      socket.removeAllListeners("data");
      socket.removeAllListeners("error");
      socket.removeAllListeners("timeout");
      socket.removeAllListeners("close");
    };

    const abortWithError = (error: Error) => {
      cleanup();
      socket.destroy();
      reject(error);
    };

    socket.on("connect", () => {
      for (const command of commands) {
        socket.write(encodeRedisCommand(command));
      }
    });

    socket.on("data", (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (responses.length < expectedResponses) {
        const parsed = parseRespValue(buffer);
        if (!parsed) {
          break;
        }

        buffer = buffer.subarray(parsed.nextOffset);
        responses.push(parsed.value);
      }

      if (responses.length === expectedResponses) {
        cleanup();
        socket.end();

        const redisError = responses.find((item) => item instanceof Error);
        if (redisError instanceof Error) {
          reject(redisError);
          return;
        }

        resolve(responses);
      }
    });

    socket.on("timeout", () => {
      abortWithError(new Error("Redis command timed out"));
    });

    socket.on("error", (error) => {
      abortWithError(error);
    });

    socket.on("close", () => {
      if (responses.length < expectedResponses) {
        reject(new Error("Redis connection closed before command completion"));
      }
    });
  });
}

function consumeInMemoryRateLimit(input: RateLimitInput, nowMs: number): RateLimitResult {
  cleanupRateLimitStore(nowMs);

  const cacheKey = toRateLimitCacheKey(input.namespace, input.identifier);
  const current = fixedWindowStore.get(cacheKey);

  if (!current || current.resetAt <= nowMs) {
    const resetAt = nowMs + input.windowMs;
    fixedWindowStore.set(cacheKey, { count: 1, resetAt });
    return {
      allowed: true,
      limit: input.max,
      remaining: Math.max(input.max - 1, 0),
      resetAt,
      retryAfterSeconds: Math.ceil((resetAt - nowMs) / 1000),
      backend: "memory",
    };
  }

  current.count += 1;
  const allowed = current.count <= input.max;
  return {
    allowed,
    limit: input.max,
    remaining: Math.max(input.max - current.count, 0),
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(Math.ceil((current.resetAt - nowMs) / 1000), 1),
    backend: "memory",
  };
}

async function consumeRedisRateLimit(input: RateLimitInput, nowMs: number): Promise<RateLimitResult> {
  const env = getEnv();
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is required for Redis-backed rate limiting");
  }

  const config = parseRedisConfig(env.REDIS_URL);
  const cacheKey = toRateLimitCacheKey(input.namespace, input.identifier);
  const commands: string[][] = [];

  if (config.password) {
    const authCommand = config.username
      ? ["AUTH", config.username, config.password]
      : ["AUTH", config.password];
    commands.push(authCommand);
  }

  if (config.database !== 0) {
    commands.push(["SELECT", String(config.database)]);
  }

  commands.push([
    "EVAL",
    RATE_LIMIT_LUA_SCRIPT,
    "1",
    cacheKey,
    String(input.windowMs),
    String(input.max),
  ]);

  const responses = await runRedisCommands(config, commands);
  const evalResponse = responses[responses.length - 1];
  if (!Array.isArray(evalResponse) || evalResponse.length < 2) {
    throw new Error("Unexpected Redis EVAL response for rate limit");
  }

  const requestCount = Number(evalResponse[0]);
  const ttlMs = Number(evalResponse[1]);
  if (!Number.isFinite(requestCount) || !Number.isFinite(ttlMs)) {
    throw new Error("Invalid Redis rate-limit response values");
  }

  const boundedTtlMs = Math.max(Math.floor(ttlMs), 1);
  const resetAt = nowMs + boundedTtlMs;
  const allowed = requestCount <= input.max;

  return {
    allowed,
    limit: input.max,
    remaining: Math.max(input.max - requestCount, 0),
    resetAt,
    retryAfterSeconds: Math.max(Math.ceil(boundedTtlMs / 1000), 1),
    backend: "redis",
  };
}

async function resolveDefaultAuditSink(): Promise<AuditSink> {
  if (cachedDefaultAuditSink) {
    return cachedDefaultAuditSink;
  }

  try {
    const runtime = await import("@zevlin/db");
    cachedDefaultAuditSink = {
      async write(event) {
        await runtime.insertAuditEvent({
          actorId: event.actorId,
          actorRole: event.actorRole,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          requestId: event.requestId,
          metadata: {
            ...(event.metadata ?? {}),
            auditEventId: event.id,
          },
          occurredAt: new Date(event.occurredAt),
        });
      },
    };
    return cachedDefaultAuditSink;
  } catch {
    cachedDefaultAuditSink = new ConsoleAuditSink();
    return cachedDefaultAuditSink;
  }
}

export function encryptField(
  value: string,
  fieldType: SensitiveFieldType,
  keyProvider: KeyProvider = defaultKeyProvider,
): CipherPayload {
  const key = keyProvider.getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    version: "v1",
    fieldType,
    keyId: keyProvider.keyId,
    algorithm: ALGORITHM,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    createdAt: new Date().toISOString(),
  };
}

export function decryptField(
  payload: CipherPayload,
  expectedFieldType: SensitiveFieldType,
  keyProvider: KeyProvider = defaultKeyProvider,
): string {
  if (payload.fieldType !== expectedFieldType) {
    throw new Error(
      `Field type mismatch. Expected ${expectedFieldType}, received ${payload.fieldType}`,
    );
  }

  const key = keyProvider.getKey();
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export function hashLookup(value: string, fieldType: SensitiveFieldType): string {
  const env = getEnv();
  const salt = env.FIELD_HASH_SALT;
  if (!salt) {
    throw new Error("FIELD_HASH_SALT is required for deterministic lookup hashing");
  }

  return createHash("sha256").update(`${fieldType}:${salt}:${value}`).digest("hex");
}

export function getClientIpFromHeaders(headers: HeaderSource): string {
  const directHeaders = [
    "cf-connecting-ip",
    "x-real-ip",
    "x-client-ip",
    "x-forwarded-for",
    "fastly-client-ip",
  ];

  for (const headerName of directHeaders) {
    const value = headers.get(headerName);
    if (!value) {
      continue;
    }

    const candidate = value.split(",")[0]?.trim();
    if (candidate) {
      return candidate;
    }
  }

  return "unknown";
}

export async function consumeRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  if (!Number.isInteger(input.max) || input.max <= 0) {
    throw new Error("Rate limiter requires a positive integer max");
  }

  if (!Number.isInteger(input.windowMs) || input.windowMs <= 0) {
    throw new Error("Rate limiter requires a positive integer windowMs");
  }

  const nowMs = input.nowMs ?? Date.now();
  const env = getEnv();

  if (env.REDIS_URL) {
    try {
      return await consumeRedisRateLimit(input, nowMs);
    } catch (error) {
      if (env.APP_ENV !== "dev") {
        throw error instanceof Error
          ? error
          : new Error("Redis-backed rate limiting failed in non-dev environment");
      }
      return consumeInMemoryRateLimit(input, nowMs);
    }
  }

  if (env.APP_ENV !== "dev") {
    throw new Error("REDIS_URL is required for distributed rate limiting outside dev");
  }

  return consumeInMemoryRateLimit(input, nowMs);
}

export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "Retry-After": String(result.retryAfterSeconds),
    "X-RateLimit-Backend": result.backend,
  };
}

function applyRateLimitHeaders(
  response: Response,
  headers: Record<string, string>,
): Response {
  for (const [name, value] of Object.entries(headers)) {
    if (!response.headers.has(name)) {
      response.headers.set(name, value);
    }
  }

  return response;
}

function jsonResponse(
  payload: Record<string, unknown>,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

export async function withApiRateLimit<TRequest extends { headers: HeaderSource }>(
  request: TRequest,
  policy: ApiRateLimitPolicy,
  handler: (context: ApiRateLimitContext) => Promise<Response>,
): Promise<Response> {
  const identifier =
    policy.identifier && policy.identifier.trim().length > 0
      ? policy.identifier.trim()
      : getClientIpFromHeaders(request.headers);

  const rateLimit = await consumeRateLimit({
    namespace: policy.namespace,
    identifier,
    max: policy.max,
    windowMs: policy.windowMs,
  });
  const rateLimitHeaders = buildRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return jsonResponse(
      { error: policy.errorMessage ?? "Too many requests" },
      429,
      rateLimitHeaders,
    );
  }

  const response = await handler({ rateLimit, rateLimitHeaders });
  return applyRateLimitHeaders(response, rateLimitHeaders);
}

export async function appendAuditEvent(
  event: AuditEvent,
  sink?: AuditSink,
): Promise<void> {
  const normalized = {
    ...event,
    id: event.id ?? randomUUID(),
    occurredAt: event.occurredAt ?? new Date().toISOString(),
  };

  const targetSink = sink ?? (await resolveDefaultAuditSink());
  await targetSink.write(normalized);
}
