"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CreateOrderRequest } from "@zevlin/contracts";
import OrderSummaryPanel from "./OrderSummaryPanel";
import {
  createEmptyCheckoutDraft,
  useStore,
  type CheckoutDraft,
} from "./StoreProvider";
import { getShippingCents, getSubtotalCents, getTotalCents } from "../lib/commerce";

type AddressField = keyof CheckoutDraft["shippingAddress"];

function normalizeAddress(address: CheckoutDraft["shippingAddress"]) {
  return {
    name: address.name.trim(),
    phone: address.phone?.trim() || undefined,
    email: address.email?.trim() || undefined,
    address1: address.address1.trim(),
    address2: address.address2?.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim().toUpperCase(),
  };
}

function AddressFields({
  legend,
  address,
  onChange,
  requireEmail,
}: {
  legend: string;
  address: CheckoutDraft["shippingAddress"];
  onChange: (field: AddressField, value: string) => void;
  requireEmail: boolean;
}) {
  return (
    <fieldset className="address-fieldset">
      <legend>{legend}</legend>
      <div className="form-grid two-up">
        <label className="field-group">
          <span>Full name</span>
          <input value={address.name} onChange={(event) => onChange("name", event.target.value)} required />
        </label>
        <label className="field-group">
          <span>Phone</span>
          <input value={address.phone ?? ""} onChange={(event) => onChange("phone", event.target.value)} />
        </label>
      </div>

      <div className="form-grid two-up">
        <label className="field-group">
          <span>Email</span>
          <input
            type="email"
            value={address.email ?? ""}
            onChange={(event) => onChange("email", event.target.value)}
            required={requireEmail}
          />
        </label>
        <label className="field-group">
          <span>Country</span>
          <select value={address.country} onChange={(event) => onChange("country", event.target.value)}>
            <option value="US">United States</option>
          </select>
        </label>
      </div>

      <label className="field-group">
        <span>Address line 1</span>
        <input value={address.address1} onChange={(event) => onChange("address1", event.target.value)} required />
      </label>

      <label className="field-group">
        <span>Address line 2</span>
        <input value={address.address2 ?? ""} onChange={(event) => onChange("address2", event.target.value)} />
      </label>

      <div className="form-grid three-up">
        <label className="field-group">
          <span>City</span>
          <input value={address.city} onChange={(event) => onChange("city", event.target.value)} required />
        </label>
        <label className="field-group">
          <span>State</span>
          <input value={address.state} onChange={(event) => onChange("state", event.target.value)} required />
        </label>
        <label className="field-group">
          <span>ZIP code</span>
          <input value={address.postalCode} onChange={(event) => onChange("postalCode", event.target.value)} required />
        </label>
      </div>
    </fieldset>
  );
}

