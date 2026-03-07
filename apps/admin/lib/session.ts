import type { NextRequest } from "next/server";
import { extractBearerToken, type AuthSession, validateAccessToken } from "@zevlin/auth";
import { getEnv } from "@zevlin/config";

function parseBoolean(input: string | null): boolean {
  return input === "true" || input === "1";
}

function getLegacyHeaderSession(request: NextRequest): AuthSession | null {
  const userId = request.headers.get("x-zevlin-user-id");
  if (!userId) {
    return null;
  }

  const roles = request.headers
    .get("x-zevlin-roles")
    ?.split(",")
    .map((role) => role.trim())
    .filter(Boolean) ?? ["customer"];

  const now = Math.floor(Date.now() / 1000);
  return {
    userId,
    subject: userId,
    customerId: request.headers.get("x-zevlin-customer-id"),
    roles: roles as AuthSession["roles"],
    mfaVerified: parseBoolean(request.headers.get("x-zevlin-mfa")),
    issuedAt: now - 60,
    expiresAt: now + 3600,
    claims: { source: "legacy_header_fallback" },
  };
}

export async function getSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  const bearerToken = extractBearerToken(request.headers.get("authorization"));
  const cookieToken = request.cookies.get("zevlin_access_token")?.value ?? null;
  const token = bearerToken || cookieToken;

  if (token) {
    try {
      return await validateAccessToken(token);
    } catch {
      // fall through to dev fallback
    }
  }

  const env = getEnv();
  if (env.APP_ENV === "dev") {
    return getLegacyHeaderSession(request);
  }

  return null;
}
