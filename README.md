# Zevlin Monorepo

Security-first ecommerce rebuild for Zevlin Bike.

## Workspace

- `apps/old_website`: legacy reference (read-only source for migration)
- `apps/landing`: public marketing website
- `apps/store`: customer storefront and checkout
- `apps/admin`: operations and backoffice
- `apps/customer`: customer account portal
- `apps/b2b`: wholesale and quote portal
- `apps/team`: cycling team community hub

Shared packages:

- `packages/db`: Postgres schema, migrations, and runtime persistence helpers
- `packages/auth`: Authentik-backed authentication and authorization guards
- `packages/security`: encryption, hashing, and audit event API
- `packages/contracts`: Zod request/response contracts
- `packages/integrations`: Stripe/Shippo + Directus/MinIO/SMTP adapters
- `packages/observability`: telemetry and log correlation helpers
- `packages/config`: environment loading and validation
- `packages/ui`: shared design primitives

## Hosting model

Self-hosted on Coolify for Dev/Staging/Prod with:

- PostgreSQL
- Authentik
- Directus
- MinIO
- Redis
- Grafana/Loki/Prometheus/Tempo

Allowed external vendors: Stripe, Shippo, managed SMTP.

## Quick start

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

## Local dev bootstrap

`pnpm dev` runs an environment bootstrap wizard before starting Turborepo.

- Ensures required keys exist in root `.env.local`
- Prompts for optional integration keys
- Syncs environment values to app-level `.env.local` files

Useful variants:

```bash
pnpm dev:wizard        # run wizard only (even if required keys already exist)
pnpm dev:raw           # skip wizard and run turbo directly
```

## Local platform runtime

Start the self-hosted local stack first:

```bash
cp ops/coolify/.env.compose.example ops/coolify/.env.compose.local
pnpm platform:up
pnpm test:block:8
```

Stop the stack:

```bash
pnpm platform:down
```

## Security gates

```bash
pnpm security
```

This repository tracks SOC2 controls for Security, Availability, and Confidentiality. See `docs/compliance` and `docs/policies`.

## Testing blocks

Use checkpoint scripts while building to avoid late integration failures:

```bash
pnpm test:blocks
```

Runtime smoke checks are separate:

```bash
STORE_BASE_URL=http://localhost:3002 ADMIN_BASE_URL=http://localhost:3003 pnpm test:block:4
```

See `docs/testing/testing-blocks.md` for block definitions.
