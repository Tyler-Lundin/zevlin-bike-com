import Link from "next/link";
import type { Metadata } from "next";
import { getLandingContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Shipping Information | Zevlin Bike",
  description: "Shipping methods, delivery timing, and tracking details for Zevlin orders.",
  alternates: {
    canonical: "/shipping",
  },
};

export default async function ShippingPage() {
  const content = await getLandingContent();

  return (
    <section className="section-block panel">
      <p className="section-kicker">Policy</p>
      <h1>{content.shipping.title}</h1>
      <p className="subtitle">{content.shipping.subtitle}</p>

      <div className="policy-grid">
        {content.shipping.sections.map((section) => (
          <article key={section.title} className="policy-card">
            <h3>{section.title}</h3>
            {section.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ))}
      </div>

      <p>
        <Link href="/">Back to landing page</Link>
      </p>
    </section>
  );
}
