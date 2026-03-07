# Evidence Map

| Control Area | Evidence | Source |
| --- | --- | --- |
| Access Control | MFA enforcement tests, access review logs | `packages/auth`, identity provider exports |
| Vulnerability Management | CI security logs, issue SLA tracking | GitHub Actions, issue tracker |
| Encryption | Encryption unit tests, key rotation records | `packages/security`, KMS logs |
| Availability | Backup drill logs, incident runbooks | `docs/runbooks`, platform logs |
| Monitoring | Alerting rules and incident timelines | Grafana, Loki, Prometheus, Tempo |
