"use client";

import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "../lib/catalog";
import { toUsd } from "../lib/commerce";
import { useStore } from "./StoreProvider";

export default function ProductCard({
  product,
  featured = false,
}: {
  product: StoreProduct;
  featured?: boolean;
}) {
  const { addToCart, cart } = useStore();
  const inCart = cart.find((item) => item.productId === product.id);

  return (
    <article className={featured ? "surface-card product-card product-card-featured" : "surface-card product-card"}>
      <Link href={`/products/${product.slug}`} className="product-card-media-link" aria-label={product.name}>
        <div className="product-card-media">
          {featured ? <span className="product-card-feature-flag">Featured pick</span> : null}
          <span className="product-card-badge">{product.media.label}</span>
          <Image
            src={product.media.imagePath}
            alt={product.media.imageAlt}
            fill
            sizes="(min-width: 1200px) 26vw, (min-width: 768px) 42vw, 100vw"
            className="product-card-image"
          />
        </div>
      </Link>

      <div className="product-card-copy">
        <div className="product-card-heading-row">
          <div>
            <p className="product-card-label">{product.usageLabel}</p>
            <h2>{product.name}</h2>
          </div>
          <p className="product-card-price">{toUsd(product.priceCents)}</p>
        </div>
        <p className="product-card-description">{product.shortDescription}</p>
        <ul className="product-card-benefits">
          {(featured ? product.bestFor : product.benefits).slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {inCart ? <p className="product-card-meta">Already in bag: {inCart.quantity}</p> : null}
      </div>

      <div className="product-card-actions">
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
    </article>
  );
}
