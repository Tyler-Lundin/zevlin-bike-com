import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import B2bInquiryForm from "../components/B2bInquiryForm";
import { getB2bContent } from "../lib/content";

export const metadata: Metadata = {
  title: "Wholesale and Partnership Inquiries",
  description:
    "Start a Zevlin wholesale, retail, or partnership inquiry without pretending there is already a full portal behind it.",
};

export default async function HomePage() {
  const content = await getB2bContent();

  return (
    <div className="b2b-page">
      <header className="b2b-site-header">
        <div className="b2b-site-header-inner">
          <Link href={content.siteUrl} className="b2b-brand-lockup">
            <Image src={content.logoPath} alt="Zevlin Bike" width={52} height={52} className="b2b-brand-logo" />
            <span className="b2b-brand-copy">
              <span className="b2b-brand-name">{content.brandName}</span>
              <span className="b2b-brand-tagline">{content.brandTagline}</span>
            </span>
          </Link>

          <nav className="b2b-nav" aria-label="B2B page">
            {content.navLinks
              .filter((link) => link.variant !== "primary")
              .map((link) => (
                <Link key={`${link.label}-${link.href}`} href={link.href} className="b2b-nav-link">
                  {link.label}
                </Link>
              ))}
            {content.navLinks
              .filter((link) => link.variant === "primary")
              .map((link) => (
                <Link key={`${link.label}-${link.href}`} href={link.href} className="b2b-nav-cta">
                  {link.label}
                </Link>
              ))}
          </nav>
        </div>
      </header>

      <section className="b2b-hero" aria-labelledby="b2b-hero-title">
        <div className="b2b-hero-copy">
          <p className="b2b-eyebrow">{content.hero.eyebrow}</p>
          <h1 id="b2b-hero-title" className="b2b-hero-title">
            {content.hero.headline}
          </h1>
          <p className="b2b-hero-summary">{content.hero.subheadline}</p>
          <div className="b2b-hero-actions">
            <Link href={content.hero.primaryCta.href} className="b2b-button-primary">
              {content.hero.primaryCta.label}
            </Link>
            <Link href={content.hero.secondaryCta.href} className="b2b-button-secondary">
              {content.hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="b2b-metric-grid">
          {content.hero.metrics.map((metric) => (
            <article key={metric.label} className="b2b-surface b2b-metric-card">
              <p className="b2b-metric-label">{metric.label}</p>
              <p className="b2b-metric-value">{metric.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="audience" className="b2b-section" aria-labelledby="b2b-audience-title">
        <div className="b2b-section-header">
          <p className="b2b-eyebrow">{content.audiences.eyebrow}</p>
          <h2 id="b2b-audience-title">{content.audiences.title}</h2>
          <p className="b2b-summary">{content.audiences.summary}</p>
        </div>
        <div className="b2b-card-grid b2b-card-grid-three">
          {content.audiences.items.map((item) => (
            <article key={item.title} className="b2b-surface b2b-info-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="support" className="b2b-section b2b-section-split" aria-labelledby="b2b-support-title">
        <div className="b2b-section-header">
          <p className="b2b-eyebrow">{content.support.eyebrow}</p>
          <h2 id="b2b-support-title">{content.support.title}</h2>
          <p className="b2b-summary">{content.support.summary}</p>
        </div>
        <div className="b2b-card-grid">
          {content.support.items.map((item) => (
            <article key={item.title} className="b2b-surface b2b-info-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="b2b-section b2b-section-split" aria-labelledby="b2b-reasons-title">
        <div className="b2b-section-header">
          <p className="b2b-eyebrow">{content.reasons.eyebrow}</p>
          <h2 id="b2b-reasons-title">{content.reasons.title}</h2>
          <p className="b2b-summary">{content.reasons.summary}</p>
        </div>
        <div className="b2b-card-grid">
          {content.reasons.items.map((item) => (
            <article key={item.title} className="b2b-surface b2b-info-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="apply" className="b2b-section b2b-apply-grid" aria-labelledby="b2b-apply-title">
        <article className="b2b-surface b2b-apply-copy">
          <p className="b2b-eyebrow">{content.inquiry.eyebrow}</p>
          <h2 id="b2b-apply-title">{content.inquiry.title}</h2>
          <p className="b2b-summary">{content.inquiry.summary}</p>
          <ul className="b2b-bullet-list">
            {content.inquiry.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <p className="b2b-apply-note">{content.inquiry.note}</p>
          <Link href={content.inquiry.contactCta.href} className="b2b-button-secondary">
            {content.inquiry.contactCta.label}
          </Link>
        </article>

        <article className="b2b-surface b2b-form-card">
          <B2bInquiryForm />
        </article>
      </section>

      <section id="faq" className="b2b-section" aria-labelledby="b2b-faq-title">
        <div className="b2b-section-header">
          <p className="b2b-eyebrow">{content.faq.eyebrow}</p>
          <h2 id="b2b-faq-title">{content.faq.title}</h2>
        </div>
        <div className="b2b-card-grid b2b-card-grid-two">
          {content.faq.items.map((item) => (
            <article key={item.question} className="b2b-surface b2b-faq-card">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="b2b-footer-cta">
        <div>
          <h2>{content.footer.title}</h2>
          <p>{content.footer.summary}</p>
        </div>
        <div className="b2b-footer-links">
          {content.footer.links.map((link) => (
            <Link key={`${link.label}-${link.href}`} href={link.href} className="b2b-footer-link">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
