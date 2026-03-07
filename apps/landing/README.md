# @zevlin/landing

Purpose: Landing application in the Zevlin monorepo.

## Commands

- `pnpm --filter @zevlin/landing dev`
- `pnpm --filter @zevlin/landing build`
- `pnpm --filter @zevlin/landing typecheck`
- `pnpm migrate:inventory:legacy`

## Legacy Migration Inputs

- Generated inventory JSON: `apps/landing/lib/legacy-inventory.json`
- Generated inventory report: `docs/operations/legacy-website-inventory.md`

## Intake and Compliance Routes

- `POST /api/newsletter/signup`
- `POST /api/contact`
- `POST /api/returns`
- `POST /api/privacy/request`
- `POST /api/analytics/event`

## Public SEO/Legal Routes

- `/contact`
- `/faq`
- `/privacy`
- `/privacy/request`
- `/returns`
- `/security`
- `/shipping`
- `/terms`
