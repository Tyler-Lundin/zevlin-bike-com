import Image from "next/image";
import Link from "next/link";
import LandingHero from "../components/hero/LandingHero";
import NewsletterSignupForm from "../components/forms/NewsletterSignupForm";
import { getLandingContent } from "../lib/content";
import {
  getProductMark,
  getProductTone,
  getShortDescription,
  toUsd,
} from "../lib/productPresentation";

export const revalidate = 60;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function getReviewExcerpt(quote: string): string {
  const firstSentence = quote.match(/^.+?[.!?](?:\s|$)/)?.[0]?.trim();

  if (firstSentence && firstSentence.length <= 116) {
    return firstSentence;
  }

  if (quote.length <= 120) {
    return quote;
  }

  return `${quote.slice(0, 117).trimEnd()}...`;
}

export default async function HomePage() {
  const content = await getLandingContent();
  const siteUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "https://www.zevlinbike.com");
  const getStoreProductHref = (slug: string) => `${content.storeUrl}/products/${slug}`;
  const featuredProductSlug = content.hero.featuredProductSlug;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: content.brandName,
    url: siteUrl,
    logo: `${siteUrl}${content.logoPath}`,
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
        url: getStoreProductHref(product.slug),
        image: [`${siteUrl}${product.media.imagePath}`],
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: (product.priceCents / 100).toFixed(2),
          availability: "https://schema.org/InStock",
          url: getStoreProductHref(product.slug),
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

      <main className="landing-home">
        <section className="landing-section proof-strip-section" aria-labelledby="proof-strip-title">
          <div className="proof-strip-shell">
            <div className="landing-section-header proof-strip-intro">
              <p className="landing-eyebrow">{content.proofStrip.eyebrow}</p>
              <h2 id="proof-strip-title">{content.proofStrip.title}</h2>
              <p className="landing-summary">{content.proofStrip.summary}</p>
            </div>
            <div className="proof-strip-grid">
              {content.proofStrip.items.map((item, index) => (
                <article key={item.title} className="landing-surface proof-card">
                  <p className="proof-card-index">{String(index + 1).padStart(2, "0")}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="landing-section product-showcase-section" aria-labelledby="products-title">
          <div className="landing-section-header product-showcase-header">
            <div>
              <p className="landing-eyebrow">{content.productShowcase.eyebrow}</p>
              <h2 id="products-title">{content.productShowcase.title}</h2>
              <p className="landing-summary">{content.productShowcase.summary}</p>
            </div>
            <Link className="landing-button-secondary landing-button-desktop" href={content.productShowcase.primaryCta.href}>
              {content.productShowcase.primaryCta.label}
            </Link>
          </div>

          <div className="landing-product-grid">
            {content.products.map((product) => (
              <article
                id={`product-${product.slug}`}
                className={`landing-surface landing-product-card${
                  product.slug === featuredProductSlug ? " landing-product-card-featured" : ""
                }`}
                key={product.id}
                style={getProductTone(product.slug)}
              >
                <div className="landing-product-visual">
                  {product.slug === featuredProductSlug ? (
                    <span className="landing-product-feature-label">Featured in the hero</span>
                  ) : null}
                  <span className="landing-product-chip">{product.media.label}</span>
                  <div className="landing-product-image-shell">
                    <Image
                      src={product.media.imagePath}
                      alt={product.media.imageAlt}
                      fill
                      sizes="(min-width: 1200px) 22vw, (min-width: 768px) 44vw, 100vw"
                      className="landing-product-image"
                    />
                  </div>
                </div>
                <div className="landing-product-copy">
                  <p className="landing-product-mark">{getProductMark(product.name)}</p>
                  <h3>{product.name}</h3>
                  <p>{getShortDescription(product.description)}</p>
                </div>
                <div className="landing-product-meta">
                  <span className="landing-product-price">{toUsd(product.priceCents)}</span>
                  <Link className="landing-button-inline" href={getStoreProductHref(product.slug)}>
                    View in store
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="landing-mobile-action">
            <Link className="landing-button-secondary" href={content.productShowcase.primaryCta.href}>
              {content.productShowcase.primaryCta.label}
            </Link>
          </div>
        </section>

        <section id="guide" className="landing-section use-case-section" aria-labelledby="guide-title">
          <div className="guide-shell">
            <div className="landing-section-header guide-intro">
              <p className="landing-eyebrow">{content.useCaseGuide.eyebrow}</p>
              <h2 id="guide-title">{content.useCaseGuide.title}</h2>
              <p className="landing-summary">{content.useCaseGuide.summary}</p>
            </div>
            <div className="guide-grid">
              {content.useCaseGuide.items.map((item, index) => (
                <article key={item.title} className="landing-surface guide-card">
                  <p className="guide-card-step">{String(index + 1).padStart(2, "0")}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="guide-card-links">
                    {item.productSlugs.map((slug) => {
                      const product = content.products.find((entry) => entry.slug === slug);
                      if (!product) {
                        return null;
                      }

                      return (
                        <Link key={slug} href={getStoreProductHref(slug)} className="guide-card-link">
                          {product.name}
                        </Link>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="landing-section team-teaser-section" aria-labelledby="team-title">
          <div className="landing-surface team-teaser-shell">
            <div className="team-teaser-media">
              <Image
                src={content.teamTeaser.imagePath}
                alt={content.teamTeaser.imageAlt}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="team-teaser-image"
              />
            </div>
            <div className="team-teaser-copy">
              <p className="landing-eyebrow">{content.teamTeaser.eyebrow}</p>
              <h2 id="team-title">{content.teamTeaser.title}</h2>
              <p className="landing-summary">{content.teamTeaser.summary}</p>
              <ul className="team-teaser-points">
                {content.teamTeaser.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link className="landing-button-primary" href={content.teamTeaser.cta.href}>
                {content.teamTeaser.cta.label}
              </Link>
            </div>
          </div>
        </section>

        <section id="story" className="landing-section brand-proof-section" aria-labelledby="brand-proof-title">
          <div className="landing-surface brand-proof-shell">
            <div className="brand-proof-copy">
              <p className="landing-eyebrow">{content.brandProof.eyebrow}</p>
              <h2 id="brand-proof-title">{content.brandProof.title}</h2>
              <p className="landing-summary">{content.brandProof.summary}</p>
              <div className="brand-proof-stack">
                {content.brandProof.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <ul className="brand-proof-points">
                {content.brandProof.proofPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <blockquote className="brand-proof-quote">
                <p>&ldquo;{content.brandProof.quote}&rdquo;</p>
                <cite>{content.brandProof.quoteBy}</cite>
              </blockquote>
            </div>
            <div className="brand-proof-visual">
              <div className="brand-proof-image-shell">
                <Image
                  src={content.brandProof.imagePath}
                  alt={content.brandProof.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="brand-proof-image"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="landing-section reviews-section" aria-labelledby="reviews-title">
          <div className="review-strip-shell">
            <div className="landing-section-header review-strip-intro">
              <p className="landing-eyebrow">{content.reviews.eyebrow}</p>
              <h2 id="reviews-title">{content.reviews.title}</h2>
              <p className="landing-summary">{content.reviews.summary}</p>
            </div>
            <div className="review-grid">
              {content.reviews.items.map((item, index) => (
                <article
                  key={`${item.name}-${item.title}`}
                  className={`landing-surface review-card${index === 0 ? " review-card-featured" : ""}`}
                >
                  <p className="stars">{"*".repeat(item.rating)}</p>
                  <p className="review-quote">&ldquo;{getReviewExcerpt(item.quote)}&rdquo;</p>
                  <p className="review-byline">
                    {item.name}
                    <span>{item.title}</span>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="support" className="landing-section support-section" aria-labelledby="support-title">
          <div className="support-shell">
            <div className="landing-section-header support-intro">
              <p className="landing-eyebrow">{content.supportHighlights.eyebrow}</p>
              <h2 id="support-title">{content.supportHighlights.title}</h2>
              <p className="landing-summary">{content.supportHighlights.summary}</p>
            </div>

            <div className="support-content">
              <div className="support-grid">
                {content.supportHighlights.items.map((item) => (
                  <article key={item.title} className="landing-surface support-card">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <Link href={item.href} className="landing-button-inline">
                      {item.linkLabel}
                    </Link>
                  </article>
                ))}
              </div>

              <aside className="landing-surface b2b-callout">
                <div>
                  <p className="landing-eyebrow">B2B</p>
                  <h3>{content.supportHighlights.b2bCallout.title}</h3>
                  <p>{content.supportHighlights.b2bCallout.description}</p>
                </div>
                <Link className="landing-button-secondary" href={content.supportHighlights.b2bCallout.cta.href}>
                  {content.supportHighlights.b2bCallout.cta.label}
                </Link>
              </aside>
            </div>
          </div>
        </section>

        <section id="faq" className="landing-section faq-section" aria-labelledby="faq-title">
          <div className="landing-section-header landing-section-header-centered">
            <p className="landing-eyebrow">FAQ</p>
            <h2 id="faq-title">{content.faq.title}</h2>
            <p className="landing-summary">{content.faq.subtitle}</p>
          </div>
          <div className="landing-faq-list">
            {content.faq.items.map((faq) => (
              <details key={faq.question} className="landing-surface landing-faq-item">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="landing-section footer-cta-section" aria-labelledby="footer-cta-title">
          <div className="landing-surface footer-cta-shell">
            <div className="footer-cta-copy">
              <p className="landing-eyebrow">{content.footerCta.eyebrow}</p>
              <h2 id="footer-cta-title">{content.footerCta.title}</h2>
              <p className="landing-summary">{content.footerCta.summary}</p>
              <div className="footer-cta-actions">
                <Link className="landing-button-primary" href={content.footerCta.primaryCta.href}>
                  {content.footerCta.primaryCta.label}
                </Link>
                <Link className="landing-button-secondary" href={content.footerCta.contactLink.href}>
                  {content.footerCta.contactLink.label}
                </Link>
              </div>
            </div>

            <div className="footer-cta-cards">
              <article className="landing-surface footer-cta-card footer-contact-card">
                <h3>{content.footerCta.contactTitle}</h3>
                <p>{content.footerCta.contactBody}</p>
                <a href={`mailto:${content.contact.email}`} className="footer-contact-link">
                  {content.contact.email}
                </a>
              </article>

              <article className="landing-surface footer-cta-card footer-newsletter-card">
                <h3>{content.footerCta.newsletterTitle}</h3>
                <p>{content.footerCta.newsletterSubtitle}</p>
                <NewsletterSignupForm
                  source="landing-home-footer-newsletter"
                  placeholder={content.footerCta.placeholder}
                  submitLabel={content.footerCta.buttonLabel}
                />
              </article>
            </div>

            <div className="footer-utility-links" aria-label="Footer links">
              {content.footerCta.footerLinks.map((link) => (
                <Link key={`${link.label}-${link.href}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
