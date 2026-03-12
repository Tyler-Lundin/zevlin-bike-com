import {
  getZevlinCatalogProduct,
  zevlinCatalog,
  type ZevlinCatalogProduct,
} from "@zevlin/contracts";
import { getShortDescription } from "./commerce";

export type StoreProduct = ZevlinCatalogProduct & {
  shortDescription: string;
  benefits: string[];
};

const storeProductMeta: Record<string, { shortDescription: string; benefits: string[] }> = {
  "crack-chamois-cream": {
    shortDescription: "A daily comfort cream for riders who want glide without the tingle.",
    benefits: [
      "Natural non-tingle comfort barrier",
      "Built for long training days and steady heat",
      "Tea tree, electric daisy, and witch hazel support",
    ],
  },
  "super-crack-chamois-cream": {
    shortDescription: "A minty-cooling version of Crack when the ride and the weather both turn up.",
    benefits: [
      "Cooling peppermint lift for hotter rides",
      "Same dependable barrier with extra freshness",
      "Ideal for hard sessions and summer training blocks",
    ],
  },
  "byot-fitness-wash": {
    shortDescription: "A no-shower cleanup spray for post-ride reset when you are moving fast.",
    benefits: [
      "Refresh on the road, at the gym, or between meetings",
      "Designed to pair with a towel for fast cleanup",
      "Easy carry format for glove box and gear bag",
    ],
  },
  "byot-towel": {
    shortDescription: "A compact towel that keeps cleanup simple when a full shower is not an option.",
    benefits: [
      "Small enough for every ride bag",
      "Fast cleanup companion for BYOT Fitness Wash",
      "Lightweight, practical, and easy to keep on hand",
    ],
  },
  "zevlin-gaiter": {
    shortDescription: "A flexible ride layer for cool starts, rough weather, and everyday Zevlin utility.",
    benefits: [
      "Wear it as a neck layer, face cover, or headband",
      "Lightweight enough for daily carry",
      "Simple all-weather backup for changing conditions",
    ],
  },
};

export const storeCatalog: StoreProduct[] = zevlinCatalog.map((product) => {
  const meta = storeProductMeta[product.slug] ?? {
    shortDescription: getShortDescription(product.description),
    benefits: ["Built for everyday Zevlin use"],
  };

  return {
    ...product,
    shortDescription: meta.shortDescription,
    benefits: meta.benefits,
  };
});

export function getStoreProduct(slug: string): StoreProduct | undefined {
  const product = getZevlinCatalogProduct(slug);
  if (!product) {
    return undefined;
  }

  return storeCatalog.find((item) => item.slug === product.slug);
}
