# Admin Deployment Guide

## Purpose and readiness

`@zevlin/admin` is the internal admin and fulfillment surface. It is internal-only and should not be exposed publicly without network controls and real auth configured.

## Coolify and Nixpacks settings

| Setting | Value |
| --- | --- |
| App package | `@zevlin/admin` |
| Build pack | `Nixpacks` |
| Base directory | Repository root |
| Install command | `corepack enable && pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @zevlin/admin build` |
| Start command | `pnpm --filter @zevlin/admin start` |
| Port | `3003` |
| Suggested dev domain | `https://admin.dev.zevlinbike.internal` |
| Suggested prod domain | `https://admin.zevlinbike.internal` |
| Health check | `GET /api/health` |

## Env matrix

| Category | Keys |
| --- | --- |
| Base platform | `NODE_ENV`, `APP_ENV`, `ENFORCE_SELF_HOSTED_REQUIRED`, `PORT` |
| Shared runtime baseline | `DATABASE_URL`, `AUTHENTIK_BASE_URL`, `AUTHENTIK_CLIENT_ID`, `AUTHENTIK_CLIENT_SECRET`, `DIRECTUS_URL`, `DIRECTUS_TOKEN`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION`, `MINIO_FORCE_PATH_STYLE`, `REDIS_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_HTTP_RELAY_URL`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `FIELD_ENCRYPTION_KEY_B64`, `FIELD_HASH_SALT`, `KMS_KEY_ID` |
| Admin-specific | `SHIPPO_API_TOKEN`, `SHIPPO_WEBHOOK_SECRET` |

Admin shipping routes depend on auth, audit logging, DB writes, rate limiting, and Shippo integrations. In `APP_ENV=dev`, the app can fall back to legacy header-based session simulation when no real token is present. That mode is for internal development only.

## Development env template

```dotenv
NODE_ENV=production
APP_ENV=dev
ENFORCE_SELF_HOSTED_REQUIRED=false
PORT=3003
DATABASE_URL=
AUTHENTIK_BASE_URL=
AUTHENTIK_CLIENT_ID=
AUTHENTIK_CLIENT_SECRET=
DIRECTUS_URL=
DIRECTUS_TOKEN=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=
MINIO_REGION=us-east-1
MINIO_FORCE_PATH_STYLE=true
REDIS_URL=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_HTTP_RELAY_URL=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Zevlin Bike
FIELD_ENCRYPTION_KEY_B64=
FIELD_HASH_SALT=
KMS_KEY_ID=
SHIPPO_API_TOKEN=
SHIPPO_WEBHOOK_SECRET=
```

## Production env template

```dotenv
NODE_ENV=production
APP_ENV=prod
ENFORCE_SELF_HOSTED_REQUIRED=true
PORT=3003
DATABASE_URL=
AUTHENTIK_BASE_URL=
AUTHENTIK_CLIENT_ID=
AUTHENTIK_CLIENT_SECRET=
DIRECTUS_URL=
DIRECTUS_TOKEN=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=
MINIO_REGION=us-east-1
MINIO_FORCE_PATH_STYLE=true
REDIS_URL=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_HTTP_RELAY_URL=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Zevlin Bike
FIELD_ENCRYPTION_KEY_B64=
FIELD_HASH_SALT=
KMS_KEY_ID=
SHIPPO_API_TOKEN=
SHIPPO_WEBHOOK_SECRET=
```

## First deploy checklist

1. Deploy this app only to a protected internal hostname or behind private networking.
2. Paste the env template and fill in DB, Redis, SMTP, encryption, Authentik, and Shippo values before deploying.
3. Run `pnpm --filter @zevlin/db db:migrate` against the target database before first traffic.
4. Deploy and confirm `GET /api/health` responds successfully.
5. Verify auth behavior with a real token before trusting the environment.

## Smoke-test checklist

- `GET /api/health`
- One authenticated request path
- Shippo webhook request with the configured shared secret
- One shipping rates request and one label lifecycle request with valid auth

## Known caveats

- `APP_ENV=dev` enables legacy header-based session fallback when no real token is present. Do not treat that mode as internet-safe.
- If Shippo credentials are missing, the admin routes can fall back to mock responses in some flows, but the deployment is not operationally complete.
- Keep `NODE_ENV=production` in Coolify even for the `development` branch.
