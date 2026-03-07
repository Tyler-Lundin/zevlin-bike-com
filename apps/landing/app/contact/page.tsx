import Link from "next/link";
import type { Metadata } from "next";
import ContactSubmissionForm from "../../components/forms/ContactSubmissionForm";
import { getLandingContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Contact Zevlin Bike",
  description: "Send a direct support request to Zevlin Bike.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const content = await getLandingContent();

  return (
    <section className="section-block panel">
      <p className="section-kicker">Support</p>
      <h1>Contact Zevlin Bike</h1>
      <p className="subtitle">{content.contact.summary}</p>
      <p>
        Prefer email? <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
      </p>
      <ContactSubmissionForm />
      <p>
        <Link href="/">Back to landing page</Link>
      </p>
    </section>
  );
}
