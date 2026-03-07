# Threat Model

## Assets

- Customer identity and PII
- Order and payment metadata
- Admin and team privileged workflows
- Shipping and fulfillment data
- B2B account and pricing data

## Primary threats

- Account takeover via weak auth/session controls
- Privilege escalation in admin and internal tooling
- Data exfiltration from misconfigured database access
- Webhook replay and tampering
- Supply-chain and dependency compromise

## Security baseline

- MFA required for all staff/admin/team identities
- RLS default-deny with explicit allow policies
- Field-level encryption for sensitive PII
- Signed webhook verification and idempotency keys
- Route-level rate limiting on public and privileged API surfaces
- Full audit event logging for privileged actions

## Residual risk register (initial)

- Third-party outage risk (Stripe/Shippo/SMTP provider)
- Misconfiguration risk in environment/secrets lifecycle
- Insider risk mitigated with least privilege and logging
