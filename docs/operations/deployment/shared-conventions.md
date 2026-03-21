# Shared Deployment Conventions

These rules apply to every live app in this monorepo.

## Platform defaults

| Setting | Value |
| --- | --- |
| Build pack | `Nixpacks` |
| Base directory | Repository root |
| Install command | `corepack enable && pnpm install --frozen-lockfile` |
| Runtime | Node 20+ with pnpm from the workspace lockfile |
| Start pattern | `pnpm --filter @zevlin/<app> start` |
| Health endpoint pattern | `GET /api/health` |

## Branch and runtime mapping

| Git branch | `APP_ENV` | Notes |
| --- | --- | --- |
| `development` | `dev` | Keep `NODE_ENV=production`; use this for shared dev deployments |
| `production` | `prod` | Use for public production traffic |

The code supports `APP_ENV=staging`, but the current repo workflow does not use a dedicated `staging` branch.

## Fixed app ports

| App | Port |
| --- | ---: |
| `@zevlin/landing` | `3001` |
| `@zevlin/store` | `3002` |
| `@zevlin/admin` | `3003` |
| `@zevlin/customer` | `3004` |
| `@zevlin/b2b` | `3005` |
| `@zevlin/team` | `3006` |

Set `PORT` in Coolify to the matching value. Do not add `-- -p ...` to the start command. The repo already routes port handling through `scripts/next-start.mjs`, and forwarding extra CLI args causes Next.js to misread `-p` as a path.

## Required runtime rules

- Always set `NODE_ENV=production` in Coolify. Do not use `NODE_ENV=dev` or `NODE_ENV=development`.
- Use `APP_ENV=dev` for the `development` branch and `APP_ENV=prod` for the `production` branch.
- Set `ENFORCE_SELF_HOSTED_REQUIRED=false` for `development` unless you are intentionally testing strict runtime enforcement.
- Set `ENFORCE_SELF_HOSTED_REQUIRED=true` for `production` so missing self-hosted dependencies fail fast.

## Shared enforced env baseline

When `APP_ENV != dev` or `ENFORCE_SELF_HOSTED_REQUIRED=true`, `packages/config` can require the following self-hosted baseline even if a specific app route does not directly read every key.

| Key | Why it exists |
| --- | --- |
| `DATABASE_URL` | Shared Postgres runtime for orders, submissions, audit, and idempotency |
| `AUTHENTIK_BASE_URL` | Shared auth provider base URL |
| `AUTHENTIK_CLIENT_ID` | Shared auth client credential |
| `AUTHENTIK_CLIENT_SECRET` | Shared auth client secret |
| `DIRECTUS_URL` | Shared CMS base URL |
| `DIRECTUS_TOKEN` | Shared CMS token |
| `MINIO_ENDPOINT` | Shared object storage endpoint |
| `MINIO_ACCESS_KEY` | Shared object storage access key |
| `MINIO_SECRET_KEY` | Shared object storage secret |
| `MINIO_BUCKET` | Shared object storage bucket |
| `MINIO_REGION` | Shared object storage region |
| `MINIO_FORCE_PATH_STYLE` | Shared MinIO path-style toggle |
| `REDIS_URL` | Shared rate limiting and idempotency backend |
| `SMTP_HOST` | Shared SMTP host |
| `SMTP_PORT` | Shared SMTP port |
| `SMTP_USER` | Shared SMTP username |
| `SMTP_PASS` | Shared SMTP password |
| `SMTP_HTTP_RELAY_URL` | Managed SMTP relay URL used by runtime mail senders |
| `SMTP_FROM_EMAIL` | Shared outbound sender email |
| `SMTP_FROM_NAME` | Shared outbound sender name |
| `FIELD_ENCRYPTION_KEY_B64` | Shared 32-byte field-level encryption key |
| `FIELD_HASH_SALT` | Shared lookup hashing salt |
| `KMS_KEY_ID` | Optional key identifier for field encryption metadata |

## App-specific integration envs

These keys are not part of the shared enforced baseline, but they matter for specific apps:

- `STRIPE_SECRET_KEY` for store checkout session creation
- `SHIPPO_API_TOKEN` for admin shipping rate and label operations
- `SHIPPO_WEBHOOK_SECRET` for admin Shippo webhook validation
- `LANDING_INTAKE_EMAIL` and `LANDING_SECURITY_EMAIL` for landing intake and public security contact
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` for landing analytics
- `NEXT_PUBLIC_MARKETING_SITE_URL` for store backlinks to the marketing site

## First deploy checklist

1. Create one Coolify application per app from the same repo root.
2. Set the branch to `development` or `production`.
3. Set `NODE_ENV=production`, `APP_ENV`, `ENFORCE_SELF_HOSTED_REQUIRED`, and `PORT`.
4. Paste the per-app env template and fill in all blank secrets before deploying.
5. Run `pnpm --filter @zevlin/db db:migrate` once against the target database before first traffic for DB-backed apps.
6. Deploy the app and run the smoke checks from the app guide.

## Known Coolify footguns

- `SMTP_HTTP_RELAY_URL` must be blank or a valid absolute URL. An invalid URL breaks Next.js build-time env validation.
- Start commands must stay as `pnpm --filter @zevlin/<app> start`. Passing `-- -p ...` breaks the wrapper script and causes Next.js to treat `-p` as a project directory.
- If a build or runtime path touches `getEnv()` in non-dev, missing baseline self-hosted keys will fail fast even if the UI route looks simple.
