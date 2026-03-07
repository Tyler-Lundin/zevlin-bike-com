import Link from "next/link";
import type { Metadata } from "next";
import { getLandingContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "FAQ | Zevlin Bike",
  description: "Frequently asked questions for products, policies, and support.",
  alternates: {
    canonical: "/faq",
  },
};

export default async function FaqPage() {
  const content = await getLandingContent();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="section-block panel">
        <p className="section-kicker">Support</p>
        <h1>{content.faq.title}</h1>
        <p className="subtitle">{content.faq.subtitle}</p>

        <div className="faq-list">
          {content.faq.items.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>

        <p>
          <Link href="/">Back to landing page</Link>
        </p>
      </section>
    </>
  );
}
