# Environment Strategy

## Isolation

Three isolated Coolify stacks are required:

- Dev
- Staging
- Prod

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

- Feature branch -> Dev
- Release candidate -> Staging
- Approved release -> Prod
