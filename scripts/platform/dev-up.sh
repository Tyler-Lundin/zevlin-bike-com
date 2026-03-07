#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STACK_FILE="${STACK_FILE:-$ROOT/ops/coolify/docker-compose.core.yml}"
ENV_FILE="${ENV_FILE:-$ROOT/ops/coolify/.env.compose.local}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[platform-up] docker is required"
  exit 1
fi

if [[ ! -f "$STACK_FILE" ]]; then
  echo "[platform-up] missing stack file: $STACK_FILE"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[platform-up] missing env file: $ENV_FILE"
  echo "[platform-up] create it from $ROOT/ops/coolify/.env.compose.example"
  exit 1
fi

docker compose --env-file "$ENV_FILE" -f "$STACK_FILE" up -d \
  postgres redis minio authentik-server authentik-worker directus prometheus loki tempo grafana

bash "$ROOT/scripts/platform/health-check.sh"

echo "[platform-up] local platform is up"
