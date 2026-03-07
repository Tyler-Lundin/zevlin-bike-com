import Link from "next/link";
import type { Metadata } from "next";
import { getLandingContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy | Zevlin Bike",
  description: "Zevlin Bike customer privacy policy and support contact details.",
  alternates: {
    canonical: "/privacy",
  },
};

export default async function PrivacyPage() {
  const content = await getLandingContent();

  return (
    <section className="section-block panel">
      <p className="section-kicker">Policy</p>
      <h1>{content.privacy.title}</h1>
      <p className="subnote">Last updated {content.privacy.updatedAt}</p>
      {content.privacy.summary.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p>
        Questions: <a href={`mailto:${content.privacy.contactEmail}`}>{content.privacy.contactEmail}</a>
      </p>
      <p>
        Need to exercise your privacy rights? <Link href="/privacy/request">Submit a privacy request</Link>
      </p>
      <p>
        <Link href="/">Back to landing page</Link>
      </p>
    </section>
  );
}
