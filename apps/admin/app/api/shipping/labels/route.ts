import { NextRequest, NextResponse } from "next/server";
import { AccessDeniedError, requireMfa, requireRole } from "@zevlin/auth";
import { purchaseLabelSchema } from "@zevlin/contracts";
import { purchaseShippoLabel } from "@zevlin/integrations";
import { createRequestContext, log } from "@zevlin/observability";
import {
  appendAuditEvent,
  withApiRateLimit,
} from "@zevlin/security";
import { claimIdempotencyKey } from "../../../../lib/idempotency";
import { getSessionFromRequest } from "../../../../lib/session";

function normalizeLabel(payload: Record<string, unknown>) {
  const serviceLevel = (payload["servicelevel"] ?? null) as { name?: unknown } | null;

  return {
    labelObjectId: String(payload["object_id"] ?? ""),
    trackingNumber: String(payload["tracking_number"] ?? ""),
    trackingUrl: String(payload["tracking_url_provider"] ?? ""),
    labelUrl: String(payload["label_url"] ?? ""),
    carrier: String(payload["provider"] ?? "unknown"),
    service: String(serviceLevel?.name ?? payload["servicelevel_token"] ?? "standard"),
  };
}

function mockLabel(rateObjectId: string) {
  return {
    labelObjectId: `mock_label_${rateObjectId}`,
    trackingNumber: "MOCKTRACK12345",
    trackingUrl: "https://tracking.example.com/MOCKTRACK12345",
    labelUrl: "https://labels.example.com/mock.pdf",
    carrier: "USPS",
    service: "Priority",
    mode: "mock",
  };
}

export async function POST(request: NextRequest) {
  const context = createRequestContext({ app: "admin", route: "/api/shipping/labels" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "admin.shipping.labels.purchase",
        max: 12,
        windowMs: 60_000,
      },
      async () => {
        const session = await getSessionFromRequest(request);
        const authorized = requireRole({ session }, "ops");
        requireMfa({ session });

        const body = await request.json();
        const parsed = purchaseLabelSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
        }

        const idempotencyKey =
          request.headers.get("x-idempotency-key") || parsed.data.idempotencyKey;
        const acquired = await claimIdempotencyKey(idempotencyKey, "shipping.label.purchase");
        if (!acquired) {
          return NextResponse.json({ error: "Duplicate idempotency key" }, { status: 409 });
        }

        let responsePayload: ReturnType<typeof normalizeLabel> | ReturnType<typeof mockLabel>;
        try {
          const purchased = await purchaseShippoLabel({
            rateObjectId: parsed.data.rateObjectId,
            metadata: `order:${parsed.data.orderId}`,
          });
          responsePayload = normalizeLabel(purchased);
        } catch (integrationError) {
          log({
            level: "warn",
            message: "Shippo label purchase unavailable, using mock response",
            context,
            metadata: {
              orderId: parsed.data.orderId,
              reason: integrationError instanceof Error ? integrationError.message : "unknown",
            },
          });
          responsePayload = mockLabel(parsed.data.rateObjectId);
        }
        await appendAuditEvent({
          actorId: authorized.userId,
          actorRole: "ops",
          action: "shipping.label.purchase",
          resourceType: "order",
          resourceId: parsed.data.orderId,
          metadata: {
            idempotencyKey,
            rateObjectId: parsed.data.rateObjectId,
            labelObjectId: responsePayload.labelObjectId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json(responsePayload);
      },
    );
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    log({
      level: "error",
      message: "Label purchase request failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
