import type { ReactNode } from "react";
import Image from "next/image";
import type { CartItem } from "./StoreProvider";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  getFreeShippingProgress,
  getFreeShippingRemainingCents,
  toUsd,
} from "../lib/commerce";

export default function OrderSummaryPanel({
  title,
  items,
  subtotalCents,
  shippingCents,
  totalCents,
  actionSlot,
  note,
  sticky = false,
  showProgress = false,
}: {
  title: string;
  items: CartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  actionSlot?: ReactNode;
  note?: string;
  sticky?: boolean;
  showProgress?: boolean;
}) {
  const progress = getFreeShippingProgress(subtotalCents);
  const remaining = getFreeShippingRemainingCents(subtotalCents);

  return (
    <aside className={sticky ? "surface-card order-summary is-sticky" : "surface-card order-summary"}>
      <div className="order-summary-head">
        <p className="section-kicker">Order summary</p>
        <h2>{title}</h2>
      </div>

      {showProgress ? (
        <div className="shipping-progress-card">
          <div className="shipping-progress-copy">
            <p>
              {remaining === 0
                ? `Free shipping unlocked at ${toUsd(FREE_SHIPPING_THRESHOLD_CENTS)}`
                : `${toUsd(remaining)} away from free shipping`}
            </p>
            <span>{progress}%</span>
          </div>
          <div className="shipping-progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <ul className="order-summary-list">
        {items.map((item) => (
          <li key={item.productId}>
            <div className="order-summary-thumb">
              <Image src={item.imagePath} alt={item.name} fill sizes="72px" className="order-summary-image" />
            </div>
            <div className="order-summary-line-copy">
              <p>{item.name}</p>
              <span>Qty {item.quantity}</span>
            </div>
            <strong>{toUsd(item.priceCents * item.quantity)}</strong>
          </li>
        ))}
      </ul>

      <dl className="order-summary-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{toUsd(subtotalCents)}</dd>
        </div>
        <div>
          <dt>Shipping</dt>
          <dd>{shippingCents === 0 ? "Free" : toUsd(shippingCents)}</dd>
        </div>
        <div className="order-summary-total-row">
          <dt>Total</dt>
          <dd>{toUsd(totalCents)}</dd>
        </div>
      </dl>

      {actionSlot ? <div className="order-summary-actions">{actionSlot}</div> : null}
      {note ? <p className="order-summary-note">{note}</p> : null}
    </aside>
  );
}
