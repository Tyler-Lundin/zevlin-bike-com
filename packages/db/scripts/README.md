# DB Scripts

## Selective migration from legacy app

`migrate-from-old-website.ts` migrates only core commerce entities:

- products
- customers
- orders

Required environment variables:

- `OLD_DATABASE_URL`
- `DATABASE_URL`

Before production use, replace direct PII insertions with `@zevlin/security` field-level encryption.
