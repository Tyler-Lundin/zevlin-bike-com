# Legacy Source Policy (`apps/old_website`)

`apps/old_website` is a reference-only codebase.

Rules:

- Do not add new features in `apps/old_website`.
- Do not wire production deployments to `apps/old_website`.
- Use it only for selective migration and behavior parity checks.
- New development must occur in `apps/*` and `packages/*` outside the legacy app.
