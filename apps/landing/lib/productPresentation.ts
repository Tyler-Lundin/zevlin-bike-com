import type { CSSProperties } from "react";

export function toUsd(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function getShortDescription(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (firstSentence) {
    return firstSentence;
  }

  return normalized.length > 168 ? `${normalized.slice(0, 165).trimEnd()}...` : normalized;
}

export function getProductMark(productName: string): string {
  const mark = productName
    .replace(/\b(Chamois|Cream|Fitness|Wash|Towel|Gaiter)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return mark || productName;
}

export function getProductTone(slug: string): CSSProperties {
  const toneMap: Record<string, { accent: string; accentStrong: string; glow: string }> = {
    "crack-chamois-cream": {
      accent: "#3cc7ff",
      accentStrong: "#0e5f98",
      glow: "rgba(60, 199, 255, 0.28)",
    },
    "super-crack-chamois-cream": {
      accent: "#ffb347",
      accentStrong: "#aa5f11",
      glow: "rgba(255, 179, 71, 0.24)",
    },
    "byot-fitness-wash": {
      accent: "#9dfbcb",
      accentStrong: "#2d8960",
      glow: "rgba(157, 251, 203, 0.22)",
    },
    "byot-towel": {
      accent: "#f9d275",
      accentStrong: "#ba7e16",
      glow: "rgba(249, 210, 117, 0.26)",
    },
    "zevlin-gaiter": {
      accent: "#d8b4ff",
      accentStrong: "#6a469d",
      glow: "rgba(216, 180, 255, 0.22)",
    },
  };
  const tone = toneMap[slug] ?? {
    accent: "#8fc4ff",
    accentStrong: "#31669c",
    glow: "rgba(143, 196, 255, 0.22)",
  };

  return {
    "--hero-accent": tone.accent,
    "--hero-accent-strong": tone.accentStrong,
    "--hero-glow": tone.glow,
  } as CSSProperties;
}
