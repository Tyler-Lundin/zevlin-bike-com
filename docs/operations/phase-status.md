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
- Experience and launch execution track defined in `docs/roadmap/`.

## Current execution plans

- Master roadmap: `docs/roadmap/experience-and-launch-roadmap.md`
- Team destination: `docs/roadmap/team-destination-plan.md`
- Landing polish: `docs/roadmap/landing-polish-plan.md`
- B2B inquiry: `docs/roadmap/b2b-inquiry-plan.md`
- Store refinement: `docs/roadmap/store-refinement-plan.md`
- Production hardening: `docs/roadmap/production-hardening-plan.md`

## Next milestone

- Execute the Team Destination Plan first, then the Landing Polish Plan.
- Use those outputs to finalize homepage routing and quality expectations for the B2B and store refinement passes.
- Treat the Production Hardening Plan as the release gate before production promotion.
