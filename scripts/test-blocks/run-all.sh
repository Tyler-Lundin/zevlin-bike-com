#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

"$ROOT/scripts/test-blocks/tb01-repo-structure.sh"
"$ROOT/scripts/test-blocks/tb02-public-apis.sh"
"$ROOT/scripts/test-blocks/tb03-db-security.sh"
"$ROOT/scripts/test-blocks/tb05-security-static.sh"
"$ROOT/scripts/test-blocks/tb06-api-surfaces.sh"
"$ROOT/scripts/test-blocks/tb07-self-hosted-config.sh"

echo "[test-blocks] completed static blocks (1,2,3,5,6,7)"
echo "[test-blocks] block 4 is runtime-only and must be run separately with BASE_URL"
echo "[test-blocks] block 9 is runtime-only and should be run separately (pnpm test:block:9)"
