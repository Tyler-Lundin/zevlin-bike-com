#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP_DIR="$(mktemp -d)"
CURRENT_PID=""
CURRENT_LOG=""

cleanup() {
  if [[ -n "${CURRENT_PID}" ]]; then
    kill "${CURRENT_PID}" >/dev/null 2>&1 || true
    wait "${CURRENT_PID}" >/dev/null 2>&1 || true
  fi

  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

wait_for_health() {
  local port="$1"
  local log_file="$2"
  local health_url="http://127.0.0.1:${port}/api/health"

  for _ in $(seq 1 90); do
    if curl -fsS "${health_url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "[tb09] app did not become healthy on port ${port}"
  echo "[tb09] last logs:"
  tail -n 80 "${log_file}" || true
  exit 1
}

find_free_port() {
  local preferred="$1"
  local port="${preferred}"

  while lsof -n -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; do
    port=$((port + 1))
  done

  echo "${port}"
}

start_app() {
  local app_filter="$1"
  local port="$2"
  local safe_name
  safe_name="$(echo "${app_filter}" | tr '@/ ' '__-')"
  local log_file="${TMP_DIR}/${safe_name}.log"

  (
    cd "${ROOT}" && \
      APP_ENV=dev \
      ENFORCE_SELF_HOSTED_REQUIRED=false \
      DATABASE_URL="postgres://localhost:5432/zevlin" \
      pnpm --filter "${app_filter}" exec next dev --port "${port}" >"${log_file}" 2>&1
  ) &

  CURRENT_PID="$!"
  CURRENT_LOG="${log_file}"
  wait_for_health "${port}" "${log_file}"
}

stop_app() {
  if [[ -n "${CURRENT_PID}" ]]; then
    kill "${CURRENT_PID}" >/dev/null 2>&1 || true
    wait "${CURRENT_PID}" >/dev/null 2>&1 || true
    CURRENT_PID=""
    CURRENT_LOG=""
  fi
}

assert_rate_limit_headers() {
  local headers_file="$1"
  local route_label="$2"

  local required_headers=(
    "x-ratelimit-limit"
    "x-ratelimit-remaining"
    "x-ratelimit-reset"
    "retry-after"
    "x-ratelimit-backend"
  )

  for header in "${required_headers[@]}"; do
    if ! grep -qi "^${header}:" "${headers_file}"; then
      echo "[tb09] ${route_label} missing rate-limit header: ${header}"
      cat "${headers_file}"
      exit 1
    fi
  done
}

exercise_limit() {
  local route_label="$1"
  local url="$2"
  local attempts="$3"
  local payload="$4"
  shift 4
  local extra_headers=("$@")

  local first_status=""
  local last_status=""

  for attempt in $(seq 1 "${attempts}"); do
    local headers_out="${TMP_DIR}/headers-${route_label// /-}.txt"
    local body_out="${TMP_DIR}/body-${route_label// /-}.txt"
    local curl_args=(
      -sS
      -o "${body_out}"
      -D "${headers_out}"
      -w "%{http_code}"
      -X POST "${url}"
      -H "content-type: application/json"
    )

    if (( ${#extra_headers[@]} > 0 )); then
      curl_args+=("${extra_headers[@]}")
    fi

    curl_args+=(--data "${payload}")

    local status
    status="$(curl "${curl_args[@]}")"

    if [[ -z "${first_status}" ]]; then
      first_status="${status}"
    fi
    last_status="${status}"
  done

  if [[ "${first_status}" == "429" ]]; then
    echo "[tb09] ${route_label} was rate-limited on the first request"
    exit 1
  fi

  if [[ "${last_status}" != "429" ]]; then
    echo "[tb09] ${route_label} expected 429 on attempt ${attempts}, got ${last_status}"
    echo "[tb09] last response body:"
    cat "${TMP_DIR}/body-${route_label// /-}.txt" || true
    echo "[tb09] last response headers:"
    cat "${TMP_DIR}/headers-${route_label// /-}.txt" || true
    exit 1
  fi

  assert_rate_limit_headers "${TMP_DIR}/headers-${route_label// /-}.txt" "${route_label}"
  echo "[tb09] ${route_label} returned 429 with rate-limit headers"
}

echo "[tb09] validating abuse protections (429 + headers) on protected routes"

store_port="$(find_free_port 3002)"
start_app "@zevlin/store" "${store_port}"
exercise_limit "store-checkout" "http://127.0.0.1:${store_port}/api/checkout/session" "9" "{}"
stop_app

b2b_port="$(find_free_port 3005)"
start_app "@zevlin/b2b" "${b2b_port}"
exercise_limit "b2b-applications" "http://127.0.0.1:${b2b_port}/api/applications" "6" "{}"
stop_app

team_port="$(find_free_port 3006)"
start_app "@zevlin/team" "${team_port}"
exercise_limit "team-event-signup" "http://127.0.0.1:${team_port}/api/events/signup" "7" "{}"
stop_app

admin_port="$(find_free_port 3003)"
start_app "@zevlin/admin" "${admin_port}"
admin_headers=(
  -H "x-zevlin-user-id: abuse-tester"
  -H "x-zevlin-roles: ops"
  -H "x-zevlin-mfa: true"
)

exercise_limit "admin-shipping-rates" "http://127.0.0.1:${admin_port}/api/shipping/rates" "25" "{}" "${admin_headers[@]}"
exercise_limit "admin-shipping-labels-purchase" "http://127.0.0.1:${admin_port}/api/shipping/labels" "13" "{}" "${admin_headers[@]}"
exercise_limit "admin-shipping-labels-void" "http://127.0.0.1:${admin_port}/api/shipping/labels/void" "13" "{}" "${admin_headers[@]}"
exercise_limit "admin-shippo-webhook" "http://127.0.0.1:${admin_port}/api/webhooks/shippo" "61" "{}"
stop_app

echo "[tb09] abuse checks passed"
