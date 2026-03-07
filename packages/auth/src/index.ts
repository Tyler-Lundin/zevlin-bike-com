import { getEnv } from "@zevlin/config";
import {
  createRefreshTokenSession,
  getActiveRefreshTokenSession,
  revokeRefreshTokenSession,
  rotateRefreshTokenSession,
  touchRefreshTokenSession,
  upsertIdentityLink,
} from "@zevlin/db";
import type { Role, Session } from "@zevlin/contracts";

export type AuthSession = Session & {
  subject: string;
  email?: string;
  claims?: Record<string, unknown>;
};

export type AuthContext = {
  session: AuthSession | null;
  nowEpochSeconds?: number;
};

export type AuthorizationAction =
  | "orders.read"
  | "orders.manage"
  | "products.manage"
  | "users.manage"
  | "b2b.approve"
  | "team.content.manage";

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

type IdentityClaims = Record<string, unknown>;

type IntrospectionPayload = {
  active?: boolean;
  sub?: string;
  email?: string;
  iat?: number;
  exp?: number;
  amr?: string[];
  acr?: string;
  scope?: string;
  groups?: string[];
  roles?: string[];
  customer_id?: string;
  [key: string]: unknown;
};

const DEFAULT_CUSTOMER_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 14;
const DEFAULT_STAFF_REFRESH_TTL_SECONDS = 60 * 60 * 12;
const MAX_CUSTOMER_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_STAFF_REFRESH_TTL_SECONDS = 60 * 60 * 24;
const STAFF_ROLES: Role[] = ["admin", "ops", "team_editor"];

