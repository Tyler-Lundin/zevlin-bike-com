import "server-only";

import { smtpMailer } from "@zevlin/integrations";
import type { RequestContext } from "@zevlin/observability";
import { log } from "@zevlin/observability";

type IntakeKind = "newsletter" | "contact" | "returns" | "privacy";

type IntakeNotificationInput = {
  kind: IntakeKind;
  submissionId: string;
  requestId: string;
  email?: string;
  subject?: string;
  orderNumber?: string;
  source?: string;
  requestType?: string;
  jurisdiction?: string;
  message?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveIntakeMailbox(): string {
  const configured = process.env.LANDING_INTAKE_EMAIL?.trim();
  if (configured) {
    return configured;
  }

  return "zevlinbike@gmail.com";
}

export async function sendIntakeNotification(
  input: IntakeNotificationInput,
  context: RequestContext,
): Promise<"sent" | "failed"> {
  const intakeMailbox = resolveIntakeMailbox();
  const title =
    input.kind === "newsletter"
      ? "Newsletter Signup"
      : input.kind === "contact"
        ? "Contact Submission"
        : input.kind === "returns"
          ? "Return Request"
          : "Privacy Rights Request";

  const details: string[] = [
    `Submission ID: ${input.submissionId}`,
    `Request ID: ${input.requestId}`,
    `Kind: ${input.kind}`,
  ];

  if (input.email) {
    details.push(`Email: ${input.email}`);
  }
  if (input.subject) {
    details.push(`Subject: ${input.subject}`);
  }
  if (input.orderNumber) {
    details.push(`Order Number: ${input.orderNumber}`);
  }
  if (input.source) {
    details.push(`Source: ${input.source}`);
  }
  if (input.requestType) {
    details.push(`Request Type: ${input.requestType}`);
  }
  if (input.jurisdiction) {
    details.push(`Jurisdiction: ${input.jurisdiction}`);
  }
  if (input.message) {
    details.push(`Message: ${input.message}`);
  }

  const textBody = details.join("\n");
  const htmlBody = `
    <h2>${escapeHtml(title)}</h2>
    <ul>
      ${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
    </ul>
  `;

  try {
    await smtpMailer.send({
      to: [{ email: intakeMailbox, name: "Zevlin Intake" }],
      subject: `Landing Intake: ${title} (${input.submissionId})`,
      htmlContent: htmlBody,
      textContent: textBody,
    });
    return "sent";
  } catch (error) {
    log({
      level: "warn",
      message: "Landing intake notification failed",
      context,
      metadata: {
        intakeKind: input.kind,
        submissionId: input.submissionId,
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });
    return "failed";
  }
}
