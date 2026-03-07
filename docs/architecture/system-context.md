# System Context

## Runtime surfaces

- `apps/landing`: public marketing and SEO content
- `apps/store`: public storefront and checkout initiation
- `apps/admin`: privileged operations interface
- `apps/customer`: authenticated customer account interface
- `apps/b2b`: wholesale onboarding and quoting
- `apps/team`: public cycling team community site

## Core dependencies

Self-hosted on Coolify:

- PostgreSQL (`packages/db` + Drizzle migrations)
- Authentik (auth, MFA, identity claims)
- Directus (CMS/content)
- MinIO (object storage)
- Redis (cache, rate limiting, idempotency support)
- Grafana + Loki + Prometheus + Tempo (observability)

External vendor exceptions:

- Stripe (payments)
- Shippo (shipping labels/tracking)
- Managed SMTP provider (transactional email delivery)

## Trust boundaries

- Public internet to app frontends
- Frontends to server route handlers/actions
- Server to data layer (`packages/db`) through RLS context
- Server to integrations (`Stripe`, `Shippo`, `Directus`, `MinIO`, `SMTP relay`)
- KMS boundary for encryption key management

## Data classes

- Public content
- Internal operational data
- Confidential customer/business data
- Sensitive PII (encrypted at field level)
