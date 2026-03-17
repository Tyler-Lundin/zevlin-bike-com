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
      <div className="page-stack store-route-stack">
        <div className="store-frame section-heading">
          <p className="section-kicker">Success</p>
          <h1>Loading confirmation.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack store-route-stack success-stack">
      <section className="store-frame surface-card success-hero-card">
        <p className="section-kicker">Success</p>
        <h1>Order received.</h1>
        <p className="section-body">
          {lastCheckout
            ? `Order ${lastCheckout.orderId} is now in the Zevlin checkout flow and ready for fulfillment follow-through.`
            : "Your checkout completed. If payment succeeded, Zevlin support will follow the order through fulfillment."}
        </p>
        <div className="success-actions">
          <Link href="/" className="button-primary">
            Continue shopping
          </Link>
          <a href={marketingSiteUrl} className="button-secondary">
            Return to Zevlin
          </a>
        </div>
      </section>

      <div className="store-frame success-detail-grid">
        <section className="surface-card success-reference-card">
          <p className="section-kicker">Reference</p>
          <h2>{lastCheckout ? lastCheckout.orderId : "Payment handoff complete"}</h2>
          <p>
            {lastCheckout
              ? "Keep this order reference for any support follow-up after payment confirmation."
              : "If you need help, reach out to Zevlin support with the email used during checkout."}
          </p>
        </section>

        <section className="surface-card success-next-card">
          <p className="section-kicker">Next steps</p>
          <h2>What happens now</h2>
          <ul className="success-checklist">
            <li>Stripe completes payment confirmation after the redirect.</li>
            <li>Zevlin support follows the order through fulfillment and tracking.</li>
            <li>Questions can go straight to support without a ticket chain.</li>
          </ul>
        </section>

        {lastCheckout ? (
          <OrderSummaryPanel
            title="Confirmation snapshot"
            items={lastCheckout.items}
            subtotalCents={lastCheckout.subtotalCents}
            shippingCents={lastCheckout.shippingCents}
            totalCents={lastCheckout.totalCents}
            note="This page is a customer-facing confirmation snapshot. Backend order processing finalizes payment state."
          />
        ) : null}
      </div>
    </div>
  );
}
