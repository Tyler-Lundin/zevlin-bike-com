import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@zevlin/config";
import { shippoWebhookSchema } from "@zevlin/contracts";
import { recordWebhookEvent } from "@zevlin/db";
import { createRequestContext, log } from "@zevlin/observability";
import {
  appendAuditEvent,
  withApiRateLimit,
} from "@zevlin/security";

function providerEventId(event: string, objectId: string | undefined, data: unknown): string {
  if (objectId) {
    return `${event}:${objectId}`;
  }

  const digest = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  return `${event}:${digest}`;
}

export async function POST(request: NextRequest) {
  const context = createRequestContext({ app: "admin", route: "/api/webhooks/shippo" });
  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "admin.webhooks.shippo",
        max: 60,
        windowMs: 60_000,
        errorMessage: "Too many webhook requests",
      },
      async () => {
        const env = getEnv();
        const configuredSecret = env.SHIPPO_WEBHOOK_SECRET;
        if (!configuredSecret && env.APP_ENV !== "dev") {
          log({
            level: "error",
            message: "Shippo webhook secret is required outside dev",
            context,
            metadata: {
              appEnv: env.APP_ENV,
            },
          });
          return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
        }

        if (configuredSecret) {
          const incomingSecret = request.headers.get("x-shippo-secret");
          if (incomingSecret !== configuredSecret) {
            return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
          }
        }

        const payload = await request.json();
        const parsed = shippoWebhookSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid payload", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const eventId = providerEventId(parsed.data.event, parsed.data.object_id, parsed.data.data);
        const firstSeen = await recordWebhookEvent("shippo", eventId);
        if (!firstSeen) {
          return NextResponse.json({ ok: true, deduped: true });
        }

        await appendAuditEvent({
          actorId: "shippo_webhook",
          actorRole: "system",
          action: `shippo.webhook.${parsed.data.event}`,
          resourceType: "webhook_event",
          resourceId: parsed.data.object_id ?? "unknown",
          metadata: {
            event: parsed.data.event,
            payload: parsed.data.data,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({ ok: true });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Shippo webhook handling failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
