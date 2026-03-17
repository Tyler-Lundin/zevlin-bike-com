"use client";

import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "../lib/catalog";
import { toUsd } from "../lib/commerce";
import { useStore } from "./StoreProvider";

export default function FeaturedProductStage({ product }: { product: StoreProduct }) {
  const { addToCart, cart } = useStore();
  const inCart = cart.find((item) => item.productId === product.id);

  return (
    <section className="store-section store-feature-section">
      <div className="store-frame store-feature-grid">
        <div className="store-feature-copy">
          <p className="section-kicker">Featured product</p>
          <h2>{product.name}</h2>
          <p className="section-body store-feature-deck">{product.shortDescription}</p>
          <ul className="store-inline-list">
            {product.bestFor.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="store-feature-actions">
            <Link href={`/products/${product.slug}`} className="button-secondary">
              View product
            </Link>
            <button
              type="button"
              className="button-primary"
              onClick={() =>
                addToCart({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  imagePath: product.media.imagePath,
                })
              }
            >
              {inCart ? "Add another" : "Add to bag"}
            </button>
          </div>
        </div>

        <div className="surface-card store-feature-stage">
          <div className="store-feature-meta">
            <span>{product.usageLabel}</span>
            <strong>{toUsd(product.priceCents)}</strong>
          </div>
          <Link href={`/products/${product.slug}`} className="store-feature-media" aria-label={product.name}>
            <span className="product-card-badge">{product.media.label}</span>
            <Image
              src={product.media.imagePath}
              alt={product.media.imageAlt}
              fill
              priority
              sizes="(min-width: 1200px) 46vw, 100vw"
              className="store-feature-image"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
