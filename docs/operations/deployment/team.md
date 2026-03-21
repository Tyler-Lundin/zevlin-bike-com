# Team Deployment Guide

## Purpose and readiness

`@zevlin/team` is the public Zevlin Cycling Team site and signup surface. It is public-facing and expected to run in both `development` and `production` environments.

## Coolify and Nixpacks settings

| Setting | Value |
| --- | --- |
| App package | `@zevlin/team` |
| Build pack | `Nixpacks` |
| Base directory | Repository root |
| Install command | `corepack enable && pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @zevlin/team build` |
| Start command | `pnpm --filter @zevlin/team start` |
| Port | `3006` |
| Suggested dev domain | `https://team.dev.zevlinbike.com` |
| Suggested prod domain | `https://team.zevlinbike.com` |
| Health check | `GET /api/health` |

## Env matrix

| Category | Keys |
| --- | --- |
| Base platform | `NODE_ENV`, `APP_ENV`, `ENFORCE_SELF_HOSTED_REQUIRED`, `PORT` |
| Shared runtime baseline | `DATABASE_URL`, `AUTHENTIK_BASE_URL`, `AUTHENTIK_CLIENT_ID`, `AUTHENTIK_CLIENT_SECRET`, `DIRECTUS_URL`, `DIRECTUS_TOKEN`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION`, `MINIO_FORCE_PATH_STYLE`, `REDIS_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_HTTP_RELAY_URL`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `FIELD_ENCRYPTION_KEY_B64`, `FIELD_HASH_SALT`, `KMS_KEY_ID` |
| Team-specific | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STORE_URL`, `NEXT_PUBLIC_TEAM_URL` |

The team pages can render from the public URL vars alone, but the signup flow is not production-complete without DB, rate limiting, and encryption from the shared runtime baseline.

## Development env template

```dotenv
NODE_ENV=production
APP_ENV=dev
ENFORCE_SELF_HOSTED_REQUIRED=false
PORT=3006
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
NEXT_PUBLIC_TEAM_URL=https://team.dev.zevlinbike.com
```

## Production env template

```dotenv
NODE_ENV=production
APP_ENV=prod
ENFORCE_SELF_HOSTED_REQUIRED=true
PORT=3006
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
NEXT_PUBLIC_TEAM_URL=https://team.zevlinbike.com
```

## First deploy checklist

1. Create the Coolify app from the repo root and point it at `development` or `production`.
2. Paste the env template and fill in DB, Redis, SMTP, and encryption values before deploying.
3. Run `pnpm --filter @zevlin/db db:migrate` against the target database before first traffic.
4. Deploy and confirm `GET /api/health` responds successfully.
5. Test one team event signup end to end.

## Smoke-test checklist

- `GET /api/health`
- `GET /`
- Submit one event signup

## Known caveats

- The marketing pages will render without the DB stack, but the signup flow will not behave correctly until the shared runtime baseline is configured.
- Keep `NODE_ENV=production` in Coolify even for the `development` branch.
