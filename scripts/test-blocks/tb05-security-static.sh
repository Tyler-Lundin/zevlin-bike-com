#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

required_docs=(
  "$ROOT/docs/compliance/control-matrix.md"
  "$ROOT/docs/security/threat-model.md"
  "$ROOT/docs/runbooks/disaster-recovery.md"
  "$ROOT/docs/policies/key-management.md"
  "$ROOT/docs/policies/access-control.md"
)

for doc in "${required_docs[@]}"; do
  if [[ ! -f "$doc" ]]; then
    echo "[tb05] missing required security/compliance doc: $doc"
    exit 1
  fi
done

if ! rg --quiet "MFA required" "$ROOT/docs/policies/access-control.md"; then
  echo "[tb05] access control policy missing MFA requirement"
  exit 1
fi

if ! rg --quiet "RTO: 4 hours" "$ROOT/docs/runbooks/disaster-recovery.md"; then
  echo "[tb05] DR runbook missing RTO target"
  exit 1
fi

if ! rg --quiet "RPO: 15 minutes" "$ROOT/docs/runbooks/disaster-recovery.md"; then
  echo "[tb05] DR runbook missing RPO target"
  exit 1
fi

echo "[tb05] security static checks passed"
