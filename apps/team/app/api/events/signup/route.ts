import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { teamEventSignupSchema } from "@zevlin/contracts";
import { createRequestContext, log } from "@zevlin/observability";
import {
  appendAuditEvent,
  encryptField,
  hashLookup,
  withApiRateLimit,
} from "@zevlin/security";

export async function POST(request: NextRequest) {
  const context = createRequestContext({ app: "team", route: "/api/events/signup" });
  try {
    return await withApiRateLimit(
      request,
      {
        namespace: "team.events.signup",
        max: 6,
        windowMs: 5 * 60_000,
        errorMessage: "Too many signup attempts",
      },
      async () => {
        const body = await request.json();
        const parsed = teamEventSignupSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid signup", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const signupId = randomUUID();
        const encryptedPayload = encryptField(
          JSON.stringify(parsed.data),
          "generic",
        );
        const payloadHash = hashLookup(parsed.data.email.toLowerCase(), "generic");
        const dbRuntime = await import("@zevlin/db");

        await dbRuntime.withDbSessionContext({ system: true }, async (tx) => {
          await tx.insert(dbRuntime.teamEventSignups).values({
            id: signupId,
            eventId: parsed.data.eventId,
            signupEncrypted: JSON.stringify(encryptedPayload),
            signupHash: payloadHash,
          });
        });

        await appendAuditEvent({
          actorId: "public",
          actorRole: "public",
          action: "team.event.signup",
          resourceType: "team_event_signup",
          resourceId: signupId,
          metadata: {
            eventId: parsed.data.eventId,
            signupHash: payloadHash,
            encryptionKeyId: encryptedPayload.keyId,
          },
          requestId: context.requestId,
        });

        return NextResponse.json({
          signupId,
          status: "received",
          message: "Signup received",
        });
      },
    );
  } catch (error) {
    log({
      level: "error",
      message: "Team event signup failed",
      context,
      metadata: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
