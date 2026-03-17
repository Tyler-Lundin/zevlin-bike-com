"use client";

import Image from "next/image";
import Link from "next/link";
import OrderSummaryPanel from "./OrderSummaryPanel";
import QuantityStepper from "./QuantityStepper";
import { useStore } from "./StoreProvider";
import {
  getFreeShippingProgress,
  getFreeShippingRemainingCents,
  getShippingCents,
  getSubtotalCents,
  getTotalCents,
  toUsd,
} from "../lib/commerce";

export default function CartView() {
  const { cart, hydrated, removeFromCart, updateQuantity } = useStore();

  if (!hydrated) {
    return (
      <div className="page-stack store-route-stack">
        <div className="store-frame section-heading">
          <p className="section-kicker">Bag</p>
          <h1>Preparing your bag.</h1>
        </div>
        <div className="store-frame surface-card empty-state-card">
          <p>Loading saved items...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page-stack store-route-stack">
        <div className="store-frame section-heading section-heading-wide">
          <p className="section-kicker">Bag</p>
          <h1>Your bag is clear.</h1>
          <p className="section-body">Add only what you need, then return here when you are ready to check out.</p>
        </div>
        <div className="store-frame surface-card empty-state-card">
          <Link href="/" className="button-primary">
            Return to catalog
          </Link>
        </div>
      </div>
    );
  }

  const subtotalCents = getSubtotalCents(cart);
  const shippingCents = getShippingCents(subtotalCents);
  const totalCents = getTotalCents(subtotalCents);
  const remaining = getFreeShippingRemainingCents(subtotalCents);
  const progress = getFreeShippingProgress(subtotalCents);

  return (
    <div className="page-stack store-route-stack">
      <div className="store-frame section-heading section-heading-wide cart-heading">
        <p className="section-kicker">Bag</p>
        <div className="cart-heading-row">
          <h1>Review the order.</h1>
          <Link href="/" className="button-secondary cart-heading-link">
            Keep shopping
          </Link>
        </div>
        <p className="section-body">Adjust quantities, confirm shipping progress, and move into secure checkout without friction.</p>
      </div>

      <div className="store-frame surface-card shipping-progress-banner">
        <div>
          <p>{remaining === 0 ? "Free shipping unlocked" : `${toUsd(remaining)} away from free shipping`}</p>
          <span>{remaining === 0 ? "Every item now clears the shipping threshold." : `${progress}% of the target reached`}</span>
        </div>
        <div className="shipping-progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="store-frame cart-layout">
        <section className="cart-items-list" aria-label="Bag items">
          {cart.map((item) => (
            <article key={item.productId} className="surface-card cart-item-card">
              <Link href={`/products/${item.slug}`} className="cart-item-media" aria-label={item.name}>
                <Image src={item.imagePath} alt={item.name} fill sizes="140px" className="cart-item-image" />
              </Link>
              <div className="cart-item-copy">
                <div className="cart-item-header">
                  <div>
                    <p className="cart-item-label">Zevlin lineup</p>
                    <h2>{item.name}</h2>
                    <p>{toUsd(item.priceCents)} each</p>
                  </div>
                  <strong>{toUsd(item.priceCents * item.quantity)}</strong>
                </div>
                <div className="cart-item-actions">
                  <QuantityStepper value={item.quantity} onChange={(value) => updateQuantity(item.productId, value)} />
                  <Link href={`/products/${item.slug}`} className="cart-item-link">
                    View product
                  </Link>
                  <button type="button" className="button-ghost" onClick={() => removeFromCart(item.productId)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <OrderSummaryPanel
          title="Checkout next"
          items={cart}
          subtotalCents={subtotalCents}
          shippingCents={shippingCents}
          totalCents={totalCents}
          showProgress
          sticky
          note="Stripe handles payment after the next step. Zevlin handles support directly."
          actionSlot={
            <Link href="/checkout" className="button-primary button-block">
              Proceed to checkout
            </Link>
          }
        />
      </div>
    </div>
  );
}
