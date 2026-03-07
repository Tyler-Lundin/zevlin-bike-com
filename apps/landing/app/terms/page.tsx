import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Zevlin Bike",
  description: "Terms governing the use of Zevlin Bike websites, products, and support channels.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <section className="section-block panel">
      <p className="section-kicker">Legal</p>
      <h1>Terms of Service</h1>
      <p className="subtitle">
        These terms govern your use of Zevlin Bike websites, communications, and product ordering
        experiences.
      </p>

      <div className="policy-grid">
        <article className="policy-card">
          <h3>Use of the Site</h3>
          <p>
            You agree to provide accurate information, avoid abusive activity, and comply with applicable
            laws while using this site.
          </p>
        </article>

        <article className="policy-card">
          <h3>Orders, Returns, and Support</h3>
          <p>
            Product fulfillment, shipping timelines, and return decisions follow our published support
            policies.
          </p>
          <p>
            <Link href="/shipping">Shipping policy</Link> | <Link href="/returns">Returns policy</Link>
          </p>
        </article>

        <article className="policy-card">
          <h3>Privacy and Data</h3>
          <p>
            Personal data is handled according to our privacy policy and intake controls, including rights
            request workflows.
          </p>
          <p>
            <Link href="/privacy">Privacy policy</Link> | <Link href="/privacy/request">Privacy requests</Link>
          </p>
        </article>

        <article className="policy-card">
          <h3>Liability</h3>
          <p>
            To the fullest extent permitted by law, Zevlin Bike is not liable for indirect or consequential
            losses arising from site use.
          </p>
        </article>
      </div>

      <p>
        <Link href="/">Back to landing page</Link>
      </p>
    </section>
  );
}
