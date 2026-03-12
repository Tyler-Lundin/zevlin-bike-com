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
      <div className="page-stack">
        <div className="section-heading">
          <p className="section-kicker">Cart</p>
          <h1>Preparing your bag.</h1>
        </div>
        <div className="surface-card empty-state-card">
          <p>Loading saved items...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page-stack">
        <div className="section-heading">
          <p className="section-kicker">Cart</p>
          <h1>Your bag is empty.</h1>
          <p className="section-body">Keep it simple. Add the products you actually need and check out when you are ready.</p>
        </div>
        <div className="surface-card empty-state-card">
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
    <div className="page-stack">
      <div className="section-heading">
        <p className="section-kicker">Cart</p>
        <h1>Review the bag.</h1>
        <p className="section-body">Minimal summary, direct controls, and no interruptions.</p>
      </div>

      <div className="surface-card shipping-progress-banner">
        <div>
          <p>{remaining === 0 ? "Free shipping unlocked" : `${toUsd(remaining)} away from free shipping`}</p>
          <span>{progress}% of target reached</span>
        </div>
        <div className="shipping-progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="cart-layout">
        <section className="cart-items-list">
          {cart.map((item) => (
            <article key={item.productId} className="surface-card cart-item-card">
              <div className="cart-item-media">
                <Image src={item.imagePath} alt={item.name} fill sizes="120px" className="cart-item-image" />
              </div>
              <div className="cart-item-copy">
                <div className="cart-item-header">
                  <div>
                    <h2>{item.name}</h2>
                    <p>{toUsd(item.priceCents)} each</p>
                  </div>
                  <strong>{toUsd(item.priceCents * item.quantity)}</strong>
                </div>
                <div className="cart-item-actions">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(value) => updateQuantity(item.productId, value)}
                  />
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <OrderSummaryPanel
          title="Ready to checkout"
          items={cart}
          subtotalCents={subtotalCents}
          shippingCents={shippingCents}
          totalCents={totalCents}
          showProgress
          sticky
          note="Checkout continues to Stripe for secure payment."
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
