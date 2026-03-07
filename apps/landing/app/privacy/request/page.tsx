import Link from "next/link";
import type { Metadata } from "next";
import PrivacyRequestForm from "../../../components/forms/PrivacyRequestForm";
import { getLandingContent } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Privacy Rights Request | Zevlin Bike",
  description:
    "Submit data access, deletion, correction, or portability requests to Zevlin Bike privacy support.",
  alternates: {
    canonical: "/privacy/request",
  },
};

export default async function PrivacyRequestPage() {
  const content = await getLandingContent();

  return (
    <section className="section-block panel">
      <p className="section-kicker">Privacy Rights</p>
      <h1>Submit a Privacy Request</h1>
      <p className="subtitle">
        Use this form to request access, correction, deletion, portability, or do-not-sell controls for
        your personal information.
      </p>

      <ul>
        <li>Requests are reviewed by support and compliance teams.</li>
        <li>Identity verification may be required before fulfillment.</li>
        <li>Regulated response windows depend on your jurisdiction.</li>
      </ul>

      <PrivacyRequestForm />

      <p>
        Need direct help? Email <a href={`mailto:${content.privacy.contactEmail}`}>{content.privacy.contactEmail}</a>
      </p>
      <p>
        <Link href="/privacy">Back to privacy policy</Link>
      </p>
    </section>
  );
}
