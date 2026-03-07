#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

check_pattern() {
  local file="$1"
  local pattern="$2"
  local label="$3"

  if ! rg --quiet "$pattern" "$file"; then
    echo "[tb02] missing $label in $file"
    exit 1
  fi
}

check_pattern "$ROOT/packages/auth/src/index.ts" "export function requireAuth" "requireAuth"
check_pattern "$ROOT/packages/auth/src/index.ts" "export function requireRole" "requireRole"
check_pattern "$ROOT/packages/auth/src/index.ts" "export function requireMfa" "requireMfa"
check_pattern "$ROOT/packages/auth/src/index.ts" "export function canPerform" "canPerform"
check_pattern "$ROOT/packages/auth/src/index.ts" "export async function validateAccessToken" "validateAccessToken"
check_pattern "$ROOT/packages/auth/src/index.ts" "export function mapIdentityClaimsToRoles" "mapIdentityClaimsToRoles"
check_pattern "$ROOT/packages/auth/src/index.ts" "export async function issueRefreshSession" "issueRefreshSession"
check_pattern "$ROOT/packages/auth/src/index.ts" "export async function validateRefreshSession" "validateRefreshSession"

check_pattern "$ROOT/packages/security/src/index.ts" "export function encryptField" "encryptField"
check_pattern "$ROOT/packages/security/src/index.ts" "export function decryptField" "decryptField"
check_pattern "$ROOT/packages/security/src/index.ts" "export function hashLookup" "hashLookup"
check_pattern "$ROOT/packages/security/src/index.ts" "export async function appendAuditEvent" "appendAuditEvent"
check_pattern "$ROOT/packages/security/src/index.ts" "export async function withApiRateLimit" "withApiRateLimit"

echo "[tb02] public API checks passed"
