# Disaster Recovery Runbook

## Targets

- RTO: 4 hours
- RPO: 15 minutes

## Steps

1. Declare incident and assign commander.
2. Freeze risky production changes.
3. Validate latest successful backup timestamp.
4. Restore database snapshot to verified recovery environment.
5. Run smoke tests for auth, checkout, order retrieval, and admin access.
6. Promote recovered environment after approval.
7. Publish incident timeline and postmortem.

## Validation cadence

- Monthly restore drill in staging.
- Quarterly tabletop involving engineering and operations.
