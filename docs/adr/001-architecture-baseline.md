# ADR-001: Architecture Baseline

## Decision

Use `pnpm + Turborepo` monorepo with multiple Next.js apps and shared TypeScript packages.

## Rationale

- Supports clear app boundaries for store/admin/customer/b2b/team.
- Enables shared security and data packages with consistent controls.
- Improves CI performance with task caching and scoped builds.
