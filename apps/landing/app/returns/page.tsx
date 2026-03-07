import Link from "next/link";
import type { Metadata } from "next";
import ReturnRequestForm from "../../components/forms/ReturnRequestForm";
import { getLandingContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Returns and Refunds | Zevlin Bike",
  description: "Submit and track your return request with Zevlin Bike support.",
  alternates: {
    canonical: "/returns",
  },
};

export default async function ReturnsPage() {
  const content = await getLandingContent();

  return (
    <section className="section-block panel">
      <p className="section-kicker">Policy</p>
      <h1>{content.returns.title}</h1>
      <p className="subtitle">{content.returns.subtitle}</p>

      <ul>
        {content.returns.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <h2>Start a Return</h2>
      <ReturnRequestForm />
      <p>
        <Link href="/">Back to landing page</Link>
      </p>
    </section>
  );
}
