import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { b2bApplicationSchema } from "@zevlin/contracts";
import { createRequestContext, log } from "@zevlin/observability";
import {
  appendAuditEvent,
  encryptField,
  hashLookup,
  withApiRateLimit,
} from "@zevlin/security";

export async function POST(request: NextRequest) {
  const context = createRequestContext({ app: "b2b", route: "/api/applications" });
  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "b2b.applications.create",
        max: 5,
        windowMs: 10 * 60_000,
        errorMessage: "Too many submissions",
      },
      async () => {
        const body = await request.json();
        const parsed = b2bApplicationSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid application", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const applicationId = randomUUID();
        const encryptedPayload = encryptField(
          JSON.stringify(parsed.data),
          "b2b_contact",
        );
        const payloadHash = hashLookup(parsed.data.contactEmail.toLowerCase(), "b2b_contact");
        const dbRuntime = await import("@zevlin/db");

        await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
          await tx.insert(dbRuntime.b2bApplications).values({
            id: applicationId,
            submittedByCustomerId: null,
            status: "submitted",
            applicationEncrypted: JSON.stringify(encryptedPayload),
            applicationHash: payloadHash,
          });
        });

        await appendAuditEvent({
          actorId: "public",
          actorRole: "public",
          action: "b2b.application.submit",
          resourceType: "b2b_application",
          resourceId: applicationId,
          metadata: {
            applicationHash: payloadHash,
            encryptionKeyId: encryptedPayload.keyId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({
          applicationId,
          status: "submitted",
          message: "Application received for admin review",
        });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "B2B application submission failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
