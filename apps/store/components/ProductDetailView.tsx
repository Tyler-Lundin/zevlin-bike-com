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
        threshold: 0.28,
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
    <div className="page-stack">
      <div className="page-breadcrumbs">
        <Link href="/">Catalog</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-detail-layout">
        <div className="surface-card product-stage-card">
          <div className="product-stage-media">
            <span className="product-stage-badge">{product.media.label}</span>
            <Image
              src={product.media.imagePath}
              alt={product.media.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="product-stage-image"
            />
          </div>
        </div>

        <div ref={buyBoxRef} className="surface-card product-buy-box">
          <p className="section-kicker">Product detail</p>
          <h1>{product.name}</h1>
          <p className="product-buy-summary">{product.shortDescription}</p>
          <p className="product-buy-price">{toUsd(product.priceCents)}</p>
          {inCart ? <p className="product-buy-meta">Currently in bag: {inCart.quantity}</p> : null}

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
              Review cart
            </Link>
          </div>

          <p className="buy-box-note">
            Free shipping over {toUsd(FREE_SHIPPING_THRESHOLD_CENTS)}. 30-day returns. Support at {SUPPORT_EMAIL}.
          </p>
        </div>
      </section>

      <section className="product-detail-panels">
        <article className="surface-card detail-panel">
          <p className="section-kicker">Overview</p>
          <h2>What it is</h2>
          <p>{product.description}</p>
        </article>

        <article className="surface-card detail-panel">
          <p className="section-kicker">Shipping</p>
          <h2>Simple fulfillment</h2>
          <p>
            Orders above {toUsd(FREE_SHIPPING_THRESHOLD_CENTS)} ship free. Below that threshold, the store applies
            a flat shipping rate at checkout.
          </p>
        </article>

        <article className="surface-card detail-panel">
          <p className="section-kicker">Support</p>
          <h2>Direct and human</h2>
          <p>
            Questions, returns, and product guidance route directly to Zevlin support without chatbots or layered handoffs.
          </p>
        </article>
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