export default function CheckoutView({ cancelled = false }: { cancelled?: boolean }) {
  const {
    cart,
    hydrated,
    checkoutDraft,
    saveCheckoutDraft,
    setLastCheckout,
  } = useStore();
  const [draft, setDraft] = useState<CheckoutDraft>(createEmptyCheckoutDraft());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type CheckoutSessionResponse =
    | {
        orderId: string;
        checkoutUrl: string;
        error?: string;
      }
    | {
        error: string;
        checkoutUrl?: undefined;
        orderId?: undefined;
      };

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setDraft(checkoutDraft);
  }, [checkoutDraft, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveCheckoutDraft(draft);
  }, [draft, hydrated, saveCheckoutDraft]);

  const subtotalCents = useMemo(() => getSubtotalCents(cart), [cart]);
  const shippingCents = useMemo(() => getShippingCents(subtotalCents), [subtotalCents]);
  const totalCents = useMemo(() => getTotalCents(subtotalCents), [subtotalCents]);

  const updateShippingAddress = (field: AddressField, value: string) => {
    setDraft((current) => {
      const shippingAddress = {
        ...current.shippingAddress,
        [field]: value,
      };

      return {
        ...current,
        shippingAddress,
        billingAddress: current.sameAsShipping ? { ...shippingAddress } : current.billingAddress,
      };
    });
  };

  const updateBillingAddress = (field: AddressField, value: string) => {
    setDraft((current) => ({
      ...current,
      billingAddress: {
        ...current.billingAddress,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const shippingAddress = normalizeAddress(draft.shippingAddress);
      const billingAddress = draft.sameAsShipping
        ? { ...shippingAddress }
        : normalizeAddress(draft.billingAddress);
      const payload: CreateOrderRequest = {
        customerId: null,
        source: "store",
        shippingAddress,
        billingAddress,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPriceCents: item.priceCents,
        })),
      };

      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as CheckoutSessionResponse;

      if (!response.ok || !data.checkoutUrl || !data.orderId) {
        throw new Error(data.error ?? "Unable to create checkout session.");
      }

      setLastCheckout({
        orderId: data.orderId,
        items: cart,
        subtotalCents,
        shippingCents,
        totalCents,
        shippingAddress,
        billingAddress,
        createdAt: new Date().toISOString(),
      });

      window.location.assign(data.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to continue to checkout.");
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="page-stack">
        <div className="section-heading">
          <p className="section-kicker">Checkout</p>
          <h1>Preparing secure checkout.</h1>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page-stack">
        <div className="section-heading">
          <p className="section-kicker">Checkout</p>
          <h1>No items ready for checkout.</h1>
          <p className="section-body">Add products to the bag first, then return here for payment.</p>
        </div>
        <div className="surface-card empty-state-card">
          <Link href="/" className="button-primary">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <p className="section-kicker">Checkout</p>
        <h1>One clear step before payment.</h1>
        <p className="section-body">Enter shipping and billing details here, then finish securely in Stripe Checkout.</p>
      </div>

      {cancelled ? (
        <div className="surface-card status-banner">
          <p>You returned from Stripe. Your bag and address details are still here.</p>
        </div>
      ) : null}

      <section className="checkout-note-grid" aria-label="Checkout notes">
        <article className="surface-card checkout-note-card">
          <p className="section-kicker">Shipping</p>
          <h2>Free over threshold</h2>
          <p className="form-note">
            Orders above the free-shipping threshold move through checkout without added shipping cost.
          </p>
        </article>
        <article className="surface-card checkout-note-card">
          <p className="section-kicker">Returns</p>
          <h2>30-day policy</h2>
          <p className="form-note">Returns stay straightforward, visible, and routed into direct Zevlin support.</p>
        </article>
        <article className="surface-card checkout-note-card">
          <p className="section-kicker">Payment</p>
          <h2>Hosted Stripe flow</h2>
          <p className="form-note">Card entry and payment confirmation happen in Stripe after this step.</p>
        </article>
      </section>

      <form id="store-checkout-form" className="checkout-layout" onSubmit={handleSubmit}>
        <section className="surface-card checkout-form-card">
          <AddressFields
            legend="Shipping address"
            address={draft.shippingAddress}
            onChange={updateShippingAddress}
            requireEmail
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draft.sameAsShipping}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  sameAsShipping: event.target.checked,
                  billingAddress: event.target.checked
                    ? { ...current.shippingAddress }
                    : current.billingAddress,
                }))
              }
            />
            <span>Billing address is the same as shipping</span>
          </label>

          {!draft.sameAsShipping ? (
            <AddressFields
              legend="Billing address"
              address={draft.billingAddress}
              onChange={updateBillingAddress}
              requireEmail={false}
            />
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}
        </section>

        <OrderSummaryPanel
          title="Secure payment"
          items={cart}
          subtotalCents={subtotalCents}
          shippingCents={shippingCents}
          totalCents={totalCents}
          sticky
          note="Payment is completed in hosted Stripe Checkout. Taxes are not applied in this v1 flow."
          actionSlot={
            <button type="submit" className="button-primary button-block" disabled={submitting}>
              {submitting ? "Redirecting..." : "Continue to Stripe Checkout"}
            </button>
          }
        />
      </form>
    </div>
  );
}
