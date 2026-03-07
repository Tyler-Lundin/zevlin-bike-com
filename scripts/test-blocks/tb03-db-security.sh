#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MIG_1="$ROOT/packages/db/migrations/0001_initial.sql"
MIG_2="$ROOT/packages/db/migrations/0002_rls.sql"

required_tables=(
  "shipping_packages"
  "shipments"
  "shipment_events"
  "webhook_events"
  "audit_events"
  "idempotency_keys"
  "identity_links"
  "refresh_token_sessions"
)

for table in "${required_tables[@]}"; do
  if ! rg --quiet "CREATE TABLE IF NOT EXISTS $table" "$MIG_1"; then
    echo "[tb03] missing table in migration 0001: $table"
    exit 1
  fi
done

rls_tables=(
  "customers"
  "identity_links"
  "refresh_token_sessions"
  "orders"
  "shipments"
  "webhook_events"
  "idempotency_keys"
  "b2b_accounts"
  "team_updates"
  "audit_events"
)

for table in "${rls_tables[@]}"; do
  if ! rg --quiet "ALTER TABLE $table ENABLE ROW LEVEL SECURITY" "$MIG_2"; then
    echo "[tb03] missing RLS enablement for table: $table"
    exit 1
  fi
done

if ! rg --quiet "CREATE POLICY .*shipments" "$MIG_2"; then
  echo "[tb03] missing shipment policy"
  exit 1
fi

if ! rg --quiet "CREATE POLICY .*products_public_read" "$MIG_2"; then
  echo "[tb03] missing products public read policy"
  exit 1
fi

if ! rg --quiet "current_setting\\('zevlin\\.subject'" "$MIG_2"; then
  echo "[tb03] missing self-hosted identity claim context usage"
  exit 1
fi

if rg --quiet "auth\\.uid\\(" "$MIG_2"; then
  echo "[tb03] found legacy Supabase auth.uid() usage in self-hosted RLS migration"
  exit 1
fi

echo "[tb03] database and RLS checks passed"
