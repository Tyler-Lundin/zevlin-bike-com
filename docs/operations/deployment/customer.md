# Customer Deployment Guide

## Purpose and readiness

`@zevlin/customer` is currently a scaffolded internal app. The current route surface is limited to the scaffold page and `GET /api/health`.

## Coolify and Nixpacks settings

| Setting | Value |
| --- | --- |
| App package | `@zevlin/customer` |
| Build pack | `Nixpacks` |
| Base directory | Repository root |
| Install command | `corepack enable && pnpm install --frozen-lockfile` |
| Build command | `pnpm --filter @zevlin/customer build` |
| Start command | `pnpm --filter @zevlin/customer start` |
| Port | `3004` |
| Suggested dev domain | `https://customer.dev.zevlinbike.internal` |
| Suggested prod domain | `https://customer.zevlinbike.internal` |
| Health check | `GET /api/health` |

## Env matrix

| Category | Keys |
| --- | --- |
| Base platform | `NODE_ENV`, `APP_ENV`, `PORT` |

This app does not currently expose stable customer features beyond the scaffold page and health check. Keep the env surface minimal until real customer functionality lands.

## Development env template

```dotenv
NODE_ENV=production
APP_ENV=dev
PORT=3004
```

## Production env template

```dotenv
NODE_ENV=production
APP_ENV=prod
PORT=3004
```

## First deploy checklist

1. Create the Coolify app from the repo root and point it at `development` or `production`.
2. Set the base env values above.
3. Deploy and confirm `GET /api/health` responds successfully.

## Smoke-test checklist

- `GET /api/health`
- `GET /`

## Known caveats

- This app is scaffolded and should not be treated as a public-ready customer portal.
- Future customer features will likely expand the required env surface.
