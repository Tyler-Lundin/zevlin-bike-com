# Acceptance Scenarios

## Relocation

- `apps`, `docs`, and `packages` exist under `05-repo/zevlin` only.
- `apps/old_website/.git` does not exist.

## Auth and RBAC

- Unauthenticated users cannot access admin routes.
- Staff without MFA cannot perform privileged admin actions.
- `canPerform` denies unauthorized roles.
- Access token claims map correctly to `customer/admin/ops/b2b/team_editor` roles.

## Session hardening

- Refresh sessions are issued and stored in `refresh_token_sessions`.
- Refresh token rotation updates token hash and invalidates replay.
- Revoked/expired refresh sessions are rejected.

## Data security

- Sensitive fields are encrypted before persistence.
- Hash side-columns are used for deterministic lookup only.
- RLS blocks cross-customer reads.

## Storage and content

- MinIO upload/download signed URL generation succeeds.
- Directus content fetch/update adapters operate with scoped token auth.

## Commerce core

- Guest checkout flow starts and completes through hosted Stripe.
- Shipping label purchase flow uses durable idempotency key reservation.
- Shippo webhook dedupe persists across process restarts.

## B2B

- Unapproved applicants cannot view wholesale pricing.
- Admin/Ops approval grants B2B access.

## Team app

- Public event pages are readable without authentication.
- Only `team_editor` and `admin` can update team content.

## Reliability and compliance

- Backup restore drill demonstrates RTO 4h and RPO 15m objective.
- Security logs retained for 13 months.
