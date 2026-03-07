import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { analyticsEventSchema } from "@zevlin/contracts";
import { createRequestContext, log } from "@zevlin/observability";
import { appendAuditEvent, withApiRateLimit } from "@zevlin/security";

export async function POST(request: NextRequest): Promise<Response> {
  const context = createRequestContext({ app: "landing", route: "/api/analytics/event" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "landing.analytics.event",
        max: 120,
        windowMs: 60_000,
        errorMessage: "Too many analytics events",
      },
      async () => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parsed = analyticsEventSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid analytics event", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const analyticsId = randomUUID();
        await appendAuditEvent({
          actorId: "public",
          actorRole: "public",
          action: "landing.analytics.event",
          resourceType: "analytics_event",
          resourceId: analyticsId,
          metadata: {
            eventName: parsed.data.eventName,
            pagePath: parsed.data.pagePath ?? null,
            channel: parsed.data.channel,
            payload: parsed.data.metadata ?? {},
          },
          requestId: context.requestId,
        });

        return NextResponse.json({ status: "accepted", analyticsId }, { status: 202 });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Landing analytics event ingestion failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
