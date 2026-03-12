export const FREE_SHIPPING_THRESHOLD_CENTS = 4900;
export const STANDARD_SHIPPING_CENTS = 500;
export const SUPPORT_EMAIL = "zevlinbike@gmail.com";

export function toUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getShortDescription(description: string, maxLength = 132): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (firstSentence && firstSentence.length <= maxLength) {
    return firstSentence;
  }

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 3).trimEnd()}...`
    : normalized;
}

type LineItemLike = {
  priceCents: number;
  quantity: number;
};

export function getCartCount<T extends LineItemLike>(items: T[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getSubtotalCents<T extends LineItemLike>(items: T[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

export function getShippingCents(subtotalCents: number): number {
  if (subtotalCents <= 0) {
    return 0;
  }

  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}

export function getTotalCents(subtotalCents: number): number {
  return subtotalCents + getShippingCents(subtotalCents);
}

export function getFreeShippingRemainingCents(subtotalCents: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
}

export function getFreeShippingProgress(subtotalCents: number): number {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return 100;
  }

  return Math.max(
    0,
    Math.min(100, Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100)),
  );
}
