import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LandingContent, LandingProduct } from "../../lib/content";
import {
  getProductMark,
  getProductTone,
  getShortDescription,
  toUsd,
} from "../../lib/productPresentation";

function renderHeadline(headline: string): ReactNode {
  const parts = headline.split(/for your/i);
  if (parts.length !== 2) {
    return headline;
  }

  return (
    <>
      {parts[0].trimEnd()} <span>for your</span> {parts[1].trimStart()}
    </>
  );
}

function findProduct(products: LandingProduct[], slug: string): LandingProduct {
  return products.find((product) => product.slug === slug) ?? products[0];
}

export default function LandingHero({ content }: { content: LandingContent }) {
  const featuredProduct = findProduct(content.products, content.hero.featuredProductSlug);
  const supportingProducts = content.hero.supportingProductSlugs
    .map((slug) => content.products.find((product) => product.slug === slug))
    .filter((product): product is LandingProduct => Boolean(product))
    .slice(0, 2);
  const trustRail = [
    {
      href: "/shipping",
      eyebrow: "Shipping",
      title: "Free shipping over $49",
      body: "Straightforward delivery windows and tracking that actually helps.",
    },
    {
      href: "/returns",
      eyebrow: "Returns",
      title: "30-day rider-friendly returns",
      body: "Opened or not, Zevlin support helps riders get the right outcome.",
    },
    {
      href: "/privacy/request",
      eyebrow: "Privacy",
      title: "Privacy-safe support",
      body: "Rights requests and intake data are handled through audited workflows.",
    },
    {
      href: "/contact",
      eyebrow: "Support",
      title: "Talk to a real human",
      body: `Questions go to ${content.contact.email} and route directly to support.`,
    },
  ];

  return (
    <div className="hero-shell">
      <header id="home" className="top-nav hero-nav">
        <div className="brand-lockup">
          <Image src={content.logoPath} alt={content.brandName} width={44} height={44} priority />
          <div>
            <p className="brand-title">{content.brandName}</p>
            <p className="brand-tagline">{content.brandTagline}</p>
          </div>
        </div>

        <nav className="link-cloud" aria-label="Primary">
          {content.navLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="hero-stage" aria-labelledby="hero-heading">
        <div className="hero-atmosphere" aria-hidden="true">
          <Image
            src={content.hero.backgroundImagePath}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-rider-image"
          />
          <div className="hero-copy-scrim" />
          <div className="hero-dot-grid" />
          <div className="hero-wash hero-wash-left" />
          <div className="hero-wash hero-wash-right" />
          <div className="hero-road-glow" />
        </div>

        <div className="hero-stage-grid">
          <div className="hero-copy-column">
            <p className="hero-overline">{content.hero.eyebrow}</p>
            <h1 id="hero-heading" className="hero-headline">
              {renderHeadline(content.hero.headline)}
            </h1>
            <p className="hero-subheadline">{content.hero.subheadline}</p>

            <div className="hero-actions">
              <Link className="hero-primary-action" href={content.hero.primaryCta.href}>
                {content.hero.primaryCta.label}
              </Link>
              <Link className="hero-secondary-action" href={content.hero.secondaryCta.href}>
                {content.hero.secondaryCta.label}
              </Link>
            </div>

            <ul className="hero-chip-list" aria-label="Trust signals">
              {content.hero.trustChips.map((chip) => (
                <li key={chip} className="hero-chip">
                  {chip}
                </li>
              ))}
            </ul>

            <blockquote className="hero-quote-card">
              <p className="stars">{"*".repeat(content.hero.microTestimonial.rating)}</p>
              <p className="hero-quote-copy">&ldquo;{content.hero.microTestimonial.quote}&rdquo;</p>
              <p className="hero-quote-byline">
                {content.hero.microTestimonial.name}
                <span>{content.hero.microTestimonial.title}</span>
              </p>
            </blockquote>
          </div>

          <div className="hero-visual-column">
            <p className="hero-shipping-badge">{content.hero.shippingBadge}</p>

            <article className="hero-spotlight" style={getProductTone(featuredProduct.slug)}>
              <div className="hero-product-vessel">
                <div className="hero-product-orbit" />
                <div className="hero-product-core">
                  <div className="hero-product-sticker">
                    <Image
                      src={content.logoPath}
                      alt=""
                      width={36}
                      height={36}
                      className="hero-product-logo"
                    />
                    <span>{featuredProduct.media.label}</span>
                  </div>
                  <div className="hero-product-image-frame">
                    <Image
                      src={featuredProduct.media.imagePath}
                      alt={featuredProduct.media.imageAlt}
                      fill
                      priority
                      sizes="(min-width: 1120px) 34vw, 92vw"
                      className="hero-product-image"
                    />
                  </div>
                  <div className="hero-product-caption">
                    <p className="hero-product-mark">{getProductMark(featuredProduct.name)}</p>
                    <p className="hero-product-type">{featuredProduct.name}</p>
                  </div>
                </div>
                <span className="hero-price-tag">{toUsd(featuredProduct.priceCents)}</span>
              </div>

              <div className="hero-spotlight-copy">
                <p className="hero-spotlight-kicker">Featured formula</p>
                <h2>{featuredProduct.name}</h2>
                <p>{getShortDescription(featuredProduct.description)}</p>
                <Link className="hero-inline-link" href={`#product-${featuredProduct.slug}`}>
                  See the full product details
                </Link>
              </div>
            </article>

            <div className="hero-supporting-grid">
              {supportingProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`#product-${product.slug}`}
                  className="hero-support-card"
                  style={getProductTone(product.slug)}
                >
                  <div className="hero-support-visual">
                    <Image
                      src={product.media.imagePath}
                      alt={product.media.imageAlt}
                      fill
                      sizes="(min-width: 1120px) 16vw, 90vw"
                      className="hero-support-image"
                    />
                  </div>
                  <div className="hero-support-copy">
                    <p className="hero-support-kicker">{product.media.label}</p>
                    <h3>{product.name}</h3>
                    <p>{getShortDescription(product.description)}</p>
                  </div>
                  <div className="hero-support-meta">
                    <span className="hero-support-mark">{getProductMark(product.name)}</span>
                    <span className="hero-support-price">{toUsd(product.priceCents)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hero-trust-rail" aria-label="Trust and support">
        {trustRail.map((item) => (
          <Link key={item.href} href={item.href} className="trust-rail-card">
            <p className="trust-rail-eyebrow">{item.eyebrow}</p>
            <h3 className="trust-rail-title">{item.title}</h3>
            <p className="trust-rail-body">{item.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
