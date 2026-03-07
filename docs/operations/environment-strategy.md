# Environment Strategy

## Isolation

Current operating model uses two branch-driven Coolify stacks:

- Dev
- Prod

Optional future expansion:

- Staging

Each environment uses separate:

- Coolify project/network scope
- Postgres instance and credentials
- Authentik tenant/client credentials
- Directus project/token
- MinIO bucket credentials
- Redis instance
- SMTP relay credentials
- Observability tenancy (Grafana/Loki/Prometheus/Tempo)

## Access model

- Production access limited to approved on-call/staff.
- MFA required for all staff/admin/team accounts.
- Monthly access review required.

## Promotion path

- Feature branch -> `development`
- `development` branch deploy -> Dev
- Approved `development` -> `production` PR -> Prod
