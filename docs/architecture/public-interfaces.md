# Public Package Interfaces

## `@zevlin/auth`

- `validateAccessToken(token)`
- `mapIdentityClaimsToRoles(claims)`
- `requireAuth(context)`
- `requireRole(context, role)`
- `requireMfa(context)`
- `canPerform(action, session, resource)`
- `issueRefreshSession(input)`
- `validateRefreshSession(refreshToken)`
- `rotateRefreshSession(input)`
- `revokeRefreshSession(sessionId)`

## `@zevlin/security`

- `encryptField(value, fieldType)`
- `decryptField(payload, expectedFieldType)`
- `hashLookup(value, fieldType)`
- `appendAuditEvent(event)`
- `getClientIpFromHeaders(headers)`
- `consumeRateLimit(input)`
- `buildRateLimitHeaders(result)`
- `withApiRateLimit(request, policy, handler)`

## `@zevlin/contracts`

Zod contracts for:

- Auth/session
- Orders/address
- Shipping/rates/label purchase/webhooks
- B2B applications/quotes
- Team event signup

## `@zevlin/db`

- Drizzle schema exports under `src/schema/*`
- Database client export (`db`, `pool`)
- Runtime helpers: session context, audit persistence, idempotency, webhook dedupe, identity/refresh sessions
- SQL migrations under `migrations/`

## `@zevlin/integrations`

- Stripe checkout session creator
- Shippo rate/label/void adapters
- Directus content adapters
- MinIO storage URL/signing helpers
- Managed SMTP relay sender
