import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { contactSubmissionSchema } from "@zevlin/contracts";
import { createRequestContext, log } from "@zevlin/observability";
import { appendAuditEvent, encryptField, hashLookup, withApiRateLimit } from "@zevlin/security";
import { sendIntakeNotification } from "../../../lib/intake";

export async function POST(request: NextRequest): Promise<Response> {
  const context = createRequestContext({ app: "landing", route: "/api/contact" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "landing.contact.submit",
        max: 4,
        windowMs: 10 * 60_000,
        errorMessage: "Too many contact attempts",
      },
      async () => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parsed = contactSubmissionSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid contact submission", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const dbRuntime = await import("@zevlin/db");
        const contactSubmissionsTable = dbRuntime.marketingContactSubmissions;

        const idempotencyKey = request.headers.get("idempotency-key");
        if (idempotencyKey) {
          const reserved = await dbRuntime.reserveIdempotencyKey(
            `landing.contact.submit:${idempotencyKey}`,
            "landing.contact.submit",
          );
          if (!reserved) {
            return NextResponse.json({
              status: "duplicate",
              message: "Submission already processed",
            });
          }
        }

        const submissionId = randomUUID();
        const leadSubmissionId = randomUUID();
        const encryptedSubmission = encryptField(JSON.stringify(parsed.data), "generic");
        const emailHash = hashLookup(parsed.data.email, "generic");

        await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
          await tx.insert(contactSubmissionsTable).values({
            id: submissionId,
            submissionEncrypted: JSON.stringify(encryptedSubmission),
            emailHash,
            status: "new",
          });

          await tx.insert(dbRuntime.leadSubmissions).values({
            id: leadSubmissionId,
            kind: "contact",
            status: "new",
            sourceTable: "marketing_contact_submissions",
            sourceRecordId: submissionId,
            emailHash,
            payloadEncrypted: JSON.stringify(encryptedSubmission),
            metadata: {
              subject: parsed.data.subject,
            },
          });
        });

        const notificationStatus = await sendIntakeNotification(
          {
            kind: "contact",
            submissionId,
            requestId: context.requestId,
            email: parsed.data.email,
            subject: parsed.data.subject,
            message: parsed.data.message,
          },
          context,
        );

        await appendAuditEvent({
          actorId: "public",
          actorRole: "public",
          action: "landing.contact.submit",
          resourceType: "marketing_contact_submission",
          resourceId: submissionId,
          metadata: {
            emailHash,
            leadSubmissionId,
            notificationStatus,
            encryptionKeyId: encryptedSubmission.keyId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({
          status: "received",
          submissionId,
          message: "Thanks, we received your message.",
        });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Landing contact submission failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
