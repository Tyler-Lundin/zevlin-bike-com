#!/usr/bin/env bash
set -euo pipefail

echo "[security] starting security checks"

if command -v pnpm >/dev/null 2>&1; then
  echo "[security] running dependency audit (best effort)"
  if ! pnpm audit --prod --audit-level high; then
    echo "[security] audit could not complete or found issues (network failures are non-fatal in local mode)"
  fi
else
  echo "[security] pnpm not found; skipping audit"
fi

if command -v rg >/dev/null 2>&1; then
  echo "[security] scanning for obvious committed secrets"
  matches="$({
    rg --line-number --hidden \
      --glob '!**/node_modules/**' \
      --glob '!.git/**' \
      --glob '!scripts/security-check.sh' \
      '(AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----|xox[baprs]-|sk_live_)' .
  } || true)"

  if [[ -n "$matches" ]]; then
    echo "$matches"
    echo "[security] potential secret pattern found"
    exit 1
  fi
else
  echo "[security] rg not found; skipping secret regex scan"
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "[security] running static testing blocks"
  pnpm test:blocks
fi

echo "[security] completed"
