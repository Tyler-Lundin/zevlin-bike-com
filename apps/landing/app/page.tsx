import Link from "next/link";
import LandingHero from "../components/hero/LandingHero";
import NewsletterSignupForm from "../components/forms/NewsletterSignupForm";
import { getLandingContent } from "../lib/content";

export const revalidate = 60;

function toUsd(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export default async function HomePage() {
  const content = await getLandingContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zevlinbike.com";
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: content.brandName,
    url: siteUrl,
    logo: `${siteUrl}${content.logoPath}`,
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: content.contact.email,
      },
    ],
  };
  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: content.products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        sku: product.slug,
        url: `${siteUrl}/#product-${product.slug}`,
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: (product.priceCents / 100).toFixed(2),
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <LandingHero content={content} />

      <section id="products" className="section-block">
        <div className="section-head">
          <p className="section-kicker">From legacy /products</p>
          <h2>{content.productsHeading}</h2>
        </div>
        <div className="product-grid">
          {content.products.map((product) => (
            <article id={`product-${product.slug}`} className="product-card" key={product.id}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-meta">
                <span>{toUsd(product.priceCents)}</span>
                <code>{product.slug}</code>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="benefits" className="section-block panel">
        <div className="section-head">
          <p className="section-kicker">From legacy features + CTA</p>
          <h2>{content.featuresHeading}</h2>
        </div>
        <div className="feature-grid">
          {content.features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
        <div className="cta-band">
          <h3>{content.cta.title}</h3>
          <p>{content.cta.subtitle}</p>
          <ul>
            {content.cta.bulletPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="primary-action" href={content.cta.button.href}>
            {content.cta.button.label}
          </Link>
        </div>
      </section>

      <section id="testimonials" className="section-block">
        <div className="section-head">
          <p className="section-kicker">From legacy store/reviews.ts</p>
          <h2>{content.testimonialsHeading}</h2>
        </div>
        <div className="testimonial-grid">
          {content.testimonials.map((item) => (
            <article key={`${item.name}-${item.title}`} className="testimonial-card">
              <p className="stars">{"*".repeat(item.rating)}</p>
              <p className="quote">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="byline">
                {item.name} <span>{item.title}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="story" className="section-block story-grid panel">
        <article>
          <p className="section-kicker">From legacy /about</p>
          <h2>{content.about.title}</h2>
          <p className="subtitle">{content.about.subtitle}</p>
          <div className="stacked-copy">
            {content.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <blockquote>
            &ldquo;{content.about.rideQuote}&rdquo; <cite>{content.about.rideQuoteBy}</cite>
          </blockquote>
        </article>
        <article>
          <p className="section-kicker">From legacy /mission</p>
          <h2>{content.mission.title}</h2>
          <p className="subtitle">{content.mission.subtitle}</p>
          {content.mission.pillars.map((pillar) => (
            <div key={pillar.title} className="mission-pillar">
              <h3>{pillar.title}</h3>
              {pillar.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ))}
        </article>
      </section>

      <section id="support" className="section-block">
        <div className="section-head">
          <p className="section-kicker">From shipping / returns / privacy / events / blog routes</p>
          <h2>Support and Policy Data</h2>
        </div>

        <div className="policy-grid">
          <article className="policy-card">
            <h3>{content.shipping.title}</h3>
            <p className="subnote">{content.shipping.subtitle}</p>
            {content.shipping.sections.map((section) => (
              <div key={section.title} className="policy-row">
                <h4>{section.title}</h4>
                {section.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ))}
            <p>
              <Link href="/shipping">Read full shipping policy</Link>
            </p>
          </article>

          <article className="policy-card">
            <h3>{content.returns.title}</h3>
            <p className="subnote">{content.returns.subtitle}</p>
            <ul>
              {content.returns.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <h4>Legacy Return Form Fields</h4>
            <ul>
              {content.returns.formFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
            <p>
              <Link href="/returns">Open return request page</Link>
            </p>
          </article>

          <article className="policy-card">
            <h3>{content.privacy.title}</h3>
            <p className="subnote">Last updated {content.privacy.updatedAt}</p>
            {content.privacy.summary.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              Contact: <a href={`mailto:${content.privacy.contactEmail}`}>{content.privacy.contactEmail}</a>
            </p>
            <p>
              <Link href="/privacy">Read full privacy policy</Link>
            </p>
          </article>

          <article className="policy-card">
            <h3>{content.events.title}</h3>
            <p>{content.events.summary}</p>
            <h4>{content.blog.title}</h4>
            <p>{content.blog.subtitle}</p>
            <p>{content.blog.emptyState}</p>
            <p>
              <Link href="/faq">Browse support FAQ</Link>
            </p>
          </article>

          <article className="policy-card">
            <h3>Legal and Security</h3>
            <p className="subnote">Audit-ready public docs and request flows.</p>
            <ul>
              <li>
                <Link href="/terms">Terms of service</Link>
              </li>
              <li>
                <Link href="/security">Security disclosure</Link>
              </li>
              <li>
                <Link href="/privacy/request">Privacy rights request</Link>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section id="faq" className="section-block panel">
        <div className="section-head">
          <p className="section-kicker">From legacy /faq</p>
          <h2>{content.faq.title}</h2>
          <p className="subnote">{content.faq.subtitle}</p>
        </div>
        <div className="faq-list">
          {content.faq.items.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section-block newsletter-block">
        <div>
          <p className="section-kicker">From legacy newsletter module</p>
          <h2>{content.newsletter.title}</h2>
          <p>{content.newsletter.subtitle}</p>
        </div>
        <NewsletterSignupForm
          source="landing-home-newsletter"
          placeholder={content.newsletter.placeholder}
          submitLabel={content.newsletter.buttonLabel}
        />
      </section>

      <section id="contact" className="section-block panel">
        <div className="section-head">
          <p className="section-kicker">From legacy /contact + store settings</p>
          <h2>{content.contact.title}</h2>
        </div>
        <div className="contact-grid">
          <article>
            <p>{content.contact.summary}</p>
            <p>
              Support email: <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
            </p>
            <p>
              <Link href="/contact">Open full contact form</Link>
            </p>
          </article>
          <article>
            <h3>Shipping Origin</h3>
            <p>{content.operations.shippingOrigin.name}</p>
            <p>{content.operations.shippingOrigin.address1}</p>
            <p>
              {content.operations.shippingOrigin.city}, {content.operations.shippingOrigin.state}{" "}
              {content.operations.shippingOrigin.postalCode}
            </p>
            <p>{content.operations.shippingOrigin.country}</p>
            <p>
              {content.operations.shippingOrigin.phone} | {content.operations.shippingOrigin.email}
            </p>
          </article>
        </div>

        <div className="footer-grid">
          {content.footerColumns.map((column) => (
            <article key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <footer className="source-note">
        <p>
          Replicated source: <code>{content.source.appPath}</code>
        </p>
        <p>Routes migrated: {content.source.routes.join(", ")}</p>
      </footer>
    </>
  );
}
