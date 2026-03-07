import { createHash } from "crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { getEnv } from "@zevlin/config";
import { db } from "./client";
import { auditEvents, idempotencyKeys } from "./schema/audit";
import { webhookEvents } from "./schema/fulfillment";
import { identityLinks, refreshTokenSessions } from "./schema/identity";

export type DbSessionContext = {
  subject?: string | null;
  customerId?: string | null;
  roles?: string[];
  system?: boolean;
};

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type IdentityLink = {
  id: string;
  provider: string;
  subject: string;
  customerId: string | null;
  email: string | null;
  claims: Record<string, unknown> | null;
};

export type ActiveRefreshSession = {
  sessionId: string;
  identityLinkId: string;
  identityProvider: string;
  identitySubject: string;
  customerId: string | null;
  expiresAt: Date;
};

export type AuditEventInsert = {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  occurredAt?: Date;
  requestId?: string;
  metadata?: Record<string, unknown>;
};

function normalizeRoles(roles?: string[]): string {
  return (roles ?? [])
    .map((role) => role.trim())
    .filter(Boolean)
    .join(",");
}

async function applySessionContext(tx: DbTransaction, context: DbSessionContext): Promise<void> {
  await tx.execute(
    sql`select
      set_config('zevlin.subject', ${context.subject ?? ""}, true),
      set_config('zevlin.customer_id', ${context.customerId ?? ""}, true),
      set_config('zevlin.roles', ${normalizeRoles(context.roles)}, true),
      set_config('zevlin.system', ${context.system ? "true" : "false"}, true)`,
  );
}

export async function withDbSessionContext<T>(
  context: DbSessionContext,
  callback: (tx: DbTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applySessionContext(tx, context);
    return callback(tx);
  });
}

export async function reserveIdempotencyKey(key: string, operation: string): Promise<boolean> {
  return withDbSessionContext({ system: true }, async (tx) => {
    const inserted = await tx
      .insert(idempotencyKeys)
      .values({ key, operation })
      .onConflictDoNothing({ target: idempotencyKeys.key })
      .returning({ id: idempotencyKeys.id });

    return inserted.length > 0;
  });
}

export async function recordWebhookEvent(
  provider: string,
  providerEventId: string,
): Promise<boolean> {
  return withDbSessionContext({ system: true }, async (tx) => {
    const inserted = await tx
      .insert(webhookEvents)
      .values({ provider, providerEventId })
      .onConflictDoNothing({ target: webhookEvents.providerEventId })
      .returning({ id: webhookEvents.id });

    return inserted.length > 0;
  });
}

export async function insertAuditEvent(event: AuditEventInsert): Promise<void> {
  await withDbSessionContext({ system: true }, async (tx) => {
    await tx.insert(auditEvents).values({
      actorId: event.actorId,
      actorRole: event.actorRole,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      createdAt: event.occurredAt ?? new Date(),
      requestId: event.requestId,
      metadata: event.metadata,
    });
  });
}

export async function upsertIdentityLink(input: {
  provider?: string;
  subject: string;
  customerId?: string | null;
  email?: string | null;
  claims?: Record<string, unknown> | null;
}): Promise<IdentityLink> {
  const provider = input.provider ?? "authentik";

  const rows = await withDbSessionContext({ system: true }, async (tx) =>
    tx
      .insert(identityLinks)
      .values({
        provider,
        subject: input.subject,
        customerId: input.customerId ?? null,
        email: input.email ?? null,
        claims: input.claims ?? null,
      })
      .onConflictDoUpdate({
        target: [identityLinks.provider, identityLinks.subject],
        set: {
          customerId: input.customerId ?? null,
          email: input.email ?? null,
          claims: input.claims ?? null,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: identityLinks.id,
        provider: identityLinks.provider,
        subject: identityLinks.subject,
        customerId: identityLinks.customerId,
        email: identityLinks.email,
        claims: identityLinks.claims,
      }),
  );

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to upsert identity link");
  }

  return {
    ...row,
    claims: (row.claims as Record<string, unknown> | null) ?? null,
  };
}

function hashRefreshToken(token: string): string {
  const env = getEnv();
  const salt = env.FIELD_HASH_SALT;
  if (!salt) {
    throw new Error("FIELD_HASH_SALT is required for refresh token hashing");
  }

  return createHash("sha256").update(`refresh:${salt}:${token}`).digest("hex");
}

export async function createRefreshTokenSession(input: {
  identityLinkId: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ id: string; refreshTokenHash: string }> {
  const refreshTokenHash = hashRefreshToken(input.refreshToken);

  const rows = await withDbSessionContext({ system: true }, async (tx) =>
    tx
      .insert(refreshTokenSessions)
      .values({
        identityLinkId: input.identityLinkId,
        refreshTokenHash,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      })
      .returning({ id: refreshTokenSessions.id }),
  );

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to create refresh token session");
  }

  return {
    id: row.id,
    refreshTokenHash,
  };
}

export async function getActiveRefreshTokenSession(
  refreshToken: string,
): Promise<ActiveRefreshSession | null> {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  return withDbSessionContext({ system: true }, async (tx) => {
    const rows = await tx
      .select({
        sessionId: refreshTokenSessions.id,
        identityLinkId: refreshTokenSessions.identityLinkId,
        identityProvider: identityLinks.provider,
        identitySubject: identityLinks.subject,
        customerId: identityLinks.customerId,
        expiresAt: refreshTokenSessions.expiresAt,
      })
      .from(refreshTokenSessions)
      .innerJoin(identityLinks, eq(refreshTokenSessions.identityLinkId, identityLinks.id))
      .where(
        and(
          eq(refreshTokenSessions.refreshTokenHash, refreshTokenHash),
          isNull(refreshTokenSessions.revokedAt),
          gt(refreshTokenSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  });
}

export async function rotateRefreshTokenSession(input: {
  sessionId: string;
  newRefreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<boolean> {
  const nextHash = hashRefreshToken(input.newRefreshToken);

  return withDbSessionContext({ system: true }, async (tx) => {
    const rows = await tx
      .update(refreshTokenSessions)
      .set({
        refreshTokenHash: nextHash,
        issuedAt: new Date(),
        expiresAt: input.expiresAt,
        revokedAt: null,
        lastSeenAt: new Date(),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(refreshTokenSessions.id, input.sessionId),
          isNull(refreshTokenSessions.revokedAt),
        ),
      )
      .returning({ id: refreshTokenSessions.id });

    return rows.length > 0;
  });
}

export async function touchRefreshTokenSession(sessionId: string): Promise<void> {
  await withDbSessionContext({ system: true }, async (tx) => {
    await tx
      .update(refreshTokenSessions)
      .set({
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(refreshTokenSessions.id, sessionId));
  });
}

export async function revokeRefreshTokenSession(sessionId: string): Promise<void> {
  await withDbSessionContext({ system: true }, async (tx) => {
    await tx
      .update(refreshTokenSessions)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(refreshTokenSessions.id, sessionId));
  });
}
