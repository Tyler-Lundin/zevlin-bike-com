"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LandingContent, LandingProduct } from "../../lib/content";
import LandingNav from "../nav/LandingNav";
import { toUsd } from "../../lib/productPresentation";

function findCarouselProducts(products: LandingProduct[], slugs: string[]) {
  const matches = slugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is LandingProduct => Boolean(product));

  if (matches.length > 0) {
    return matches;
  }

  return products.slice(0, 1);
}

export default function LandingHero({ content }: { content: LandingContent }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCue, setShowCue] = useState(true);
  const [paused, setPaused] = useState(false);

  const carouselProducts = useMemo(
    () => findCarouselProducts(content.products, content.hero.carouselProductSlugs).slice(0, 2),
    [content.products, content.hero.carouselProductSlugs],
  );

  const activeProduct = carouselProducts[activeIndex] ?? carouselProducts[0] ?? null;

  useEffect(() => {
    if (carouselProducts.length < 2 || paused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselProducts.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [carouselProducts.length, paused]);

  useEffect(() => {
    const handleScroll = () => {
      setShowCue(window.scrollY <= 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hero-shell" id="home">
      <LandingNav
        brandName={content.brandName}
        logoPath={content.logoPath}
        navLinks={content.navLinks}
        storeUrl={content.storeUrl}
        announcementItems={content.announcementBar.items}
      />

      <section className="hero-stage old-hero-stage" aria-labelledby="hero-heading">
        <div className="old-hero-background" aria-hidden="true">
          <Image
            src={content.hero.backgroundImagePath}
            alt=""
            fill
            priority
            sizes="100vw"
            className="old-hero-background-image"
          />
          <div className="old-hero-background-gradient" />
          <div className="old-hero-background-sidefade" />
          <div className="old-hero-background-bottomfade" />
          <div className="old-hero-dot-grid" />
        </div>

        <div className="old-hero-inner">
          <div className="old-hero-copy">
            <h1 id="hero-heading" className="old-hero-headline">
              Goods <span className="old-hero-headline-connector">for your</span> Goods
            </h1>
            <p className="old-hero-tagline">{content.hero.tagline}</p>
            <Link href={content.hero.primaryCta.href} className="old-hero-cta">
              {content.hero.primaryCta.label}
            </Link>
          </div>

          <div className="old-hero-products">
            <p className="old-hero-shipping-pill">{content.hero.freeShippingText}</p>

            {activeProduct ? (
              <div
                className="old-hero-carousel"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                tabIndex={0}
                aria-label="Featured products"
              >
                <div className="old-hero-product-stage" key={activeProduct.id}>
                  <div className="old-hero-product-card">
                    <div className="old-hero-product-glow" />
                    <div className="old-hero-product-image-shell">
                      <Image
                        src={activeProduct.media.imagePath}
                        alt={activeProduct.media.imageAlt}
                        fill
                        sizes="(min-width: 1200px) 32vw, (min-width: 768px) 42vw, 60vw"
                        className="old-hero-product-image"
                      />
                    </div>
                    <span className="old-hero-product-price">{toUsd(activeProduct.priceCents)}</span>
                  </div>
                </div>
                <p className="old-hero-product-name">{activeProduct.name}</p>
              </div>
            ) : null}
          </div>
        </div>

        {showCue ? (
          <div className="old-hero-scroll-cue" aria-hidden="true">
            <span>{content.hero.scrollCueLabel}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </div>
        ) : null}
      </section>
    </div>
  );
}
