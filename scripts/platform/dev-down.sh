#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STACK_FILE="${STACK_FILE:-$ROOT/ops/coolify/docker-compose.core.yml}"
ENV_FILE="${ENV_FILE:-$ROOT/ops/coolify/.env.compose.local}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[platform-down] docker is required"
  exit 1
fi

if [[ ! -f "$STACK_FILE" ]]; then
  echo "[platform-down] missing stack file: $STACK_FILE"
  exit 1
fi

docker compose --env-file "$ENV_FILE" -f "$STACK_FILE" down

echo "[platform-down] local platform stopped"
