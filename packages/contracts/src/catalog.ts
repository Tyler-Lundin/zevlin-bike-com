export type ZevlinCatalogMedia = {
  imagePath: string;
  imageAlt: string;
  label: string;
};

export type ZevlinCatalogProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  slug: string;
  media: ZevlinCatalogMedia;
};

export const zevlinCatalog: ZevlinCatalogProduct[] = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Crack Chamois Cream",
    description:
      "Crack is our natural, non-tingle chamois cream formula designed for both the cooler riding days and for those who do not really need or want an extra kick in the chamois while they ride. Our crack chamois cream creates a comfortable barrier using tea tree leaf oil, electric daisy extract and organic witch hazel extract. All of which keep you soothed and protected so all you have to do is ride.",
    priceCents: 2399,
    slug: "crack-chamois-cream",
    media: {
      imagePath: "/images/products/crack-chamois-cream.svg",
      imageAlt: "Mock Zevlin poster art for Crack Chamois Cream",
      label: "Natural / non-tingle",
    },
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    name: "Super Crack Chamois Cream",
    description:
      "SuperCrack has the slightly tingly, cooling properties of peppermint oil, electric daisy extract and organic witch hazel extract added to our Crack formula, giving riders and their bits some extra relief when the temps are rising outside and inside their shorts during a workout, leaving them feeling minty fresh when the ride is done. Help you enjoy your ride from start to finish day after day.",
    priceCents: 2399,
    slug: "super-crack-chamois-cream",
    media: {
      imagePath: "/images/products/super-crack-chamois-cream.svg",
      imageAlt: "Mock Zevlin poster art for Super Crack Chamois Cream",
      label: "Cooling / race-day",
    },
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    name: "BYOT Fitness Wash",
    description:
      "No shower? No problem. Spray yourself down post-ride to clean up with just a towel. BYOT is your on-the-go refresh solution.",
    priceCents: 1499,
    slug: "byot-fitness-wash",
    media: {
      imagePath: "/images/products/byot-fitness-wash.svg",
      imageAlt: "Mock Zevlin poster art for BYOT Fitness Wash",
      label: "Post-ride refresh",
    },
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    name: "BYOT Towel",
    description:
      "Bring Your Own Towel. Compact, absorbent, and ready to get you cleaned up after a ride when a shower's out of reach.",
    priceCents: 299,
    slug: "byot-towel",
    media: {
      imagePath: "/images/products/byot-towel.svg",
      imageAlt: "Mock Zevlin poster art for BYOT Towel",
      label: "Pocket-size cleanup",
    },
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    name: "Zevlin Gaiter",
    description:
      "Multi-use microfiber gaiter: neck warmer, face shield, headband, or show off your Zevlin style however you wear it.",
    priceCents: 999,
    slug: "zevlin-gaiter",
    media: {
      imagePath: "/images/products/zevlin-gaiter.svg",
      imageAlt: "Mock Zevlin poster art for Zevlin Gaiter",
      label: "All-weather layer",
    },
  },
];

export function getZevlinCatalogProduct(slug: string): ZevlinCatalogProduct | undefined {
  return zevlinCatalog.find((product) => product.slug === slug);
}
