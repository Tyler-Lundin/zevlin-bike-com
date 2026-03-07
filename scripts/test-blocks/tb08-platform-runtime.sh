#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

bash "$ROOT/scripts/platform/health-check.sh"

echo "[tb08] runtime platform health checks passed"
