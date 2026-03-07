# RLS Notes

RLS policies are managed in `migrations/0002_rls.sql`.

Policy model:

- Default deny on protected tables.
- Public read only where explicitly allowed (catalog and team public content).
- Admin/Ops privileged policies for internal operations.
- Customer self-service access constrained by ownership joins.
