import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { privacyRequestSchema } from "@zevlin/contracts";
import { createRequestContext, log } from "@zevlin/observability";
import { appendAuditEvent, encryptField, hashLookup, withApiRateLimit } from "@zevlin/security";
import { sendIntakeNotification } from "../../../../lib/intake";

export async function POST(request: NextRequest): Promise<Response> {
  const context = createRequestContext({ app: "landing", route: "/api/privacy/request" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "landing.privacy.request",
        max: 3,
        windowMs: 10 * 60_000,
        errorMessage: "Too many privacy request attempts",
      },
      async () => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parsed = privacyRequestSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid privacy request", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        if (parsed.data.website) {
          return NextResponse.json({ status: "accepted", message: "Request received." }, { status: 202 });
        }

        const dbRuntime = await import("@zevlin/db");
        const privacyRequestsTable = dbRuntime.marketingPrivacyRequests;

        const idempotencyKey = request.headers.get("idempotency-key");
        if (idempotencyKey) {
          const reserved = await dbRuntime.reserveIdempotencyKey(
            `landing.privacy.request:${idempotencyKey}`,
            "landing.privacy.request",
          );
          if (!reserved) {
            return NextResponse.json({
              status: "duplicate",
              message: "Privacy request already processed",
            });
          }
        }

        const requestId = randomUUID();
        const encryptedPayload = encryptField(
          JSON.stringify({
            requestType: parsed.data.requestType,
            name: parsed.data.name,
            email: parsed.data.email,
            jurisdiction: parsed.data.jurisdiction,
            message: parsed.data.message,
            source: parsed.data.source,
            consent: parsed.data.consent,
          }),
          "generic",
        );
        const emailHash = hashLookup(parsed.data.email, "generic");

        await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
          await tx.insert(privacyRequestsTable).values({
            id: requestId,
            requestType: parsed.data.requestType,
            requestEncrypted: JSON.stringify(encryptedPayload),
            emailHash,
            status: "new",
          });
        });

        const notificationStatus = await sendIntakeNotification(
          {
            kind: "privacy",
            submissionId: requestId,
            requestId: context.requestId,
            email: parsed.data.email,
            requestType: parsed.data.requestType,
            jurisdiction: parsed.data.jurisdiction,
            source: parsed.data.source,
            message: parsed.data.message,
          },
          context,
        );

        await appendAuditEvent({
          actorId: "public",
          actorRole: "public",
          action: "landing.privacy.request",
          resourceType: "marketing_privacy_request",
          resourceId: requestId,
          metadata: {
            requestType: parsed.data.requestType,
            jurisdiction: parsed.data.jurisdiction ?? null,
            source: parsed.data.source ?? "landing-privacy",
            emailHash,
            notificationStatus,
            encryptionKeyId: encryptedPayload.keyId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({
          status: "received",
          requestId,
          message: "Privacy request submitted. Our team will follow up by email.",
        });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Landing privacy request submission failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
