import legacyInventoryData from "./legacy-inventory.json";

export type LandingLink = {
  label: string;
  href: string;
};

export type LandingProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  slug: string;
};

export type LandingFeature = {
  title: string;
  description: string;
};

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

export type LandingFooterColumn = {
  title: string;
  links: LandingLink[];
};

export type LandingContent = {
  brandName: string;
  brandTagline: string;
  logoPath: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: LandingLink;
    secondaryCta: LandingLink;
    trustPoints: string[];
    freeShippingLabel: string;
    backgroundImagePath: string;
  };
  navLinks: LandingLink[];
  productsHeading: string;
  products: LandingProduct[];
  featuresHeading: string;
  features: LandingFeature[];
  testimonialsHeading: string;
  testimonials: LandingTestimonial[];
  cta: {
    title: string;
    subtitle: string;
    bulletPoints: string[];
    button: LandingLink;
  };
  newsletter: {
    title: string;
    subtitle: string;
    placeholder: string;
    buttonLabel: string;
  };
  about: {
    title: string;
    subtitle: string;
    paragraphs: string[];
    rideQuote: string;
    rideQuoteBy: string;
  };
  mission: {
    title: string;
    subtitle: string;
    pillars: Array<{ title: string; paragraphs: string[] }>;
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
  events: {
    title: string;
    summary: string;
  };
  blog: {
    title: string;
    subtitle: string;
    emptyState: string;
  };
  contact: {
    title: string;
    summary: string;
    email: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: LandingFaqItem[];
  };
  operations: {
    shippingOrigin: {
      name: string;
      phone: string;
      email: string;
      address1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  footerColumns: LandingFooterColumn[];
  source: {
    appPath: string;
    routes: string[];
  };
};

type LegacyInventoryPage = {
  route: string;
  category: string;
};

type LegacyInventory = {
  routeInventory: {
    pages: LegacyInventoryPage[];
  };
  data: {
    products: LandingProduct[];
    testimonials: Array<LandingTestimonial & { initials: string; bgColor: string }>;
  };
  navigation: {
    footerColumns: LandingFooterColumn[];
  };
};

const legacyInventory = legacyInventoryData as LegacyInventory;
const legacyMarketingRoutes = legacyInventory.routeInventory.pages
  .filter((page) => page.category === "marketing")
  .map((page) => page.route);
const legacyProducts = legacyInventory.data.products;
const legacyTestimonials: LandingTestimonial[] = legacyInventory.data.testimonials.map(
  (item) => ({
    name: item.name,
    title: item.title,
    quote: item.quote,
    rating: item.rating,
  }),
);
const onePageHrefMap: Record<string, string> = {
  "/products": "#products",
  "/products?category=cream": "#products",
  "/products?category=apparel": "#products",
  "/products?category=limited": "#products",
  "/contact": "#contact",
  "/faq": "#faq",
  "/shipping": "#support",
  "/returns": "#support",
  "/about": "#story",
  "/mission": "#story",
  "/privacy": "#support",
  "/blog": "#support",
};
const legacyFooterColumns = legacyInventory.navigation.footerColumns
  .filter((column) => column.title !== "🤫")
  .map((column) => ({
    title: column.title,
    links: column.links.map((link) => ({
      label: link.label,
      href: onePageHrefMap[link.href] ?? link.href,
    })),
  }));

const oldWebsiteLandingContent: LandingContent = {
  brandName: "Zevlin Bike",
  brandTagline: "Goods for your goods",
  logoPath: "/images/logo.png",
  hero: {
    eyebrow: "Legacy Homepage",
    title: "Goods for your Goods",
    subtitle:
      "Zevlin. Riding without it, is just nuts. Rebuilt from the old website with the same product copy, policy copy, and rider messaging.",
    primaryCta: { label: "Shop Zevlin Gear", href: "/store" },
    secondaryCta: { label: "View Full Support Details", href: "#support" },
    trustPoints: [
      "Free shipping on orders over $49",
      "30-day returns, opened or not",
      "Natural formulas for all-day ride comfort",
    ],
    freeShippingLabel: "Free Shipping on orders over $49",
    backgroundImagePath: "/images/hero-image.jpeg",
  },
  navLinks: [
    { label: "Home", href: "#home" },
    { label: "Products", href: "#products" },
    { label: "Benefits", href: "#benefits" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Support", href: "#support" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  productsHeading: "Ride Essentials, Perfected",
  products: legacyProducts,
  featuresHeading: "Why Cyclists Choose Zevlin Crack",
  features: [
    {
      title: "All-Day Comfort",
      description:
        "Reduces friction and helps prevent saddle sores so long rides stay comfortable.",
    },
    {
      title: "Skin Protection",
      description:
        "Creates a durable barrier to fight friction, chafing, and irritation on sensitive areas.",
    },
    {
      title: "Natural Formula",
      description:
        "Made with natural, non-tingle ingredients for daily riding and skin-friendly performance.",
    },
    {
      title: "Pro-Cyclist Approved",
      description:
        "Developed with and trusted by professional cyclists who need consistent race-level reliability.",
    },
  ],
  testimonialsHeading: "What Our Riders Say",
  testimonials: legacyTestimonials,
  cta: {
    title: "Ready for Your Smoothest Ride Yet?",
    subtitle:
      "Join thousands of riders who trust Zevlin for a chafe-free experience, ride after ride.",
    bulletPoints: ["Long-lasting comfort", "Made with natural ingredients"],
    button: { label: "Gear Up Now", href: "/store" },
  },
  newsletter: {
    title: "Unlock Your Edge: Join the Zevlin Crew!",
    subtitle:
      "Get cycling tips, early product releases, and members-only deals straight to your inbox.",
    placeholder: "Your email address",
    buttonLabel: "Subscribe Now",
  },
  about: {
    title: "Our Passion Fuels Your Ride",
    subtitle:
      "Zevlin Bike is built by cyclists who focus on comfort, protection, and high-performance skin care on every mile.",
    paragraphs: [
      "At Zevlin Bike, we are cyclists ourselves and deeply committed to enhancing every ride.",
      "Our mission started with one goal: deliver products engineered for comfort, protection, and performance.",
      "From innovative chamois creams to practical recovery gear, each product is tested through real riding experience.",
    ],
    rideQuote:
      "Every product we create at Zevlin Bike stems from a deep understanding of a cyclist's needs.",
    rideQuoteBy: "The Zevlin Team",
  },
  mission: {
    title: "Our Mission: Define Your Ride.",
    subtitle:
      "Empowering every cyclist through quality, performance, and a community-first culture.",
    pillars: [
      {
        title: "Excellence in Every Detail",
        paragraphs: [
          "We craft products that push boundaries and help riders crush goals across cycling, running, and hiking.",
          "Zevlin products are designed with purpose: enhance comfort, protect skin, and improve every ride.",
        ],
      },
      {
        title: "Community & Purpose",
        paragraphs: [
          "We are building a culture that is inclusive, diverse, and welcoming, just like a great group ride.",
          "We design with purpose, market with heart, and keep the fun in functional.",
        ],
      },
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
  events: {
    title: "Events & Rides",
    summary:
      "No upcoming events are listed yet. Riders are prompted to check back soon for the next group ride.",
  },
  blog: {
    title: "The Zevlin Blog",
    subtitle: "News, stories, and insights from the saddle.",
    emptyState: "No posts have been published yet. Check back soon.",
  },
  contact: {
    title: "Get in Touch",
    summary:
      "Questions, suggestions, or feedback are routed through Zevlin support so riders hear back quickly.",
    email: "zevlinbike@gmail.com",
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Real questions from real riders.",
    items: [
      {
        question: "Is this really a cream for my... you know?",
        answer:
          "Yes. Zevlin chamois creams are designed to reduce friction and protect sensitive areas on long rides.",
      },
      {
        question: "Is it safe for all skin types?",
        answer:
          "Yes. The formula uses natural, skin-friendly ingredients and is tested across many rider profiles.",
      },
      {
        question: "Do you offer discreet shipping?",
        answer:
          "Orders ship in plain packaging without flashy branding on the outside.",
      },
      {
        question: "What is your return policy?",
        answer:
          "Customers can request returns within 30 days and support helps make it right.",
      },
      {
        question: "Can I use it off the bike?",
        answer:
          "The formula can be used anywhere that needs additional glide or protection.",
      },
    ],
  },
  operations: {
    shippingOrigin: {
      name: "Zevlin Warehouse",
      phone: "123-456-7890",
      email: "shipping@zevlin.com",
      address1: "123 Warehouse Rd",
      city: "Columbus",
      state: "OH",
      postalCode: "43215",
      country: "US",
    },
  },
  footerColumns: [
    ...legacyFooterColumns,
    {
      title: "Trust",
      links: [
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
        { label: "Privacy Requests", href: "/privacy/request" },
      ],
    },
  ],
  source: {
    appPath: "apps/old_website",
    routes: legacyMarketingRoutes,
  },
};

export async function getLandingContent(): Promise<LandingContent> {
  return oldWebsiteLandingContent;
}
