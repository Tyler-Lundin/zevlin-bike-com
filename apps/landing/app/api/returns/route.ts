import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { returnRequestSchema } from "@zevlin/contracts";
import { createRequestContext, log } from "@zevlin/observability";
import { appendAuditEvent, encryptField, hashLookup, withApiRateLimit } from "@zevlin/security";
import { sendIntakeNotification } from "../../../lib/intake";

export async function POST(request: NextRequest): Promise<Response> {
  const context = createRequestContext({ app: "landing", route: "/api/returns" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "landing.returns.submit",
        max: 4,
        windowMs: 10 * 60_000,
        errorMessage: "Too many return attempts",
      },
      async () => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parsed = returnRequestSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid return request", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const dbRuntime = await import("@zevlin/db");
        const returnRequestsTable = dbRuntime.marketingReturnRequests;

        const idempotencyKey = request.headers.get("idempotency-key");
        if (idempotencyKey) {
          const reserved = await dbRuntime.reserveIdempotencyKey(
            `landing.returns.submit:${idempotencyKey}`,
            "landing.returns.submit",
          );
          if (!reserved) {
            return NextResponse.json({
              status: "duplicate",
              message: "Return request already processed",
            });
          }
        }

        const requestId = randomUUID();
        const leadSubmissionId = randomUUID();
        const normalizedReason = parsed.data.message?.trim() || "customer_request";
        const encryptedPayload = encryptField(JSON.stringify(parsed.data), "generic");
        const emailHash = parsed.data.email ? hashLookup(parsed.data.email, "generic") : null;

        await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
          await tx.insert(returnRequestsTable).values({
            id: requestId,
            orderNumber: parsed.data.orderNumber,
            requestEncrypted: JSON.stringify(encryptedPayload),
            emailHash,
            status: "new",
          });

          await tx.insert(dbRuntime.returnRequests).values({
            id: requestId,
            status: "requested",
            reason: normalizedReason,
            requestEncrypted: JSON.stringify(encryptedPayload),
            emailHash,
            metadata: {
              orderNumber: parsed.data.orderNumber,
              name: parsed.data.name ?? null,
              message: parsed.data.message ?? null,
            },
          });

          await tx.insert(dbRuntime.leadSubmissions).values({
            id: leadSubmissionId,
            kind: "return_request",
            status: "new",
            sourceTable: "marketing_return_requests",
            sourceRecordId: requestId,
            emailHash,
            payloadEncrypted: JSON.stringify(encryptedPayload),
            metadata: {
              orderNumber: parsed.data.orderNumber,
            },
          });
        });

        const notificationStatus = await sendIntakeNotification(
          {
            kind: "returns",
            submissionId: requestId,
            requestId: context.requestId,
            email: parsed.data.email,
            orderNumber: parsed.data.orderNumber,
            message: parsed.data.message,
          },
          context,
        );

        await appendAuditEvent({
          actorId: "public",
          actorRole: "public",
          action: "landing.returns.submit",
          resourceType: "marketing_return_request",
          resourceId: requestId,
          metadata: {
            orderNumber: parsed.data.orderNumber,
            emailHash,
            leadSubmissionId,
            notificationStatus,
            encryptionKeyId: encryptedPayload.keyId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({
          status: "received",
          requestId,
          message: "Return request submitted.",
        });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Landing return request submission failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
