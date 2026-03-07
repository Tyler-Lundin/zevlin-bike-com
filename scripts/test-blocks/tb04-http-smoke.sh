#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${STORE_BASE_URL:-}" ]]; then
  echo "[tb04] STORE_BASE_URL is required, e.g. STORE_BASE_URL=http://localhost:3002"
  exit 1
fi

check_code() {
  local url="$1"
  local expected="$2"

  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url")"
  if [[ "$code" != "$expected" ]]; then
    echo "[tb04] expected $expected from $url, got $code"
    exit 1
  fi
}

check_code "$STORE_BASE_URL/api/health" "200"

echo "[tb04] store health endpoint passed"

if [[ -n "${ADMIN_BASE_URL:-}" ]]; then
  check_code "$ADMIN_BASE_URL/api/health" "200"

  response_file="$(mktemp)"
  if [[ -n "${ADMIN_ACCESS_TOKEN:-}" ]]; then
    status="$(curl -s -o "$response_file" -w "%{http_code}" \
      -X POST "$ADMIN_BASE_URL/api/shipping/rates" \
      -H 'content-type: application/json' \
      -H "authorization: Bearer ${ADMIN_ACCESS_TOKEN}" \
      --data '{"orderId":"11111111-1111-1111-1111-111111111111"}')"
  else
    status="$(curl -s -o "$response_file" -w "%{http_code}" \
      -X POST "$ADMIN_BASE_URL/api/shipping/rates" \
      -H 'content-type: application/json' \
      -H 'x-zevlin-user-id: 11111111-1111-1111-1111-111111111111' \
      -H 'x-zevlin-customer-id: 11111111-1111-1111-1111-111111111111' \
      -H 'x-zevlin-roles: ops' \
      -H 'x-zevlin-mfa: true' \
      --data '{"orderId":"11111111-1111-1111-1111-111111111111"}')"
  fi

  if [[ "$status" != "200" ]]; then
    echo "[tb04] expected 200 from admin shipping rates, got $status"
    cat "$response_file"
    rm -f "$response_file"
    exit 1
  fi

  if ! rg --quiet '"rates"' "$response_file"; then
    echo "[tb04] admin shipping rates response missing rates payload"
    cat "$response_file"
    rm -f "$response_file"
    exit 1
  fi

  rm -f "$response_file"
  echo "[tb04] admin health + shipping rates endpoints passed"
fi

echo "[tb04] HTTP smoke checks passed"
