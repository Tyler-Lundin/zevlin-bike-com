# Coolify Deployment Guide (Production + Development Branches)

Repo target: `https://github.com/tyler-lundin/zevlin-bike-com`

This guide sets up two continuously deployed environments from one repo:

- `production` branch -> production app
- `development` branch -> development app

## 1) Branch and repo bootstrap

Create and push both long-lived branches.

```bash
git remote add origin git@github.com:tyler-lundin/zevlin-bike-com.git
git checkout -b development
git push -u origin development
git checkout -b production
git push -u origin production
```

Recommended GitHub settings:

1. Set default branch to `development`.
2. Protect `production` branch:
   - Require PR merge
   - Require status checks to pass
   - Restrict direct pushes
3. Keep deployable release flow as `development` -> `production` PR.

## 2) Coolify project layout

Use two Coolify projects (or two isolated environments) so secrets and data are separated:

- `zevlin-bike-development`
- `zevlin-bike-production`

For each environment, deploy core services first (Postgres, Redis, MinIO, Authentik, Directus, observability) from:

- `ops/coolify/docker-compose.core.yml`

Use environment-specific values from:

- `ops/coolify/.env.compose.example`

## 3) Create landing app in Coolify (do this twice)

Create one app per branch.

### A) Development app

- Name: `landing-dev`
- Repository: `https://github.com/tyler-lundin/zevlin-bike-com`
- Branch: `development`
- Build pack: `Nixpacks`
- Base directory: repository root

Commands:

- Install: `corepack enable && pnpm install --frozen-lockfile`
- Build: `pnpm --filter @zevlin/landing build`
- Start: `pnpm --filter @zevlin/landing start`

Domain suggestion:

- `dev.zevlinbike.com`

### B) Production app

- Name: `landing-prod`
- Repository: `https://github.com/tyler-lundin/zevlin-bike-com`
- Branch: `production`
- Build pack: `Nixpacks`
- Base directory: repository root

Commands:

- Install: `corepack enable && pnpm install --frozen-lockfile`
- Build: `pnpm --filter @zevlin/landing build`
- Start: `pnpm --filter @zevlin/landing start`

Domain suggestion:

- `www.zevlinbike.com`

## 4) App environment variables

Set these in each Coolify app.

Shared required runtime keys (both branches):

- `NODE_ENV=production`
- `DATABASE_URL=<env-specific postgres url>`
- `REDIS_URL=<env-specific redis url>`
- `FIELD_ENCRYPTION_KEY_B64=<base64 32-byte key>`
- `FIELD_HASH_SALT=<min 16 char secret>`
- `SMTP_HOST=<smtp host>`
- `SMTP_PORT=587`
- `SMTP_USER=<smtp user>`
- `SMTP_PASS=<smtp password>`
- `SMTP_HTTP_RELAY_URL=<smtp relay url>`
- `SMTP_FROM_EMAIL=<from email>`
- `SMTP_FROM_NAME=Zevlin Bike`
- `LANDING_INTAKE_EMAIL=<ops inbox>`
- `LANDING_SECURITY_EMAIL=security@zevlinbike.com`

Development-specific:

- `APP_ENV=dev`
- `ENFORCE_SELF_HOSTED_REQUIRED=false`
- `NEXT_PUBLIC_SITE_URL=https://dev.zevlinbike.com`
- `NEXT_PUBLIC_STORE_URL=https://store.dev.zevlinbike.com` (or your actual dev store URL)
- `NEXT_PUBLIC_TEAM_URL=https://team.dev.zevlinbike.com` (or your actual dev team URL)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=<dev GA id or blank>`
- Do not set `NODE_ENV=dev` or `NODE_ENV=development`; Next.js runtime should stay `production` in Coolify
- If Coolify has a separate port field, use that field and keep the start command as `pnpm --filter @zevlin/landing start`

Production-specific:

- `APP_ENV=prod`
- `ENFORCE_SELF_HOSTED_REQUIRED=true`
- `NEXT_PUBLIC_SITE_URL=https://www.zevlinbike.com`
- `NEXT_PUBLIC_STORE_URL=https://store.zevlinbike.com`
- `NEXT_PUBLIC_TEAM_URL=https://team.zevlinbike.com`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=<prod GA id>`

If you enable strict self-hosted enforcement in production (`APP_ENV=prod`), confirm all required keys in `.env.example` are populated.

## 5) Database migrations per environment

Run migrations against each environment database before first live traffic and after schema changes.

From a shell with target environment variables loaded:

```bash
pnpm install
pnpm --filter @zevlin/db db:migrate
```

Current landing intake requires marketing migrations including:

- `0003_marketing_intake.sql`
- `0004_marketing_privacy_requests.sql`

## 6) Deployment workflow

### Development deploy flow

1. Push to feature branch.
2. Merge into `development`.
3. Coolify auto-deploys `landing-dev`.
4. Validate:
   - `/api/health`
   - `/privacy/request`
   - `/security`
   - newsletter/contact/returns/privacy forms

### Production deploy flow

1. Open PR: `development` -> `production`.
2. Run smoke checks and migration check.
3. Merge PR.
4. Coolify auto-deploys `landing-prod`.
5. Validate production routes and intake alerts.

## 7) Suggested pre-merge checks

Run before merging to either long-lived branch:

```bash
pnpm --filter @zevlin/contracts typecheck
pnpm --filter @zevlin/db typecheck
pnpm --filter @zevlin/landing typecheck
pnpm --filter @zevlin/landing build
pnpm test:block:2
pnpm test:block:3
pnpm test:block:6
```

## 8) Rollback plan

If a production deploy fails:

1. Re-deploy previous successful Coolify deployment for `landing-prod`.
2. Revert merge on `production` branch.
3. If migration caused incompatibility, restore DB backup or apply corrective forward migration.
4. Keep `development` open for patch validation before next promotion.

## 9) Optional next step: deploy more apps

After landing is stable, repeat the same two-branch pattern for:

- `@zevlin/store`
- `@zevlin/admin`

Use corresponding commands by replacing `@zevlin/landing` filter.
