# SOC2 Control Matrix

Scope: Security, Availability, Confidentiality

| Control ID | Trust Criteria | Control | Owner | Evidence Source | Frequency |
| --- | --- | --- | --- | --- | --- |
| CC6.1 | Security | MFA required for staff/admin/team access | Security Lead | Auth policy tests, access review export | Continuous + quarterly review |
| CC6.2 | Security | Least privilege RBAC and review process | Security Lead | Role assignment logs, access review checklist | Monthly |
| CC7.1 | Security | Vulnerability scanning and patch SLAs | Engineering Lead | CI logs (`pnpm security`), issue tracker | Per PR + weekly |
| CC7.2 | Security | Incident response and escalation process | Ops Lead | Incident tickets, postmortems | As needed + quarterly tabletop |
| CC7.3 | Security | API abuse protections (rate limiting + idempotency on critical mutations) | Engineering Lead | API route code review, audit logs, synthetic abuse tests | Continuous + monthly review |
| A1.1 | Availability | Backup and restore process meets RTO/RPO | Platform Lead | Restore runbook execution logs | Monthly |
| A1.2 | Availability | Production monitoring and on-call process | Platform Lead | Grafana/Loki/Prometheus/Tempo alerts and uptime reports | Continuous |
| C1.1 | Confidentiality | Field-level encryption for sensitive PII | Security Lead | Encryption tests, schema review | Continuous |
| C1.2 | Confidentiality | KMS-backed key management and rotation | Security Lead | Key rotation logs, KMS policy docs | Quarterly |

## Evidence retention

- Retain security and audit logs for 13 months minimum.
- Keep CI artifacts for at least 90 days and export critical evidence snapshots monthly.
