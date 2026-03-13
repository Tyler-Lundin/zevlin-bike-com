export type B2bLink = {
  label: string;
  href: string;
  variant?: "default" | "primary";
};

export type B2bContent = {
  brandName: string;
  brandTagline: string;
  logoPath: string;
  siteUrl: string;
  storeUrl: string;
  contactUrl: string;
  contactEmail: string;
  navLinks: B2bLink[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: B2bLink;
    secondaryCta: B2bLink;
    metrics: Array<{
      label: string;
      value: string;
    }>;
  };
  audiences: {
    eyebrow: string;
    title: string;
    summary: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  support: {
    eyebrow: string;
    title: string;
    summary: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  reasons: {
    eyebrow: string;
    title: string;
    summary: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  inquiry: {
    eyebrow: string;
    title: string;
    summary: string;
    bullets: string[];
    note: string;
    contactCta: B2bLink;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  footer: {
    title: string;
    summary: string;
    links: B2bLink[];
  };
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export async function getB2bContent(): Promise<B2bContent> {
  const siteUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "https://www.zevlinbike.com");
  const storeUrl = trimTrailingSlash(
    process.env.NEXT_PUBLIC_STORE_URL || "https://store.zevlinbike.com",
  );
  const contactUrl = `${siteUrl}/contact`;

  return {
    brandName: "Zevlin B2B",
    brandTagline: "Wholesale, retail, and partnership inquiries.",
    logoPath: "/images/logo.png",
    siteUrl,
    storeUrl,
    contactUrl,
    contactEmail: "zevlinbike@gmail.com",
    navLinks: [
      { label: "Who we work with", href: "#audience" },
      { label: "What we support", href: "#support" },
      { label: "Apply", href: "#apply" },
      { label: "Shop store", href: storeUrl, variant: "primary" },
    ],
    hero: {
      eyebrow: "Inquiry-first, not portal-first",
      headline: "Partner with a focused rider-care brand.",
      subheadline:
        "Zevlin keeps B2B simple on purpose: a fixed lineup, direct communication, and a clear inquiry path for shops, partners, and community collaborators.",
      primaryCta: { label: "Start an inquiry", href: "#apply" },
      secondaryCta: { label: "View the consumer lineup", href: storeUrl },
      metrics: [
        { label: "Lineup", value: "5 focused products" },
        { label: "Route", value: "Direct review path" },
        { label: "Fit", value: "Retail + partnership ready" },
      ],
    },
    audiences: {
      eyebrow: "Who we work with",
      title: "The page is for serious conversations, not broad marketplace self-signup.",
      summary:
        "Right now the goal is simple: make it easy for the right buyers and collaborators to start a direct conversation with Zevlin without pretending there is already a full account system behind it.",
      items: [
        {
          title: "Independent bike shops",
          description:
            "Retailers who want a focused rider-care lineup and a direct path into product and support conversations.",
        },
        {
          title: "Select retailers",
          description:
            "Stores or specialty channels evaluating whether Zevlin fits their customer mix without needing a full wholesale portal first.",
        },
        {
          title: "Teams, clubs, and community partners",
          description:
            "Local groups, ride communities, and organizers looking at event support or collaborative placement.",
        },
      ],
    },
    support: {
      eyebrow: "What Zevlin can support",
      title: "A narrow, clear scope beats a bloated B2B claim set.",
      summary:
        "The point of this page is to capture the right conversations. Anything more complex than that should wait until the operating model is ready for it.",
      items: [
        {
          title: "Wholesale and retail placement",
          description:
            "Inquiry review for shops and retailers evaluating whether the Zevlin lineup belongs on their floor or site.",
        },
        {
          title: "Community and event partnerships",
          description:
            "Conversations around rides, training blocks, community support, or event-facing collaboration.",
        },
        {
          title: "Product and brand fit review",
          description:
            "A direct way to explain what Zevlin offers and whether the brand aligns with your rider base before anything formal happens.",
        },
      ],
    },
    reasons: {
      eyebrow: "Why partner",
      title: "Zevlin is easier to evaluate because the brand stays focused.",
      summary:
        "A smaller lineup, direct support posture, and visible rider/community layer make the business easier to understand than a catalog padded with noise.",
      items: [
        {
          title: "Focused lineup",
          description:
            "The catalog is intentionally small, which makes product education and placement simpler for both staff and riders.",
        },
        {
          title: "Rider-backed positioning",
          description:
            "The team and community side of Zevlin gives the brand real rider context instead of lifestyle-only marketing.",
        },
        {
          title: "Direct communication",
          description:
            "Support, partnership questions, and next steps route into clear human review rather than a faceless intake black box.",
        },
      ],
    },
    inquiry: {
      eyebrow: "Inquiry form",
      title: "Submit the essentials and let Zevlin review the fit.",
      summary:
        "This is an inquiry workflow, not an instant account approval system. Use it to start a serious wholesale, retail, or partnership conversation.",
      bullets: [
        "Share business type, contact details, and what kind of inquiry this is",
        "Include website and tax or resale info if it helps speed review",
        "Use direct contact for anything better handled by email first",
      ],
      note: "Submitting this form creates a reviewed application record. It does not create an account or guarantee approval.",
      contactCta: { label: "Email Zevlin directly", href: `mailto:zevlinbike@gmail.com` },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Before you submit",
      items: [
        {
          question: "Does this page create a wholesale account immediately?",
          answer:
            "No. This page starts a reviewed inquiry. Zevlin uses it to screen fit before any deeper account or quote workflow happens.",
        },
        {
          question: "Can I use this for event or team partnership requests?",
          answer:
            "Yes. The inquiry form supports community, event, and team-support discussions in addition to retail and wholesale conversations.",
        },
        {
          question: "Do I need a tax or resale ID to submit?",
          answer:
            "No. If you have one, include it. If not, submit the inquiry and explain the context in your notes.",
        },
        {
          question: "What if I just need to talk to someone first?",
          answer:
            "Use the direct contact path. The goal is clarity, not forcing every conversation through a form.",
        },
      ],
    },
    footer: {
      title: "A serious inquiry page should feel smaller than a storefront and clearer than a sales deck.",
      summary:
        "That is the point of this surface: give the right buyers and partners a clean way in, without pretending more system maturity than Zevlin actually has today.",
      links: [
        { label: "Back to Zevlin", href: siteUrl },
        { label: "Shop the store", href: storeUrl },
        { label: "Contact support", href: contactUrl },
      ],
    },
  };
}
