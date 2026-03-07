#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

required_routes=(
  "$ROOT/apps/store/app/api/health/route.ts"
  "$ROOT/apps/store/app/api/checkout/session/route.ts"
  "$ROOT/apps/landing/app/api/health/route.ts"
  "$ROOT/apps/landing/app/api/newsletter/signup/route.ts"
  "$ROOT/apps/landing/app/api/contact/route.ts"
  "$ROOT/apps/landing/app/api/returns/route.ts"
  "$ROOT/apps/landing/app/api/analytics/event/route.ts"
  "$ROOT/apps/landing/app/api/privacy/request/route.ts"
  "$ROOT/apps/admin/app/api/health/route.ts"
  "$ROOT/apps/admin/app/api/shipping/rates/route.ts"
  "$ROOT/apps/admin/app/api/shipping/labels/route.ts"
  "$ROOT/apps/admin/app/api/shipping/labels/void/route.ts"
  "$ROOT/apps/admin/app/api/webhooks/shippo/route.ts"
  "$ROOT/apps/b2b/app/api/applications/route.ts"
  "$ROOT/apps/team/app/api/events/signup/route.ts"
)

for route in "${required_routes[@]}"; do
  if [[ ! -f "$route" ]]; then
    echo "[tb06] missing route: $route"
    exit 1
  fi
done

if ! rg --quiet "purchaseLabelSchema" "$ROOT/apps/admin/app/api/shipping/labels/route.ts"; then
  echo "[tb06] labels route missing purchaseLabelSchema validation"
  exit 1
fi

if ! rg --quiet "voidLabelSchema" "$ROOT/apps/admin/app/api/shipping/labels/void/route.ts"; then
  echo "[tb06] void labels route missing voidLabelSchema validation"
  exit 1
fi

if ! rg --quiet "shippoWebhookSchema" "$ROOT/apps/admin/app/api/webhooks/shippo/route.ts"; then
  echo "[tb06] webhook route missing shippoWebhookSchema validation"
  exit 1
fi

if ! rg --quiet "claimIdempotencyKey" "$ROOT/apps/admin/app/api/shipping/labels/route.ts"; then
  echo "[tb06] labels route missing durable idempotency claim call"
  exit 1
fi

if ! rg --quiet "recordWebhookEvent" "$ROOT/apps/admin/app/api/webhooks/shippo/route.ts"; then
  echo "[tb06] webhook route missing durable webhook dedupe persistence"
  exit 1
fi

if ! rg --quiet "newsletterSignupSchema" "$ROOT/apps/landing/app/api/newsletter/signup/route.ts"; then
  echo "[tb06] landing newsletter route missing schema validation"
  exit 1
fi

if ! rg --quiet "contactSubmissionSchema" "$ROOT/apps/landing/app/api/contact/route.ts"; then
  echo "[tb06] landing contact route missing schema validation"
  exit 1
fi

if ! rg --quiet "returnRequestSchema" "$ROOT/apps/landing/app/api/returns/route.ts"; then
  echo "[tb06] landing returns route missing schema validation"
  exit 1
fi

if ! rg --quiet "analyticsEventSchema" "$ROOT/apps/landing/app/api/analytics/event/route.ts"; then
  echo "[tb06] landing analytics route missing schema validation"
  exit 1
fi

if ! rg --quiet "privacyRequestSchema" "$ROOT/apps/landing/app/api/privacy/request/route.ts"; then
  echo "[tb06] landing privacy route missing schema validation"
  exit 1
fi

protected_rate_limited_routes=(
  "$ROOT/apps/store/app/api/checkout/session/route.ts"
  "$ROOT/apps/landing/app/api/newsletter/signup/route.ts"
  "$ROOT/apps/landing/app/api/contact/route.ts"
  "$ROOT/apps/landing/app/api/returns/route.ts"
  "$ROOT/apps/landing/app/api/analytics/event/route.ts"
  "$ROOT/apps/landing/app/api/privacy/request/route.ts"
  "$ROOT/apps/b2b/app/api/applications/route.ts"
  "$ROOT/apps/team/app/api/events/signup/route.ts"
  "$ROOT/apps/admin/app/api/shipping/rates/route.ts"
  "$ROOT/apps/admin/app/api/shipping/labels/route.ts"
  "$ROOT/apps/admin/app/api/shipping/labels/void/route.ts"
  "$ROOT/apps/admin/app/api/webhooks/shippo/route.ts"
)

for route in "${protected_rate_limited_routes[@]}"; do
  if ! rg --quiet "withApiRateLimit" "$route"; then
    echo "[tb06] protected route missing central rate-limit wrapper: $route"
    exit 1
  fi
done

echo "[tb06] API surface checks passed"
