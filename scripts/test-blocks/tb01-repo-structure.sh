#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PARENT="$(cd "$ROOT/.." && pwd)"

required_paths=(
  "$ROOT/apps"
  "$ROOT/docs"
  "$ROOT/packages"
  "$ROOT/apps/old_website"
)

for path in "${required_paths[@]}"; do
  if [[ ! -d "$path" ]]; then
    echo "[tb01] missing required directory: $path"
    exit 1
  fi
done

for old in "$PARENT/apps" "$PARENT/docs" "$PARENT/packages"; do
  if [[ -d "$old" ]]; then
    echo "[tb01] unexpected legacy directory still exists: $old"
    exit 1
  fi
done

if [[ -d "$ROOT/apps/old_website/.git" ]]; then
  echo "[tb01] nested .git still exists under apps/old_website"
  exit 1
fi

echo "[tb01] repository structure checks passed"
