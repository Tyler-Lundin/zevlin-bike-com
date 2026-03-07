# Key Management Policy

- Use cloud KMS-backed keys for encryption key material.
- Never commit plaintext keys or long-lived secrets.
- Rotate encryption keys quarterly or upon compromise suspicion.
- Separate permissions for key administration and key usage.
