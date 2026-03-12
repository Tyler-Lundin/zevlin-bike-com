import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LandingContent, LandingProduct } from "../../lib/content";

function toUsd(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

function getShortDescription(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (firstSentence) {
    return firstSentence;
  }

  return normalized.length > 168 ? `${normalized.slice(0, 165).trimEnd()}...` : normalized;
}

function getProductMark(productName: string): string {
  const mark = productName
    .replace(/\b(Chamois|Cream|Fitness|Wash|Towel|Gaiter)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return mark || productName;
}

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

function getProductTone(slug: string): CSSProperties {
  const toneMap: Record<string, { accent: string; accentStrong: string; glow: string }> = {
    "crack-chamois-cream": {
      accent: "#3cc7ff",
      accentStrong: "#0e5f98",
      glow: "rgba(60, 199, 255, 0.28)",
    },
    "super-crack-chamois-cream": {
      accent: "#ffb347",
      accentStrong: "#aa5f11",
      glow: "rgba(255, 179, 71, 0.24)",
    },
    "byot-fitness-wash": {
      accent: "#9dfbcb",
      accentStrong: "#2d8960",
      glow: "rgba(157, 251, 203, 0.22)",
    },
  };
  const tone = toneMap[slug] ?? {
    accent: "#8fc4ff",
    accentStrong: "#31669c",
    glow: "rgba(143, 196, 255, 0.22)",
  };

  return {
    "--hero-accent": tone.accent,
    "--hero-accent-strong": tone.accentStrong,
    "--hero-glow": tone.glow,
  } as CSSProperties;
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
          <div className="hero-dot-grid" />
          <div className="hero-wash hero-wash-left" />
          <div className="hero-wash hero-wash-right" />
          <div className="hero-road-glow" />
        </div>

        <div className="hero-stage-grid">
          <div className="hero-copy-column">
            <p className="eyebrow hero-eyebrow">{content.hero.eyebrow}</p>
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
                  <Image
                    src={content.logoPath}
                    alt=""
                    width={96}
                    height={96}
                    className="hero-product-logo"
                  />
                  <p className="hero-product-mark">{getProductMark(featuredProduct.name)}</p>
                  <p className="hero-product-type">{featuredProduct.name}</p>
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
                  <div className="hero-support-mark">{getProductMark(product.name)}</div>
                  <div className="hero-support-copy">
                    <p className="hero-support-kicker">Also in the lineup</p>
                    <h3>{product.name}</h3>
                    <p>{getShortDescription(product.description)}</p>
                  </div>
                  <span className="hero-support-price">{toUsd(product.priceCents)}</span>
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
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
