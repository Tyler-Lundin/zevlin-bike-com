"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import OrderSummaryPanel from "./OrderSummaryPanel";
import { useStore } from "./StoreProvider";

export default function SuccessView({ marketingSiteUrl }: { marketingSiteUrl: string }) {
  const { lastCheckout, hydrated, clearCart, clearCheckoutDraft } = useStore();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || !lastCheckout || clearedRef.current) {
      return;
    }

    clearCart();
    clearCheckoutDraft();
    clearedRef.current = true;
  }, [clearCart, clearCheckoutDraft, hydrated, lastCheckout]);

  if (!hydrated) {
    return (
      <div className="page-stack">
        <div className="section-heading">
          <p className="section-kicker">Success</p>
          <h1>Loading confirmation.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack success-stack">
      <section className="surface-card success-hero-card">
        <p className="section-kicker">Success</p>
        <h1>Order received.</h1>
        <p className="section-body">
          {lastCheckout
            ? `Order ${lastCheckout.orderId} has been handed off for secure payment and fulfillment.`
            : "Your checkout completed. If payment succeeded, Zevlin support will follow the order through fulfillment."}
        </p>
        <div className="success-actions">
          <Link href="/" className="button-primary">
            Continue shopping
          </Link>
          <a href={marketingSiteUrl} className="button-secondary">
            Return to main site
          </a>
        </div>
      </section>

      <div className="success-detail-grid">
        <section className="surface-card success-next-card">
          <p className="section-kicker">Next steps</p>
          <h2>What happens now</h2>
          <ul className="success-checklist">
            <li>Stripe handles payment confirmation after this handoff.</li>
            <li>Zevlin support follows the order through fulfillment and tracking.</li>
            <li>Use the main site or support email if anything looks off.</li>
          </ul>
        </section>

        {lastCheckout ? (
          <OrderSummaryPanel
            title="Confirmation snapshot"
            items={lastCheckout.items}
            subtotalCents={lastCheckout.subtotalCents}
            shippingCents={lastCheckout.shippingCents}
            totalCents={lastCheckout.totalCents}
            note="This page is a customer-facing confirmation snapshot. Payment status is finalized in backend order processing."
          />
        ) : null}
      </div>
    </div>
  );
}
