import { directusClient } from "@zevlin/integrations";

export type TeamLink = {
  label: string;
  href: string;
  variant?: "default" | "primary";
};

export type TeamEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDateIso: string;
  source: "directus" | "fallback";
};

export type TeamPageContent = {
  brandName: string;
  brandTagline: string;
  logoPath: string;
  siteUrl: string;
  storeUrl: string;
  teamUrl: string;
  contactUrl: string;
  contactEmail: string;
  navLinks: TeamLink[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    points: string[];
    primaryCta: TeamLink;
    secondaryCta: TeamLink;
    imagePath: string;
    imageAlt: string;
    featureLabel: string;
    featureBody: string;
  };
  positioning: {
    eyebrow: string;
    title: string;
    summary: string;
    items: Array<{
      title: string;
      body: string;
    }>;
    imagePath: string;
    imageAlt: string;
    caption: string;
  };
  proofStrip: {
    eyebrow: string;
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  featuredBlock: {
    eyebrow: string;
    title: string;
    summary: string;
    bullets: string[];
    cta: TeamLink;
  };
  upcoming: {
    eyebrow: string;
    title: string;
    summary: string;
  };
  joinSection: {
    eyebrow: string;
    title: string;
    summary: string;
    points: string[];
    contactCta: TeamLink;
    note: string;
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
    links: TeamLink[];
  };
};

type DirectusTeamEvent = {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  event_date?: string;
};

const fallbackEvents: TeamEvent[] = [
  {
    id: "8d9d313f-5744-4f7a-b98d-1a7d0b990001",
    title: "Saturday Endurance Rollout",
    description:
      "A steady endurance ride with regroup points, fueling stops, and route support for riders building repeatable volume.",
    location: "Scioto Trail Loop",
    eventDateIso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    source: "fallback",
  },
  {
    id: "8d9d313f-5744-4f7a-b98d-1a7d0b990002",
    title: "Midweek Pace Line Session",
    description:
      "High-attention paceline work, cornering rhythm, and short controlled efforts for riders sharpening group skills.",
    location: "Downtown Riverfront Circuit",
    eventDateIso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    source: "fallback",
  },
  {
    id: "8d9d313f-5744-4f7a-b98d-1a7d0b990003",
    title: "Climbing Repeats Morning Block",
    description:
      "Structured hill efforts with pacing guidance, recovery windows, and post-session rider check-ins.",
    location: "Quarry Hill Access Road",
    eventDateIso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    source: "fallback",
  },
];

function normalizeEvent(row: DirectusTeamEvent): TeamEvent | null {
  if (!row.id || !row.title || !row.description || !row.event_date) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location ?? "TBD",
    eventDateIso: row.event_date,
    source: "directus",
  };
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export async function getTeamPageContent(): Promise<TeamPageContent> {
  const siteUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "https://www.zevlinbike.com");
  const storeUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_STORE_URL || "https://store.zevlinbike.com");
  const teamUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_TEAM_URL || "https://team.zevlinbike.com");
  const contactUrl = `${siteUrl}/contact`;

  return {
    brandName: "Cycling Team",
    brandTagline: "Structured rides. Serious community.",
    logoPath: "/images/logo.png",
    siteUrl,
    storeUrl,
    teamUrl,
    contactUrl,
    contactEmail: "zevlinbike@gmail.com",
    navLinks: [
      { label: "What it is", href: "#what-it-is" },
      { label: "Sessions", href: "#sessions" },
      { label: "Join", href: "#join" },
      { label: "FAQ", href: "#faq" },
      { label: "Join a session", href: "#join", variant: "primary" },
    ],
    hero: {
      eyebrow: "Zevlin Cycling Team",
      headline: "Structured rides for riders who actually want to keep showing up.",
      subheadline:
        "Open sessions, better pacing, real accountability, and a brand community built around consistent miles rather than club theatrics.",
      points: [
        "Endurance, skills, and pace work with clear expectations",
        "Open sessions with direct human follow-up",
        "Product feedback grounded in actual ride days",
      ],
      primaryCta: { label: "Reserve a session", href: "#join" },
      secondaryCta: { label: "See upcoming sessions", href: "#upcoming" },
      imagePath: "/images/team-hero.png",
      imageAlt: "Cyclist riding through a turn in Zevlin team hero art.",
      featureLabel: "What riders get",
      featureBody:
        "Session format, ride expectations, and the next step should all be clear before a rider commits.",
    },
    positioning: {
      eyebrow: "What the team is",
      title: "A riding group with more structure than a casual meetup and less ego than a race-only program.",
      summary:
        "The Zevlin Cycling Team is designed to keep riders connected through repeatable sessions, clear communication, and honest feedback loops from people who actually ride.",
      items: [
        {
          title: "Open when it makes sense",
          body: "Public-facing sessions lower the barrier to join, while the page stays clear about pace, structure, and rider expectations.",
        },
        {
          title: "Training over theater",
          body: "The emphasis is consistency, handling, pacing, and ride-day confidence rather than empty club branding or false prestige.",
        },
        {
          title: "Real feedback loop",
          body: "The team keeps Zevlin connected to actual ride conditions so the brand stays grounded in use, not just aesthetics.",
        },
      ],
      imagePath: "/images/team-community.jpeg",
      imageAlt: "Editorial lifestyle image representing the Zevlin cycling community.",
      caption: "The team is where riding discipline, community credibility, and product feedback meet in public.",
    },
    proofStrip: {
      eyebrow: "Session rhythm",
      title: "The team matters because the riding system is visible, repeatable, and easy to understand.",
      items: [
        {
          title: "Endurance sessions",
          description: "Longer steady rides build repeatable volume and give new riders a clear place to start.",
        },
        {
          title: "Skills and pace work",
          description: "Group handling, paceline rhythm, and short efforts are explained before riders commit.",
        },
        {
          title: "Direct communication",
          description: "Riders hear from humans, not a membership stack, when plans shift or follow-up is needed.",
        },
        {
          title: "Brand proof through use",
          description: "Products and support stay tied to real ride days instead of abstract marketing claims.",
        },
      ],
    },
    featuredBlock: {
      eyebrow: "Featured session",
      title: "A session should tell riders the pace, format, and expectation before they clip in.",
      summary: "The featured block exists to explain what the next ride feels like, not just when it starts.",
      bullets: [
        "Clear pacing and regroup expectations",
        "Location and format before signup",
        "Simple next step into the join flow",
      ],
      cta: { label: "Reserve a session", href: "#join" },
    },
    upcoming: {
      eyebrow: "Upcoming",
      title: "The next sessions on deck",
      summary: "Use this section to scan what is coming up next without digging through noisy event chrome.",
    },
    joinSection: {
      eyebrow: "Join or inquire",
      title: "Send one request and the team follows up directly.",
      summary:
        "Pick the session that fits, send the essentials, and let the team respond like humans instead of forcing a full account system too early.",
      points: [
        "Choose the session you want",
        "Share the essentials for follow-up",
        "Use contact for sponsor, media, or broader team questions",
      ],
      contactCta: { label: "Email the team", href: contactUrl },
      note: "Submitting this form sends a signup request to the team intake workflow. No payment is required here.",
    },
    faq: {
      eyebrow: "Rider expectations",
      title: "Common questions before riders show up.",
      items: [
        {
          question: "Do I need to race to ride with the team?",
          answer: "No. The team is built around structured riding and community accountability, not race-only participation.",
        },
        {
          question: "Are sessions open to new riders?",
          answer: "Some sessions are openly accessible and some may have pacing expectations. The page should make that visible before signup.",
        },
        {
          question: "What kind of riding does the team focus on?",
          answer: "Expect a mix of endurance sessions, group skills, pace work, and ride-day support depending on the published schedule.",
        },
        {
          question: "What if I need to ask about support or partnerships instead?",
          answer: "Use the direct contact path for sponsor, partnership, media, or broader team questions so the right person can respond.",
        },
      ],
    },
    footer: {
      title: "Built for riders, not club theater.",
      summary: "The team should reinforce why Zevlin feels credible: riders, products, support, and community all moving in the same direction.",
      links: [
        { label: "Back to Zevlin", href: siteUrl },
        { label: "Shop the store", href: storeUrl },
        { label: "Contact the team", href: contactUrl },
      ],
    },
  };
}

export async function getUpcomingTeamEvents(): Promise<TeamEvent[]> {
  try {
    const rows = await directusClient.listItems<DirectusTeamEvent>("team_events", {
      fields: ["id", "title", "description", "location", "event_date"],
      filter: {
        event_date: {
          _gte: new Date().toISOString(),
        },
      },
      sort: ["event_date"],
      limit: 6,
    });

    const normalized = rows.map(normalizeEvent).filter((event): event is TeamEvent => event !== null);

    if (normalized.length > 0) {
      return normalized;
    }

    return fallbackEvents;
  } catch {
    return fallbackEvents;
  }
}
