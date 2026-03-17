import {
  getZevlinCatalogProduct,
  zevlinCatalog,
} from "@zevlin/db";
import type { ZevlinCatalogProduct } from "@zevlin/contracts";
import { getShortDescription } from "./commerce";

export type StoreProduct = ZevlinCatalogProduct & {
  shortDescription: string;
  benefits: string[];
  usageLabel: string;
  bestFor: string[];
  fieldNotes: string[];
};

const storeProductMeta: Record<
  string,
  {
    shortDescription: string;
    benefits: string[];
    usageLabel: string;
    bestFor: string[];
    fieldNotes: string[];
  }
> = {
  "crack-chamois-cream": {
    shortDescription: "A daily comfort cream for riders who want glide without the tingle.",
    usageLabel: "Daily ride comfort",
    benefits: [
      "Natural non-tingle comfort barrier",
      "Built for long training days and steady heat",
      "Tea tree, electric daisy, and witch hazel support",
    ],
    bestFor: [
      "Daily training and repeat mileage",
      "Riders who want comfort without a cooling hit",
      "Keeping friction management simple",
    ],
    fieldNotes: [
      "Best when used as a dependable everyday base layer for longer sessions.",
      "Built for riders who want the product to disappear into the ride instead of announcing itself.",
    ],
  },
  "super-crack-chamois-cream": {
    shortDescription: "A minty-cooling version of Crack when the ride and the weather both turn up.",
    usageLabel: "Hot ride relief",
    benefits: [
      "Cooling peppermint lift for hotter rides",
      "Same dependable barrier with extra freshness",
      "Ideal for hard sessions and summer training blocks",
    ],
    bestFor: [
      "Hot weather and higher-intensity sessions",
      "Longer rides where cooling matters",
      "Riders who want a fresher finish after the effort",
    ],
    fieldNotes: [
      "Keeps the core Zevlin barrier feel while adding a stronger cooling signal.",
      "The right pick when the conditions, intensity, or both are turned up.",
    ],
  },
  "byot-fitness-wash": {
    shortDescription: "A no-shower cleanup spray for post-ride reset when you are moving fast.",
    usageLabel: "Fast reset",
    benefits: [
      "Refresh on the road, at the gym, or between meetings",
      "Designed to pair with a towel for fast cleanup",
      "Easy carry format for glove box and gear bag",
    ],
    bestFor: [
      "Commutes, races, and between-stop cleanup",
      "When the ride ends but the day keeps going",
      "Keeping the bag stocked with a fast reset option",
    ],
    fieldNotes: [
      "Works best when you need a clean handoff from training to the rest of the day.",
      "Designed for the situations where a shower is not realistic, not as a gimmick add-on.",
    ],
  },
  "byot-towel": {
    shortDescription: "A compact towel that keeps cleanup simple when a full shower is not an option.",
    usageLabel: "Ride bag utility",
    benefits: [
      "Small enough for every ride bag",
      "Fast cleanup companion for BYOT Fitness Wash",
      "Lightweight, practical, and easy to keep on hand",
    ],
    bestFor: [
      "Ride bags, gym bags, and glove boxes",
      "Pairing with Zevlin cleanup spray",
      "Keeping post-ride cleanup practical instead of improvised",
    ],
    fieldNotes: [
      "Its job is simple utility: compact, easy to stash, and always ready when the ride ends away from home.",
      "Most useful when treated as part of a small post-ride reset kit.",
    ],
  },
  "zevlin-gaiter": {
    shortDescription: "A flexible ride layer for cool starts, rough weather, and everyday Zevlin utility.",
    usageLabel: "All-weather backup",
    benefits: [
      "Wear it as a neck layer, face cover, or headband",
      "Lightweight enough for daily carry",
      "Simple all-weather backup for changing conditions",
    ],
    bestFor: [
      "Cool starts and shifting conditions",
      "A simple extra layer that earns its spot in the pocket or bag",
      "Riders who want one accessory to solve multiple small problems",
    ],
    fieldNotes: [
      "Most valuable as a flexible backup piece rather than a one-use cold-weather item.",
      "The appeal is range: one layer, several practical jobs.",
    ],
  },
};

export const storeCatalog: StoreProduct[] = zevlinCatalog.map((product) => {
  const meta = storeProductMeta[product.slug] ?? {
    shortDescription: getShortDescription(product.description),
    benefits: ["Built for everyday Zevlin use"],
    usageLabel: "Zevlin lineup",
    bestFor: ["Built for everyday Zevlin use"],
    fieldNotes: ["Use this product where it best matches your ride-day need."],
  };

  return {
    ...product,
    shortDescription: meta.shortDescription,
    benefits: meta.benefits,
    usageLabel: meta.usageLabel,
    bestFor: meta.bestFor,
    fieldNotes: meta.fieldNotes,
  };
});

export function getStoreProduct(slug: string): StoreProduct | undefined {
  const product = getZevlinCatalogProduct(slug);
  if (!product) {
    return undefined;
  }

  return storeCatalog.find((item) => item.slug === product.slug);
}
