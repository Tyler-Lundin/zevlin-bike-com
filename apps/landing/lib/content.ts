import { type ZevlinCatalogProduct, zevlinCatalog } from "@zevlin/contracts";
import legacyInventoryData from "./legacy-inventory.json";

export type LandingLink = {
  label: string;
  href: string;
  variant?: "default" | "primary";
};

export type LandingProduct = ZevlinCatalogProduct;

export type LandingTestimonial = {
  name: string;
  title: string;
  quote: string;
  rating: number;
};

export type LandingFaqItem = {
  question: string;
  answer: string;
};

export type LandingInfoSection = {
  title: string;
  lines: string[];
};

export type LandingProofItem = {
  title: string;
  description: string;
};

export type LandingUseCaseItem = {
  title: string;
  description: string;
  productSlugs: string[];
};

export type LandingSupportItem = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
};

export type LandingContent = {
  brandName: string;
  brandTagline: string;
  logoPath: string;
  storeUrl: string;
  teamUrl: string;
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: LandingLink;
    secondaryCta: LandingLink;
    trustChips: string[];
    shippingBadge: string;
    featuredProductSlug: string;
    supportingProductSlugs: string[];
    microTestimonial: LandingTestimonial;
    backgroundImagePath: string;
  };
  navLinks: LandingLink[];
  products: LandingProduct[];
  proofStrip: {
    eyebrow: string;
    title: string;
    summary: string;
    items: LandingProofItem[];
  };
  productShowcase: {
    eyebrow: string;
    title: string;
    summary: string;
    primaryCta: LandingLink;
  };
  useCaseGuide: {
    eyebrow: string;
    title: string;
    summary: string;
    items: LandingUseCaseItem[];
  };
  teamTeaser: {
    eyebrow: string;
    title: string;
    summary: string;
    points: string[];
    imagePath: string;
    imageAlt: string;
    cta: LandingLink;
  };
  brandProof: {
    eyebrow: string;
    title: string;
    summary: string;
    paragraphs: string[];
    proofPoints: string[];
    quote: string;
    quoteBy: string;
    imagePath: string;
    imageAlt: string;
  };
  reviews: {
    eyebrow: string;
    title: string;
    summary: string;
    items: LandingTestimonial[];
  };
  supportHighlights: {
    eyebrow: string;
    title: string;
    summary: string;
    items: LandingSupportItem[];
    b2bCallout: {
      title: string;
      description: string;
      cta: LandingLink;
    };
  };
  faq: {
    title: string;
    subtitle: string;
    items: LandingFaqItem[];
  };
  footerCta: {
    eyebrow: string;
    title: string;
    summary: string;
    primaryCta: LandingLink;
    contactTitle: string;
    contactBody: string;
    contactLink: LandingLink;
    newsletterTitle: string;
    newsletterSubtitle: string;
    placeholder: string;
    buttonLabel: string;
    footerLinks: LandingLink[];
  };
  shipping: {
    title: string;
    subtitle: string;
    sections: LandingInfoSection[];
  };
  returns: {
    title: string;
    subtitle: string;
    points: string[];
    formFields: string[];
  };
  privacy: {
    title: string;
    updatedAt: string;
    summary: string[];
    contactEmail: string;
  };
  contact: {
    title: string;
    summary: string;
    email: string;
  };
};

type LegacyInventory = {
  data: {
    testimonials: Array<LandingTestimonial & { initials: string; bgColor: string }>;
  };
};

