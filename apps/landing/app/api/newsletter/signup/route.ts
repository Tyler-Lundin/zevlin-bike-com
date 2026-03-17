import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { newsletterSignupSchema } from "@zevlin/contracts";
import { createRequestContext, log } from "@zevlin/observability";
import { appendAuditEvent, encryptField, hashLookup, withApiRateLimit } from "@zevlin/security";
import { sendIntakeNotification } from "../../../../lib/intake";

export async function POST(request: NextRequest): Promise<Response> {
  const context = createRequestContext({ app: "landing", route: "/api/newsletter/signup" });

  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "landing.newsletter.signup",
        max: 5,
        windowMs: 10 * 60_000,
        errorMessage: "Too many newsletter attempts",
      },
      async () => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parsed = newsletterSignupSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid signup request", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const dbRuntime = await import("@zevlin/db");
        const newsletterTable = dbRuntime.marketingNewsletterSignups;

        const idempotencyKey = request.headers.get("idempotency-key");
        if (idempotencyKey) {
          const reserved = await dbRuntime.reserveIdempotencyKey(
            `landing.newsletter.signup:${idempotencyKey}`,
            "landing.newsletter.signup",
          );
          if (!reserved) {
            return NextResponse.json({
              status: "duplicate",
              message: "Signup already processed",
            });
          }
        }

        const emailHash = hashLookup(parsed.data.email, "generic");
        const encryptedEmail = encryptField(parsed.data.email, "generic");

        const inserted = await dbRuntime.withDbSessionContext({ system: true }, async (tx) =>
          tx
            .insert(newsletterTable)
            .values({
              emailEncrypted: JSON.stringify(encryptedEmail),
              emailHash,
              source: parsed.data.source ?? "landing-home",
            })
            .onConflictDoNothing({ target: newsletterTable.emailHash })
            .returning({ id: newsletterTable.id }),
        );

        const created = inserted.length > 0;
        const signupId = inserted[0]?.id ?? randomUUID();
        const leadSubmissionId = created ? randomUUID() : null;

        await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
          if (created && leadSubmissionId) {
            await tx.insert(dbRuntime.leadSubmissions).values({
              id: leadSubmissionId,
              kind: "newsletter",
              status: "new",
              sourceTable: "marketing_newsletter_signups",
              sourceRecordId: signupId,
              emailHash,
              payloadEncrypted: JSON.stringify(encryptedEmail),
              metadata: {
                source: parsed.data.source ?? "landing-home",
              },
            });
          }

          await tx
            .insert(dbRuntime.marketingConsents)
            .values({
              emailHash,
              leadSubmissionId,
              consentType: "newsletter_email",
              granted: true,
              source: parsed.data.source ?? "landing-home",
              metadata: {
                intakeRoute: "/api/newsletter/signup",
              },
            })
            .onConflictDoUpdate({
              target: [
                dbRuntime.marketingConsents.emailHash,
                dbRuntime.marketingConsents.consentType,
              ],
              set: {
                granted: true,
                source: parsed.data.source ?? "landing-home",
                leadSubmissionId,
                revokedAt: null,
                updatedAt: new Date(),
              },
            });
        });

        const notificationStatus = created
          ? await sendIntakeNotification(
              {
                kind: "newsletter",
                submissionId: signupId,
                requestId: context.requestId,
                email: parsed.data.email,
                source: parsed.data.source ?? "landing-home",
              },
              context,
            )
          : "skipped";

        await appendAuditEvent({
          actorId: "public",
          actorRole: "public",
          action: created ? "landing.newsletter.signup" : "landing.newsletter.duplicate",
          resourceType: "marketing_newsletter_signup",
          resourceId: signupId,
          metadata: {
            created,
            source: parsed.data.source ?? "landing-home",
            emailHash,
            notificationStatus,
            leadSubmissionId,
            encryptionKeyId: encryptedEmail.keyId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({
          status: created ? "created" : "existing",
          signupId,
          message: created ? "Thanks for signing up!" : "You are already signed up.",
        });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Landing newsletter signup failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
