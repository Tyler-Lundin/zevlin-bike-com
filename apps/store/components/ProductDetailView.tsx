"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "../lib/catalog";
import { FREE_SHIPPING_THRESHOLD_CENTS, SUPPORT_EMAIL, toUsd } from "../lib/commerce";
import QuantityStepper from "./QuantityStepper";
import { useStore } from "./StoreProvider";

export default function ProductDetailView({ product }: { product: StoreProduct }) {
  const { addToCart, cart } = useStore();
  const buyBoxRef = useRef<HTMLDivElement | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const inCart = cart.find((item) => item.productId === product.id);

  useEffect(() => {
    const element = buyBoxRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      {
        threshold: 0.24,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      imagePath: product.media.imagePath,
      quantity,
    });
  };

  return (
    <div className="store-product-page">
      <div className="store-frame page-breadcrumbs">
        <Link href="/">Catalog</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="store-section product-stage-section">
        <div className="store-frame product-stage-intro">
          <p className="section-kicker">{product.usageLabel}</p>
          <h1>{product.name}</h1>
          <p className="product-stage-deck">{product.shortDescription}</p>
        </div>

        <div className="store-frame product-detail-layout">
          <div className="product-detail-main">
            <div className="surface-card product-stage-card">
              <div className="product-stage-media">
                <span className="product-stage-badge">{product.media.label}</span>
                <Image
                  src={product.media.imagePath}
                  alt={product.media.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1100px) 58vw, 100vw"
                  className="product-stage-image"
                />
              </div>

              <div className="product-stage-meta-strip">
                {product.bestFor.slice(0, 3).map((item) => (
                  <div key={item} className="product-stage-meta-item">
                    <span>Best for</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside ref={buyBoxRef} className="surface-card product-buy-box">
            <p className="section-kicker">Purchase</p>
            <h2>{product.name}</h2>
            <p className="product-buy-summary">{product.description}</p>
            <p className="product-buy-price">{toUsd(product.priceCents)}</p>
            {inCart ? <p className="product-buy-meta">Already in bag: {inCart.quantity}</p> : null}

            <ul className="benefit-list">
              {product.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>

            <div className="purchase-controls">
              <QuantityStepper value={quantity} onChange={setQuantity} />
              <button type="button" className="button-primary button-block" onClick={handleAddToCart}>
                Add to bag
              </button>
              <Link href="/cart" className="button-secondary button-block">
                Review bag
              </Link>
            </div>

            <div className="buy-box-fact-grid">
              <div className="buy-box-fact">
                <span>Shipping</span>
                <strong>Free over {toUsd(FREE_SHIPPING_THRESHOLD_CENTS)}</strong>
              </div>
              <div className="buy-box-fact">
                <span>Returns</span>
                <strong>30-day policy</strong>
              </div>
              <div className="buy-box-fact">
                <span>Support</span>
                <strong>{SUPPORT_EMAIL}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="store-section product-detail-band-section">
        <div className="store-frame product-detail-panels">
          <article className="surface-card detail-panel">
            <p className="section-kicker">Best for</p>
            <h2>Where it fits</h2>
            <ul className="detail-bullet-list">
              {product.bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="surface-card detail-panel">
            <p className="section-kicker">Field notes</p>
            <h2>What riders should expect</h2>
            <ul className="detail-bullet-list">
              {product.fieldNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="surface-card detail-panel">
            <p className="section-kicker">Shipping + support</p>
            <h2>Simple handling, direct answers</h2>
            <p>
              Orders above {toUsd(FREE_SHIPPING_THRESHOLD_CENTS)} ship free. Below that threshold, the store applies a
              flat shipping rate at checkout. Questions and returns route straight to Zevlin support.
            </p>
          </article>
        </div>
      </section>

      <section className="store-section product-support-band-section">
        <div className="store-frame product-support-band surface-card">
          <p className="store-rail-label">Need help before buying?</p>
          <h2>Email Zevlin support and get a direct answer.</h2>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="store-inline-link">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </section>

      <div className={showStickyBar ? "mobile-buy-bar is-visible" : "mobile-buy-bar"}>
        <div>
          <p>{product.name}</p>
          <span>{toUsd(product.priceCents)}</span>
        </div>
        <div className="mobile-buy-actions">
          <QuantityStepper value={quantity} onChange={setQuantity} compact />
          <button type="button" className="button-primary" onClick={handleAddToCart}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
