# Self-Hosted Coolify Execution

This document is the implementation baseline for the Zevlin self-hosted decision.

## Locked stack

Control plane and hosting:

- Coolify
- Isolated Dev/Staging/Prod projects

Core services:

- PostgreSQL
- Authentik
- Directus
- MinIO
- Redis
- Grafana + Loki + Prometheus + Tempo

External vendor exceptions:

- Stripe
- Shippo
- Managed SMTP provider

## Deployment artifacts in-repo

- Core service compose spec: `ops/coolify/docker-compose.core.yml`
- Compose environment template: `ops/coolify/.env.compose.example`
- Env contract: `.env.example`, `packages/config/src/env.ts`
- Local platform scripts: `pnpm platform:up`, `pnpm platform:health`, `pnpm platform:down`
- Branch-based deployment runbook: `docs/operations/coolify-branch-deployment.md`

## Blocking phase map

### Phase A (Weeks 1-4): Platform foundation

- Provision Coolify projects and networks.
- Deploy Postgres/MinIO/Redis/Authentik/Directus/Grafana stack.
- Configure TLS, secrets, backups.
- Write restart/failover/restore runbooks.

Testing block stop:
- Infrastructure health checks.
- Staging backup and restore dry run.

### Phase B (Weeks 4-7): Auth and security core

- Integrate Authentik token validation and role mapping.
- Enforce MFA for staff/admin/team routes.
- Replace temporary header auth with real identity validation in app routes.

Testing block stop:
- Auth e2e login/MFA/role-denial.
- Session expiry and refresh lifecycle tests.

### Phase C (Weeks 7-10): Data and storage migration

- Finalize Drizzle migrations and RLS policies.
- Enable durable idempotency and webhook dedupe persistence.
- Implement MinIO adapter usage for storage workflows.
- Run selective migration from `apps/old_website`.

Testing block stop:
- RLS isolation tests.
- Encrypted-field persistence/decrypt tests.
- MinIO signed URL and object flow tests.

### Phase D (Weeks 10-14): Content and commerce integration

- Move content flows to Directus-backed endpoints.
- Keep Stripe/Shippo hardened with replay protection.
- Replace notification path with managed SMTP relay.

Testing block stop:
- Content publish/edit/retrieve checks.
- Checkout + shipping + webhook + notification happy/failure path tests.
- Idempotency replay tests.

### Phase E (Weeks 14-24): SOC2 hardening and launch readiness

- Evidence pipeline for self-hosted controls.
- Monitoring/alerting validation and retention controls.
- Incident tabletop + DR restore drills against RTO/RPO targets.
- External security assessment and remediation.

Testing block stop:
- DR test with measured RTO/RPO.
- Security regression + pentest remediation verification.
- End-to-end release checklist signoff.

## Operational acceptance

- No unresolved critical/high security findings.
- Evidence collection active and auditable.
- All blocking test blocks passed.
