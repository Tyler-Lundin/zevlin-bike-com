# Coolify Deployment Guide (Production + Development Branches)

Repo target: `https://github.com/tyler-lundin/zevlin-bike-com`

App-level deployment settings now live in:

- `docs/operations/deployment/README.md`

Use this branch guide for branch promotion flow, shared environment separation, and rollback policy. Use the deployment guide folder for per-app build commands, ports, env templates, and smoke checks.

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

## 3) Create app(s) in Coolify (do this twice per app)

Create one app per branch for each live app you intend to deploy.

Per-app build, start, port, and env details are maintained in:

- `docs/operations/deployment/landing.md`
- `docs/operations/deployment/store.md`
- `docs/operations/deployment/team.md`
- `docs/operations/deployment/b2b.md`
- `docs/operations/deployment/admin.md`
- `docs/operations/deployment/customer.md`

### A) Development app

- Branch: `development`
- Build pack: `Nixpacks`
- Base directory: repository root
- `NODE_ENV=production`
- `APP_ENV=dev`

### B) Production app

- Branch: `production`
- Build pack: `Nixpacks`
- Base directory: repository root
- `NODE_ENV=production`
- `APP_ENV=prod`

## 4) App environment variables

Use the per-app deployment guides for the exact env blocks to paste into Coolify. Shared runtime rules still apply here:

- `NODE_ENV=production` for every branch
- `APP_ENV=dev` for `development`
- `APP_ENV=prod` for `production`
- `ENFORCE_SELF_HOSTED_REQUIRED=false` for normal shared dev deploys
- `ENFORCE_SELF_HOSTED_REQUIRED=true` for production
- Do not append `-- -p ...` to start commands; set `PORT` instead

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
3. Coolify auto-deploys the `development` app(s) you have configured.
4. Validate the smoke checks from the relevant app guide in `docs/operations/deployment/`.

### Production deploy flow

1. Open PR: `development` -> `production`.
2. Run smoke checks and migration check.
3. Merge PR.
4. Coolify auto-deploys the `production` app(s) you have configured.
5. Validate the smoke checks from the relevant app guide in `docs/operations/deployment/`.

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

## 9) Deploy additional apps

Repeat the same branch model for any live app in the deployment guide folder. The app-specific build commands, start commands, ports, env templates, and smoke checks are documented in `docs/operations/deployment/`.
