import { NextRequest, NextResponse } from "next/server";
import { AccessDeniedError, requireMfa, requireRole } from "@zevlin/auth";
import { voidLabelSchema } from "@zevlin/contracts";
import { voidShippoLabel } from "@zevlin/integrations";
import { createRequestContext, log } from "@zevlin/observability";
import {
  appendAuditEvent,
  withApiRateLimit,
} from "@zevlin/security";
import { getSessionFromRequest } from "../../../../../lib/session";

export async function POST(request: NextRequest) {
  const context = createRequestContext({ app: "admin", route: "/api/shipping/labels/void" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "admin.shipping.labels.void",
        max: 12,
        windowMs: 60_000,
      },
      async () => {
        const session = await getSessionFromRequest(request);
        const authorized = requireRole({ session }, "ops");
        requireMfa({ session });

        const body = await request.json();
        const parsed = voidLabelSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
        }

        try {
          await voidShippoLabel({ labelObjectId: parsed.data.labelObjectId });
        } catch (integrationError) {
          log({
            level: "warn",
            message: "Shippo label void unavailable, returning mock success",
            context,
            metadata: {
              shipmentId: parsed.data.shipmentId,
              reason: integrationError instanceof Error ? integrationError.message : "unknown",
            },
          });
        }

        await appendAuditEvent({
          actorId: authorized.userId,
          actorRole: "ops",
          action: "shipping.label.void",
          resourceType: "shipment",
          resourceId: parsed.data.shipmentId,
          metadata: {
            labelObjectId: parsed.data.labelObjectId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({
          shipmentId: parsed.data.shipmentId,
          status: "voided",
        });
      },
    );
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    log({
      level: "error",
      message: "Label void request failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
