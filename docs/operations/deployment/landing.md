# Landing Deployment Guide

## Purpose and readiness

`@zevlin/landing` is the public marketing site, support surface, and intake entrypoint. It is public-facing and expected to run in both `development` and `production` environments.

## Coolify and Nixpacks settings

| Setting | Value |
| --- | --- |
| App package | `@zevlin/landing` |
| Build pack | `Nixpacks` |
| Base directory | Repository root |
| Install command | `corepack enable && pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @zevlin/landing build` |
| Start command | `pnpm --filter @zevlin/landing start` |
| Port | `3001` |
| Suggested dev domain | `https://dev.zevlinbike.com` |
| Suggested prod domain | `https://www.zevlinbike.com` |
| Health check | `GET /api/health` |

## Env matrix

| Category | Keys |
| --- | --- |
| Base platform | `NODE_ENV`, `APP_ENV`, `ENFORCE_SELF_HOSTED_REQUIRED`, `PORT` |
| Shared runtime baseline | `DATABASE_URL`, `AUTHENTIK_BASE_URL`, `AUTHENTIK_CLIENT_ID`, `AUTHENTIK_CLIENT_SECRET`, `DIRECTUS_URL`, `DIRECTUS_TOKEN`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION`, `MINIO_FORCE_PATH_STYLE`, `REDIS_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_HTTP_RELAY_URL`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `FIELD_ENCRYPTION_KEY_B64`, `FIELD_HASH_SALT`, `KMS_KEY_ID` |
| Landing-specific | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STORE_URL`, `NEXT_PUBLIC_TEAM_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `LANDING_INTAKE_EMAIL`, `LANDING_SECURITY_EMAIL` |

Landing forms, privacy requests, newsletter signups, and contact flows use DB writes, rate limiting, encryption, and SMTP-backed intake notifications. In non-dev, the shared runtime baseline matters even when the visible page appears static.

## Development env template

```dotenv
NODE_ENV=production
APP_ENV=dev
ENFORCE_SELF_HOSTED_REQUIRED=false
PORT=3001
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
NEXT_PUBLIC_GA_MEASUREMENT_ID=
LANDING_INTAKE_EMAIL=
LANDING_SECURITY_EMAIL=security@zevlinbike.com
```

## Production env template

```dotenv
NODE_ENV=production
APP_ENV=prod
ENFORCE_SELF_HOSTED_REQUIRED=true
PORT=3001
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
NEXT_PUBLIC_GA_MEASUREMENT_ID=
LANDING_INTAKE_EMAIL=
LANDING_SECURITY_EMAIL=security@zevlinbike.com
```

## First deploy checklist

1. Create the Coolify app from the repo root and point it at `development` or `production`.
2. Paste the env template, then fill in every blank secret before deploying.
3. Run `pnpm --filter @zevlin/db db:migrate` against the target database before first traffic.
4. Deploy and confirm `GET /api/health` responds successfully.
5. Test one newsletter or contact submission end to end.

## Smoke-test checklist

- `GET /api/health`
- `GET /`
- `GET /privacy/request`
- Submit the newsletter form once
- Submit the contact form once
- Confirm intake notification delivery or expected relay logs

## Known caveats

- `SMTP_HTTP_RELAY_URL` must be blank or a valid absolute URL. An invalid value fails build-time env validation.
- If `SMTP_HTTP_RELAY_URL` is blank, the app may build, but SMTP-backed intake delivery will not be fully functional.
- Keep `NODE_ENV=production` in Coolify even for the `development` branch.