function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }

  return false;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value
      .split(/[ ,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeIdentityToken(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function hasStaffRole(roles: Role[]): boolean {
  return roles.some((role) => STAFF_ROLES.includes(role));
}

function computeRefreshTtlSeconds(session: AuthSession, requestedTtlSeconds?: number): number {
  const staff = hasStaffRole(session.roles);
  const fallback = staff
    ? DEFAULT_STAFF_REFRESH_TTL_SECONDS
    : DEFAULT_CUSTOMER_REFRESH_TTL_SECONDS;
  const maxTtl = staff ? MAX_STAFF_REFRESH_TTL_SECONDS : MAX_CUSTOMER_REFRESH_TTL_SECONDS;
  const requested = requestedTtlSeconds ?? fallback;
  return Math.max(60, Math.min(requested, maxTtl));
}

export function mapIdentityClaimsToRoles(claims: IdentityClaims): Role[] {
  const roleSources = [
    ...parseStringArray(claims["roles"]),
    ...parseStringArray(claims["groups"]),
    ...parseStringArray(claims["scope"]),
  ].map(normalizeIdentityToken);

  const roles = new Set<Role>();

  if (
    roleSources.some((value) =>
      ["admin", "zevlin_admin", "superadmin", "super_admin"].includes(value),
    )
  ) {
    roles.add("admin");
  }

  if (
    roleSources.some((value) =>
      ["ops", "operations", "zevlin_ops", "fulfillment_ops"].includes(value),
    )
  ) {
    roles.add("ops");
  }

  if (
    roleSources.some((value) =>
      ["team_editor", "team", "cycling_team_editor"].includes(value),
    )
  ) {
    roles.add("team_editor");
  }

  if (roleSources.some((value) => ["b2b_customer", "wholesale", "wholesale_customer"].includes(value))) {
    roles.add("b2b_customer");
  }

  if (roleSources.some((value) => ["b2b_applicant", "wholesale_applicant"].includes(value))) {
    roles.add("b2b_applicant");
  }

  if (roles.size === 0) {
    roles.add("customer");
  }

  return Array.from(roles);
}

function isMfaSatisfied(payload: IntrospectionPayload): boolean {
  const amrValues = parseStringArray(payload.amr).map((value) => value.toLowerCase());
  const acr = typeof payload.acr === "string" ? payload.acr.toLowerCase() : "";

  if (parseBool(payload["mfa"])) {
    return true;
  }

  if (amrValues.some((value) => ["mfa", "otp", "totp", "webauthn"].includes(value))) {
    return true;
  }

  if (acr.includes("mfa") || acr.includes("loa2") || acr.includes("loa3")) {
    return true;
  }

  return false;
}

function buildAuthSession(payload: IntrospectionPayload): AuthSession {
  const now = Math.floor(Date.now() / 1000);
  const subject = payload.sub;

  if (!subject) {
    throw new AccessDeniedError("Auth provider did not return a subject");
  }

  return {
    userId: subject,
    subject,
    customerId:
      typeof payload.customer_id === "string" && payload.customer_id.length > 0
        ? payload.customer_id
        : null,
    roles: mapIdentityClaimsToRoles(payload),
    mfaVerified: isMfaSatisfied(payload),
    issuedAt: typeof payload.iat === "number" ? payload.iat : now - 60,
    expiresAt: typeof payload.exp === "number" ? payload.exp : now + 60 * 60,
    email: typeof payload.email === "string" ? payload.email : undefined,
    claims: payload,
  };
}

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token.trim();
}

export type RefreshSessionIssueInput = {
  session: AuthSession;
  refreshToken: string;
  ttlSeconds?: number;
  ipAddress?: string;
  userAgent?: string;
  provider?: string;
};

export type RefreshSessionValidation = {
  sessionId: string;
  identityLinkId: string;
  provider: string;
  subject: string;
  customerId: string | null;
  expiresAt: Date;
};

export async function validateAccessToken(token: string): Promise<AuthSession> {
  const env = getEnv();
  if (!env.AUTHENTIK_BASE_URL || !env.AUTHENTIK_CLIENT_ID || !env.AUTHENTIK_CLIENT_SECRET) {
    throw new AccessDeniedError("Authentik environment is not fully configured");
  }

  const introspectionUrl = `${env.AUTHENTIK_BASE_URL.replace(/\/$/, "")}/application/o/introspect/`;
  const credentials = Buffer.from(
    `${env.AUTHENTIK_CLIENT_ID}:${env.AUTHENTIK_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(introspectionUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ token }),
  });

  if (!response.ok) {
    throw new AccessDeniedError(`Token introspection failed (${response.status})`);
  }

  const payload = (await response.json()) as IntrospectionPayload;
  if (!payload.active) {
    throw new AccessDeniedError("Token is inactive or expired");
  }

  const session = buildAuthSession(payload);
  try {
    await upsertIdentityLink({
      provider: "authentik",
      subject: session.subject,
      customerId: session.customerId,
      email: session.email ?? null,
      claims: payload,
    });
  } catch {
    // Keep auth availability resilient if DB persistence is temporarily unavailable.
  }

  return session;
}

export async function issueRefreshSession(
  input: RefreshSessionIssueInput,
): Promise<{ sessionId: string; expiresAt: Date }> {
  const ttlSeconds = computeRefreshTtlSeconds(input.session, input.ttlSeconds);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const identity = await upsertIdentityLink({
    provider: input.provider ?? "authentik",
    subject: input.session.subject,
    customerId: input.session.customerId,
    email: input.session.email ?? null,
    claims: input.session.claims ?? null,
  });

  const refresh = await createRefreshTokenSession({
    identityLinkId: identity.id,
    refreshToken: input.refreshToken,
    expiresAt,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return {
    sessionId: refresh.id,
    expiresAt,
  };
}

export async function validateRefreshSession(
  refreshToken: string,
): Promise<RefreshSessionValidation | null> {
  const active = await getActiveRefreshTokenSession(refreshToken);
  if (!active) {
    return null;
  }

  await touchRefreshTokenSession(active.sessionId);
  return {
    sessionId: active.sessionId,
    identityLinkId: active.identityLinkId,
    provider: active.identityProvider,
    subject: active.identitySubject,
    customerId: active.customerId,
    expiresAt: active.expiresAt,
  };
}

export async function rotateRefreshSession(input: {
  sessionId: string;
  nextRefreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<boolean> {
  return rotateRefreshTokenSession({
    sessionId: input.sessionId,
    newRefreshToken: input.nextRefreshToken,
    expiresAt: input.expiresAt,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

export async function revokeRefreshSession(sessionId: string): Promise<void> {
  await revokeRefreshTokenSession(sessionId);
}

export function requireAuth(context: AuthContext): AuthSession {
  const session = context.session;
  if (!session) {
    throw new AccessDeniedError("Authentication required");
  }

  const now = context.nowEpochSeconds ?? Math.floor(Date.now() / 1000);
  if (session.expiresAt <= now) {
    throw new AccessDeniedError("Session expired");
  }

  return session;
}

export function requireRole(context: AuthContext, role: Role): AuthSession {
  const session = requireAuth(context);
  if (!session.roles.includes(role)) {
    throw new AccessDeniedError(`Role ${role} is required`);
  }

  return session;
}

export function requireMfa(context: AuthContext): AuthSession {
  const session = requireAuth(context);
  if (!session.mfaVerified) {
    throw new AccessDeniedError("MFA verification is required");
  }

  return session;
}

export function canPerform(
  action: AuthorizationAction,
  session: AuthSession,
  resource?: { ownerCustomerId?: string | null },
): boolean {
  const roles = new Set(session.roles);

  if (roles.has("admin")) {
    return true;
  }

  switch (action) {
    case "orders.read":
      if (roles.has("ops") || roles.has("b2b_customer")) {
        return true;
      }
      return !!resource?.ownerCustomerId && resource.ownerCustomerId === session.customerId;
    case "orders.manage":
      return roles.has("ops");
    case "products.manage":
      return roles.has("ops");
    case "users.manage":
      return false;
    case "b2b.approve":
      return roles.has("ops");
    case "team.content.manage":
      return roles.has("team_editor");
    default:
      return false;
  }
}
