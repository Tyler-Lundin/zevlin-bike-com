# Testing Blocks

These blocks are intended stop points while building, so we validate foundations before adding more complexity.

## Block 1: Repository Structure Gate

Purpose:
- Confirm relocation and canonical root are correct.

Run:
```bash
./scripts/test-blocks/tb01-repo-structure.sh
```

Exit criteria:
- Moved directories exist only under `05-repo/zevlin`.
- Nested legacy `.git` does not exist.

## Block 2: Public Package API Gate

Purpose:
- Confirm required auth/security interfaces remain present while refactoring.

Run:
```bash
./scripts/test-blocks/tb02-public-apis.sh
```

Exit criteria:
- Auth exports include token validation, role mapping, guard APIs, and refresh-session helpers.
- Security exports include field encryption and audit append API.

## Block 3: DB Security Baseline Gate

Purpose:
- Verify core migration tables and self-hosted claim-aware RLS definitions are present.

Run:
```bash
./scripts/test-blocks/tb03-db-security.sh
```

Exit criteria:
- Core tables include `identity_links`, `refresh_token_sessions`, `idempotency_keys`, `webhook_events`.
- RLS is enabled for identity/order/shipping/audit tables.
- Migration uses `zevlin.*` claim settings and does not reference legacy `auth.uid()`.

## Block 4: HTTP Smoke Gate

Purpose:
- Confirm runtime API health and basic route operability after each app milestone.

Run:
```bash
STORE_BASE_URL=http://localhost:3002 ./scripts/test-blocks/tb04-http-smoke.sh
# Optional admin checks:
STORE_BASE_URL=http://localhost:3002 ADMIN_BASE_URL=http://localhost:3003 ./scripts/test-blocks/tb04-http-smoke.sh
```

Exit criteria:
- `/api/health` returns HTTP 200.

## Block 5: Compliance Artifact Gate

Purpose:
- Ensure required SOC2 docs and targets remain in place.

Run:
```bash
./scripts/test-blocks/tb05-security-static.sh
```

Exit criteria:
- Required compliance docs exist.
- MFA and RTO/RPO commitments are documented.

## Block 6: API Surface Gate

Purpose:
- Confirm required route handler files and schema validations exist for the active build slice.

Run:
```bash
./scripts/test-blocks/tb06-api-surfaces.sh
```

Exit criteria:
- Store/admin/b2b/team critical API routes exist.
- Label/webhook endpoints validate payloads with shared contracts.
- Label purchase uses durable idempotency reservation.
- Shippo webhook route persists dedupe keys.

## Block 7: Self-Hosted Config Gate

Purpose:
- Verify the self-hosted Coolify stack contract is present in code and docs.

Run:
```bash
./scripts/test-blocks/tb07-self-hosted-config.sh
```

Exit criteria:
- Coolify core compose spec exists.
- Self-hosted execution doc exists.
- Required self-hosted env keys are present in `.env.example` and config schema.

## Block 8: Runtime Platform Gate

Purpose:
- Verify self-hosted runtime dependencies are actually reachable before feature testing.

Run:
```bash
pnpm platform:health
# or
./scripts/test-blocks/tb08-platform-runtime.sh
```

Exit criteria:
- Postgres and Redis TCP connectivity pass.
- Authentik, Directus, MinIO, Grafana, Loki, Prometheus, and Tempo health endpoints return success.
- Optional: `tb04` runs against live store/admin apps after platform gate passes.

## Block 9: Abuse/Rate-Limit Gate

Purpose:
- Verify protected API routes return HTTP 429 with standard rate-limit headers under repeated abuse.

Run:
```bash
pnpm test:block:9
# or
./scripts/test-blocks/tb09-rate-limit-abuse.sh
```

Exit criteria:
- Protected store/b2b/team/admin routes return 429 after limit thresholds.
- `X-RateLimit-*` and `Retry-After` headers are present on throttled responses.
- Central `withApiRateLimit` wrapper is actively enforcing route guardrails.

## Full checkpoint run

```bash
pnpm test:blocks
```

Recommended sequence while building:
1. Block 1 + 2 after structural or package API changes.
2. Block 3 after DB migration/policy changes.
3. Block 6 after app/API route additions.
4. Block 4 after runtime startup to smoke-test live endpoints.
5. Block 7 after environment and platform config updates.
6. Block 8 before runtime app smoke checks.
7. Block 9 for abuse/rate-limit verification on protected routes.
8. Block 5 before handoff/release preparation.
