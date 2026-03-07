# Phase Status

## Completed

- Phase 0: Relocation into `05-repo/zevlin` and nested legacy `.git` removal.
- Phase 1 foundation: monorepo root config, app scaffolds, shared package boundaries, CI baselines.
- Self-hosted pivot locked: Coolify-first runtime with Authentik, Directus, MinIO, Redis, and Grafana OSS stack.
- Phase 3 auth baseline: Authentik introspection validation, claims-to-role mapping, MFA guard enforcement APIs.
- Phase 4 baseline: Drizzle schema + SQL migrations with self-hosted claim-aware RLS context.
- Durable controls baseline: DB-backed idempotency key reservation and Shippo webhook dedupe persistence.
- Dev bootstrap wizard implemented via `pnpm dev` to ensure local env setup and app-level env sync.
- Testing block framework established (`tb01`..`tb06`) with static checkpoints.

## In Progress

- App-level integration of DB-backed content/storage/auth session flows into `landing/store/admin`.
- `landing` and `team` app pages now consume Directus-backed content with safe fallback data.
- Expansion of refresh-token rotation lifecycle and staff idle/session TTL enforcement in app routes.
- Runtime smoke checks (Block 4) pending stable dependency install and local app startup.

## Next milestone

- Phase A/B execution: bring up isolated Coolify Dev/Staging/Prod foundations and complete auth/session hardening tests.
