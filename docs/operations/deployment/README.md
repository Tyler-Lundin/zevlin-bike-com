# Deployment Guide

This folder is the source of truth for deploying the live Zevlin apps with Coolify and Nixpacks.

Use this guide set when you need:

- exact install, build, and start commands
- exact app ports
- branch-to-environment mapping
- paste-ready env templates
- first-deploy and smoke-test checklists

## Start here

- [Shared Conventions](./shared-conventions.md)
- [Landing Deployment Guide](./landing.md)
- [Store Deployment Guide](./store.md)
- [Team Deployment Guide](./team.md)
- [B2B Deployment Guide](./b2b.md)
- [Admin Deployment Guide](./admin.md)
- [Customer Deployment Guide](./customer.md)

## Supporting docs

- [Coolify Branch Deployment](../coolify-branch-deployment.md)
- [Environment Strategy](../environment-strategy.md)
- [Self-Hosted Coolify](../self-hosted-coolify.md)

## App matrix

| App | Exposure | Port | Suggested production domain | Guide |
| --- | --- | ---: | --- | --- |
| `@zevlin/landing` | Public | `3001` | `www.zevlinbike.com` | [landing.md](./landing.md) |
| `@zevlin/store` | Public | `3002` | `store.zevlinbike.com` | [store.md](./store.md) |
| `@zevlin/team` | Public | `3006` | `team.zevlinbike.com` | [team.md](./team.md) |
| `@zevlin/b2b` | Public | `3005` | `b2b.zevlinbike.com` | [b2b.md](./b2b.md) |
| `@zevlin/admin` | Internal-only | `3003` | `admin.zevlinbike.internal` | [admin.md](./admin.md) |
| `@zevlin/customer` | Scaffolded/internal | `3004` | `customer.zevlinbike.internal` | [customer.md](./customer.md) |

## Repo-wide rules

- Deploy each app as its own Coolify application from the monorepo root.
- Use `NODE_ENV=production` in Coolify for every branch. Use `APP_ENV` to distinguish `dev` and `prod`.
- Keep the start command as `pnpm --filter @zevlin/<app> start`. Do not append `-- -p ...`.
- Set `PORT` in Coolify to the fixed app port from the matrix above.
- Run database migrations once per environment before first traffic for DB-backed apps.