const legacyInventory = legacyInventoryData as LegacyInventory;
const legacyProducts: LandingProduct[] = zevlinCatalog;
const legacyTestimonials: LandingTestimonial[] = legacyInventory.data.testimonials.map((item) => ({
  name: item.name,
  title: item.title,
  quote: item.quote,
  rating: item.rating,
}));

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export async function getLandingContent(): Promise<LandingContent> {
  const storeUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_STORE_URL || "https://store.zevlinbike.com");
  const teamUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_TEAM_URL || "https://team.zevlinbike.com");

  return {
    brandName: "Zevlin Bike",
    brandTagline: "Goods for your goods",
    logoPath: "/images/logo.png",
    storeUrl,
    teamUrl,
    hero: {
      eyebrow: "Legacy energy, rebuilt for the long ride",
      headline: "Goods for your Goods",
      subheadline:
        "Natural rider-care formulas, a tighter store, and real human support for cyclists who would rather push watts than manage saddle misery.",
      primaryCta: { label: "Shop the store", href: storeUrl },
      secondaryCta: { label: "See the lineup", href: "#products" },
      trustChips: [
        "Free shipping on orders over $49",
        "30-day returns, opened or not",
        "Natural formulas tuned for real ride days",
        "Human support and a live rider community",
      ],
      shippingBadge: "Free shipping on orders over $49",
      featuredProductSlug: "crack-chamois-cream",
      supportingProductSlugs: ["super-crack-chamois-cream", "byot-fitness-wash"],
      microTestimonial: legacyTestimonials[0] ?? {
        name: "Zevlin Rider",
        title: "Verified Owner",
        quote: "Zevlin keeps the ride focused on the ride.",
        rating: 5,
      },
      backgroundImagePath: "/images/hero-image.png",
    },
    navLinks: [
      { label: "Products", href: "#products" },
      { label: "Guide", href: "#guide" },
      { label: "Team", href: "#team" },
      { label: "Support", href: "#support" },
      { label: "FAQ", href: "#faq" },
      { label: "Store", href: storeUrl, variant: "primary" },
    ],
    products: legacyProducts,
    proofStrip: {
      eyebrow: "Why Zevlin",
      title: "A smaller lineup with a sharper reason to exist.",
      summary:
        "Zevlin stays focused on the products riders actually use, backed by shipping, returns, and support that do not waste time.",
      items: [
        {
          title: "Ride-first comfort",
          description: "Friction control and recovery products built around real ride days, not generic skincare language.",
        },
        {
          title: "Natural by default",
          description: "The core lineup stays centered on natural, skin-friendly formulas riders can trust on repeat.",
        },
        {
          title: "No clutter catalog",
          description: "A fixed lineup keeps the decision-making simple whether you are replacing a favorite or trying Zevlin for the first time.",
        },
        {
          title: "Support that responds",
          description: "Returns, privacy requests, and product questions route into direct human workflows instead of disappearing into a black box.",
        },
      ],
    },
    productShowcase: {
      eyebrow: "The lineup",
      title: "Five essentials. No filler. Clear reasons to buy each one.",
      summary:
        "Every product on the homepage belongs here. The goal is straightforward: help riders choose quickly, then move them into the store with confidence.",
      primaryCta: { label: "Open the full store", href: storeUrl },
    },
    useCaseGuide: {
      eyebrow: "Pick the right product",
      title: "Start with the ride problem, not the catalog.",
      summary:
        "If you know the situation you are solving, the lineup gets small fast. This section should make the choice obvious in under a minute.",
      items: [
        {
          title: "Daily training comfort",
          description: "Choose the non-tingle formula when you want reliable glide and protection for steady mileage, trainer sessions, and everyday riding.",
          productSlugs: ["crack-chamois-cream"],
        },
        {
          title: "Heat, intensity, and longer sessions",
          description: "Choose the cooling formula when the ride, the weather, or the workout turns up and you want a fresher finish.",
          productSlugs: ["super-crack-chamois-cream"],
        },
        {
          title: "No-shower reset",
          description: "Keep a fast cleanup pair in the bag when the ride ends and the rest of the day starts immediately.",
          productSlugs: ["byot-fitness-wash", "byot-towel"],
        },
        {
          title: "Cool starts and changing weather",
          description: "Carry a flexible layer that can shift from neck coverage to face cover to everyday backup when conditions move around.",
          productSlugs: ["zevlin-gaiter"],
        },
      ],
    },
    teamTeaser: {
      eyebrow: "Zevlin Cycling Team",
      title: "Products backed by a real rider community.",
      summary:
        "Zevlin is not just a storefront. The team side of the brand is where rides, training sessions, and community momentum stay active.",
      points: [
        "Open sessions and team-led training blocks live in the dedicated team app.",
        "The team presence gives the brand real community proof beyond product claims.",
        "Riders can follow what is coming next without digging through social noise.",
      ],
      imagePath: "/images/about-hero-image.png",
      imageAlt: "Zevlin Cycling Team rider lifestyle image",
      cta: { label: "Explore the team", href: teamUrl },
    },
    brandProof: {
      eyebrow: "Brand proof",
      title: "Built by cyclists who care about comfort, not marketing theater.",
      summary:
        "The brand story should support the purchase decision, not distract from it. Zevlin exists to make long rides feel more manageable and customer support feel more direct.",
      paragraphs: [
        "Zevlin started from a simple rider problem: comfort products matter most when they disappear into the ride and just work.",
        "That same thinking now shapes the site, the store, and support operations. Keep the lineup focused, keep the tone honest, and keep the customer experience easy to trust.",
      ],
      proofPoints: [
        "Cyclist-built product decisions",
        "Support and policy surfaces designed to hold up under scrutiny",
        "Community and commerce pointed in the same direction",
      ],
      quote: "When the product, the support, and the brand all feel aligned, the rider notices it immediately.",
      quoteBy: "The Zevlin Team",
      imagePath: "/images/mission-hero-image.jpeg",
      imageAlt: "Zevlin brand and rider mission image",
    },
    reviews: {
      eyebrow: "Rider feedback",
      title: "The social proof should feel earned, not sprayed everywhere.",
      summary:
        "A smaller review strip works better here than a giant wall of praise. The point is to reinforce confidence, then get out of the way.",
      items: legacyTestimonials.slice(0, 3),
    },
    supportHighlights: {
      eyebrow: "Support and trust",
      title: "Everything after the purchase should feel just as clean.",
      summary:
        "Shipping, returns, privacy, and contact paths stay visible because serious brands do not hide the operational side of the business.",
      items: [
        {
          title: "Shipping",
          description: "Free shipping kicks in above $49, with direct policy details and tracking expectations clearly published.",
          href: "/shipping",
          linkLabel: "Read shipping policy",
        },
        {
          title: "Returns",
          description: "The 30-day return window is simple, visible, and backed by a live request flow instead of a dead inbox.",
          href: "/returns",
          linkLabel: "Start a return",
        },
        {
          title: "Privacy",
          description: "Privacy rights and customer data handling are presented like a serious business obligation, not fine print.",
          href: "/privacy/request",
          linkLabel: "Open privacy request",
        },
        {
          title: "Contact",
          description: "Questions, product help, and issue resolution route into a direct support channel with clear public contact paths.",
          href: "/contact",
          linkLabel: "Contact Zevlin",
        },
      ],
      b2bCallout: {
        title: "Retail, wholesale, and partnership inquiries",
        description: "B2B stays intentionally lightweight on the homepage. Shops and partners should start with a direct conversation, not a half-finished portal.",
        cta: { label: "Start the conversation", href: "/contact" },
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Clear answers for first-time buyers and repeat riders.",
      items: [
        {
          question: "Is this really a cream for my... you know?",
          answer:
            "Yes. Zevlin chamois creams are designed to reduce friction and protect sensitive areas on long rides.",
        },
        {
          question: "Is it safe for all skin types?",
          answer:
            "The core formulas are designed around natural, skin-friendly ingredients and everyday rider use cases.",
        },
        {
          question: "Do you offer discreet shipping?",
          answer:
            "Orders ship in plain packaging without loud exterior branding.",
        },
        {
          question: "What is your return policy?",
          answer:
            "Customers can request returns within 30 days, and Zevlin support walks the process forward directly.",
        },
        {
          question: "Can I use it off the bike?",
          answer:
            "Yes. The formulas can be used anywhere that benefits from additional glide or friction protection.",
        },
      ],
    },
    footerCta: {
      eyebrow: "Stay close",
      title: "Keep the store one click away and support even closer.",
      summary:
        "Use the footer as the final conversion checkpoint: one route into the store, one route into support, and one quiet path into the newsletter.",
      primaryCta: { label: "Go to the store", href: storeUrl },
      contactTitle: "Direct support",
      contactBody: "Questions, returns, and rider help route directly to Zevlin support.",
      contactLink: { label: "Open support", href: "/contact" },
      newsletterTitle: "Get the useful updates only",
      newsletterSubtitle: "New releases, ride tips, and important Zevlin updates without turning the homepage into a signup wall.",
      placeholder: "Your email address",
      buttonLabel: "Subscribe",
      footerLinks: [
        { label: "Shipping", href: "/shipping" },
        { label: "Returns", href: "/returns" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
        { label: "Team", href: teamUrl },
      ],
    },
    shipping: {
      title: "Shipping Information",
      subtitle: "How Zevlin packs, ships, and delivers your gear.",
      sections: [
        {
          title: "Processing Time",
          lines: ["Orders are typically processed and shipped within 1-2 business days."],
        },
        {
          title: "Shipping Methods",
          lines: ["USPS and UPS methods are shown at checkout based on destination."],
        },
        {
          title: "Estimated Delivery",
          lines: ["Domestic (U.S.): 2-5 business days", "International: 7-21 business days"],
        },
        {
          title: "Tracking",
          lines: [
            "Every shipped order includes email tracking so riders can monitor delivery in real time.",
          ],
        },
        {
          title: "Lost or Damaged Packages",
          lines: ["Contact zevlinbike@gmail.com and the team will make it right."],
        },
      ],
    },
    returns: {
      title: "Returns & Refunds",
      subtitle: "Hassle-free returns within 30 days.",
      points: [
        "Return any product within 30 days, including opened or used items.",
        "Support walks customers through the process directly.",
        "Refunds are issued back to the original payment card.",
      ],
      formFields: ["Order Number", "Name", "Email", "Additional Info (optional)"],
    },
    privacy: {
      title: "Customer Privacy Policy",
      updatedAt: "July 20, 2025",
      summary: [
        "Zevlin Bike, LLC does not buy or sell customer personal information.",
        "Data is collected only to operate the business with customer knowledge and consent.",
      ],
      contactEmail: "zevlinbike@gmail.com",
    },
    contact: {
      title: "Get in Touch",
      summary:
        "Questions, suggestions, or feedback are routed through Zevlin support so riders hear back quickly.",
      email: "zevlinbike@gmail.com",
    },
  };
}
