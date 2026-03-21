# B2B Deployment Guide

## Purpose and readiness

`@zevlin/b2b` is the public wholesale, retail, and partnership inquiry surface. It is public-facing and expected to run in both `development` and `production` environments.

## Coolify and Nixpacks settings

| Setting | Value |
| --- | --- |
| App package | `@zevlin/b2b` |
| Build pack | `Nixpacks` |
| Base directory | Repository root |
| Install command | `corepack enable && pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @zevlin/b2b build` |
| Start command | `pnpm --filter @zevlin/b2b start` |
| Port | `3005` |
| Suggested dev domain | `https://b2b.dev.zevlinbike.com` |
| Suggested prod domain | `https://b2b.zevlinbike.com` |
| Health check | `GET /api/health` |

## Env matrix

| Category | Keys |
| --- | --- |
| Base platform | `NODE_ENV`, `APP_ENV`, `ENFORCE_SELF_HOSTED_REQUIRED`, `PORT` |
| Shared runtime baseline | `DATABASE_URL`, `AUTHENTIK_BASE_URL`, `AUTHENTIK_CLIENT_ID`, `AUTHENTIK_CLIENT_SECRET`, `DIRECTUS_URL`, `DIRECTUS_TOKEN`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION`, `MINIO_FORCE_PATH_STYLE`, `REDIS_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_HTTP_RELAY_URL`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `FIELD_ENCRYPTION_KEY_B64`, `FIELD_HASH_SALT`, `KMS_KEY_ID` |
| B2B-specific | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STORE_URL` |

The inquiry route depends on DB writes, rate limiting, and encryption from the shared runtime baseline.

## Development env template

```dotenv
NODE_ENV=production
APP_ENV=dev
ENFORCE_SELF_HOSTED_REQUIRED=false
PORT=3005
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
NEXT_PUBLIC_SITE_URL=https://dev.zevlinbike.com
NEXT_PUBLIC_STORE_URL=https://store.dev.zevlinbike.com
```

## Production env template

```dotenv
NODE_ENV=production
APP_ENV=prod
ENFORCE_SELF_HOSTED_REQUIRED=true
PORT=3005
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
NEXT_PUBLIC_SITE_URL=https://www.zevlinbike.com
NEXT_PUBLIC_STORE_URL=https://store.zevlinbike.com
```

## First deploy checklist

1. Create the Coolify app from the repo root and point it at `development` or `production`.
2. Paste the env template and fill in DB, Redis, SMTP, and encryption values before deploying.
3. Run `pnpm --filter @zevlin/db db:migrate` against the target database before first traffic.
4. Deploy and confirm `GET /api/health` responds successfully.
5. Submit one test inquiry.

## Smoke-test checklist

- `GET /api/health`
- `GET /`
- Submit one B2B inquiry

## Known caveats

- The page can render with only the public URLs, but the inquiry route needs the shared runtime baseline.
- Keep `NODE_ENV=production` in Coolify even for the `development` branch.
