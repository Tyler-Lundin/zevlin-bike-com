#!/usr/bin/env bash
set -euo pipefail

# Runtime health checks for the local self-hosted stack.

AUTHENTIK_HEALTH_URL="${AUTHENTIK_HEALTH_URL:-http://localhost:9002/-/health/live}"
DIRECTUS_HEALTH_URL="${DIRECTUS_HEALTH_URL:-http://localhost:8055/server/health}"
MINIO_HEALTH_URL="${MINIO_HEALTH_URL:-http://localhost:9000/minio/health/live}"
GRAFANA_HEALTH_URL="${GRAFANA_HEALTH_URL:-http://localhost:3000/api/health}"
LOKI_HEALTH_URL="${LOKI_HEALTH_URL:-http://localhost:3100/ready}"
PROMETHEUS_HEALTH_URL="${PROMETHEUS_HEALTH_URL:-http://localhost:9090/-/ready}"
TEMPO_HEALTH_URL="${TEMPO_HEALTH_URL:-http://localhost:3200/ready}"

POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

check_http() {
  local url="$1"
  local label="$2"
  local code

  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ "$code" != "200" && "$code" != "204" ]]; then
    echo "[platform-health] ${label} failed: ${url} returned ${code}"
    exit 1
  fi

  echo "[platform-health] ${label} ok (${code})"
}

check_tcp() {
  local host="$1"
  local port="$2"
  local label="$3"

  if ! nc -z "$host" "$port" >/dev/null 2>&1; then
    echo "[platform-health] ${label} failed: ${host}:${port} not reachable"
    exit 1
  fi

  echo "[platform-health] ${label} ok (${host}:${port})"
}

if ! command -v curl >/dev/null 2>&1; then
  echo "[platform-health] curl is required"
  exit 1
fi

if ! command -v nc >/dev/null 2>&1; then
  echo "[platform-health] nc is required"
  exit 1
fi

check_tcp "$POSTGRES_HOST" "$POSTGRES_PORT" "postgres"
check_tcp "$REDIS_HOST" "$REDIS_PORT" "redis"

check_http "$AUTHENTIK_HEALTH_URL" "authentik"
check_http "$DIRECTUS_HEALTH_URL" "directus"
check_http "$MINIO_HEALTH_URL" "minio"
check_http "$GRAFANA_HEALTH_URL" "grafana"
check_http "$LOKI_HEALTH_URL" "loki"
check_http "$PROMETHEUS_HEALTH_URL" "prometheus"
check_http "$TEMPO_HEALTH_URL" "tempo"

echo "[platform-health] all checks passed"
