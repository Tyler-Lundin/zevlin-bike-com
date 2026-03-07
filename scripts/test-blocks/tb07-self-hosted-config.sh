#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_EXAMPLE="$ROOT/.env.example"
ENV_SCHEMA="$ROOT/packages/config/src/env.ts"
COMPOSE_FILE="$ROOT/ops/coolify/docker-compose.core.yml"
COMPOSE_ENV_EXAMPLE="$ROOT/ops/coolify/.env.compose.example"
PLAN_DOC="$ROOT/docs/operations/self-hosted-coolify.md"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "[tb07] missing Coolify compose spec: $COMPOSE_FILE"
  exit 1
fi

if [[ ! -f "$PLAN_DOC" ]]; then
  echo "[tb07] missing self-hosted execution doc: $PLAN_DOC"
  exit 1
fi

if [[ ! -f "$COMPOSE_ENV_EXAMPLE" ]]; then
  echo "[tb07] missing compose env example: $COMPOSE_ENV_EXAMPLE"
  exit 1
fi

required_keys=(
  "AUTHENTIK_BASE_URL"
  "AUTHENTIK_CLIENT_ID"
  "AUTHENTIK_CLIENT_SECRET"
  "DIRECTUS_URL"
  "DIRECTUS_TOKEN"
  "MINIO_ENDPOINT"
  "MINIO_ACCESS_KEY"
  "MINIO_SECRET_KEY"
  "MINIO_BUCKET"
  "REDIS_URL"
  "SMTP_HOST"
  "SMTP_PORT"
  "SMTP_USER"
  "SMTP_PASS"
  "SMTP_HTTP_RELAY_URL"
  "DATABASE_URL"
)

for key in "${required_keys[@]}"; do
  if ! rg --quiet "^${key}=" "$ENV_EXAMPLE"; then
    echo "[tb07] missing env key in .env.example: $key"
    exit 1
  fi

  if ! rg --quiet "${key}" "$ENV_SCHEMA"; then
    echo "[tb07] missing env key in config schema: $key"
    exit 1
  fi
done

echo "[tb07] self-hosted config checks passed"
