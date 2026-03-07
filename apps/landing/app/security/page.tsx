import Link from "next/link";
import type { Metadata } from "next";

const fallbackSecurityEmail = "security@zevlinbike.com";

export const metadata: Metadata = {
  title: "Security & Responsible Disclosure | Zevlin Bike",
  description:
    "Zevlin Bike security practices, incident response expectations, and responsible disclosure contact.",
  alternates: {
    canonical: "/security",
  },
};

export default function SecurityPage() {
  const securityEmail = process.env.LANDING_SECURITY_EMAIL?.trim() || fallbackSecurityEmail;

  return (
    <section className="section-block panel">
      <p className="section-kicker">Trust & Security</p>
      <h1>Security and Responsible Disclosure</h1>
      <p className="subtitle">
        Zevlin Bike protects customer and operational data with encryption, access controls, audit logs,
        and monitored production systems.
      </p>

      <div className="policy-grid">
        <article className="policy-card">
          <h3>Core Controls</h3>
          <ul>
            <li>Field-level encryption for sensitive intake payloads.</li>
            <li>Role-based access controls and row-level security for protected data.</li>
            <li>Rate limiting and idempotency to reduce abuse and duplicate actions.</li>
            <li>Audit trail coverage for intake workflows and operational actions.</li>
          </ul>
        </article>

        <article className="policy-card">
          <h3>Incident Response</h3>
          <ul>
            <li>Events are triaged by severity and escalated to incident owners.</li>
            <li>Containment and remediation steps are tracked in an incident timeline.</li>
            <li>Customer updates are issued when legal or operational thresholds are met.</li>
          </ul>
        </article>
      </div>

      <h2>Report a Security Issue</h2>
      <p>
        Email <a href={`mailto:${securityEmail}`}>{securityEmail}</a> with a clear description, impact,
        and reproduction steps.
      </p>
      <p>
        We ask researchers to avoid data exfiltration, service disruption, or social engineering during
        testing.
      </p>

      <p>
        <Link href="/">Back to landing page</Link>
      </p>
    </section>
  );
}
