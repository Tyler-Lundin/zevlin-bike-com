# Store Deployment Guide

## Purpose and readiness

`@zevlin/store` is the public storefront and hosted-checkout handoff application. It is public-facing and expected to run in both `development` and `production` environments.

## Coolify and Nixpacks settings

| Setting | Value |
| --- | --- |
| App package | `@zevlin/store` |
| Build pack | `Nixpacks` |
| Base directory | Repository root |
| Install command | `corepack enable && pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @zevlin/store build` |
| Start command | `pnpm --filter @zevlin/store start` |
| Port | `3002` |
| Suggested dev domain | `https://store.dev.zevlinbike.com` |
| Suggested prod domain | `https://store.zevlinbike.com` |
| Health check | `GET /api/health` |

## Env matrix

| Category | Keys |
| --- | --- |
| Base platform | `NODE_ENV`, `APP_ENV`, `ENFORCE_SELF_HOSTED_REQUIRED`, `PORT` |
| Shared runtime baseline | `DATABASE_URL`, `AUTHENTIK_BASE_URL`, `AUTHENTIK_CLIENT_ID`, `AUTHENTIK_CLIENT_SECRET`, `DIRECTUS_URL`, `DIRECTUS_TOKEN`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION`, `MINIO_FORCE_PATH_STYLE`, `REDIS_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_HTTP_RELAY_URL`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `FIELD_ENCRYPTION_KEY_B64`, `FIELD_HASH_SALT`, `KMS_KEY_ID` |
| Store-specific | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MARKETING_SITE_URL`, `STRIPE_SECRET_KEY` |

Checkout session creation depends on DB, Redis, encryption keys, and Stripe. The store app also reads `NEXT_PUBLIC_MARKETING_SITE_URL` for return links back to the marketing site.

## Development env template

```dotenv
NODE_ENV=production
APP_ENV=dev
ENFORCE_SELF_HOSTED_REQUIRED=false
PORT=3002
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
STRIPE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://store.dev.zevlinbike.com
NEXT_PUBLIC_MARKETING_SITE_URL=https://dev.zevlinbike.com
```

## Production env template

```dotenv
NODE_ENV=production
APP_ENV=prod
ENFORCE_SELF_HOSTED_REQUIRED=true
PORT=3002
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
STRIPE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://store.zevlinbike.com
NEXT_PUBLIC_MARKETING_SITE_URL=https://www.zevlinbike.com
```

## First deploy checklist

1. Create the Coolify app from the repo root and point it at `development` or `production`.
2. Paste the env template and fill in Stripe, DB, Redis, SMTP, and encryption values.
3. Run `pnpm --filter @zevlin/db db:migrate` against the target database before first traffic.
4. Deploy and confirm `GET /api/health` responds successfully.
5. Create one test checkout session before opening the app to real traffic.

## Smoke-test checklist

- `GET /api/health`
- `GET /`
- `GET /products/crack-chamois-cream`
- `GET /cart`
- `GET /checkout`
- Add one item to cart and initiate a hosted Stripe checkout session

## Known caveats

- `NEXT_PUBLIC_MARKETING_SITE_URL` is required by the store app and is now part of the repo env reference.
- The checkout handoff can render without Stripe, but a real checkout session cannot be created until `STRIPE_SECRET_KEY` is populated.
- Keep `NODE_ENV=production` in Coolify even for the `development` branch.
