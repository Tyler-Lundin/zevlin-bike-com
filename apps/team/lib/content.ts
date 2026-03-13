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
  const storeUrl = trimTrailingSlash(
    process.env.NEXT_PUBLIC_STORE_URL || "https://store.zevlinbike.com",
  );
  const teamUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_TEAM_URL || "https://team.zevlinbike.com");
  const contactUrl = `${siteUrl}/contact`;

  return {
    brandName: "Zevlin Cycling Team",
    brandTagline: "Rides, training, and rider-backed brand credibility.",
    logoPath: "/images/logo.png",
    siteUrl,
    storeUrl,
    teamUrl,
    contactUrl,
    contactEmail: "zevlinbike@gmail.com",
    navLinks: [
      { label: "Upcoming", href: "#upcoming" },
      { label: "Join", href: "#join" },
      { label: "FAQ", href: "#faq" },
      { label: "Shop store", href: storeUrl, variant: "primary" },
    ],
    hero: {
      eyebrow: "Community rides, training sessions, and ride-day support",
      headline: "Ride with the Zevlin Cycling Team.",
      subheadline:
        "A serious local riding group built around consistent sessions, better habits, and products tested by riders who actually put in the miles.",
      points: [
        "Open ride calendar with structured sessions",
        "Real rider feedback loop into the Zevlin lineup",
        "Direct team contact instead of generic community fluff",
      ],
      primaryCta: { label: "See upcoming sessions", href: "#upcoming" },
      secondaryCta: { label: "Reserve a spot", href: "#join" },
      imagePath: "/images/team-hero.png",
      imageAlt: "Cyclist riding through a turn in Zevlin team hero art.",
      featureLabel: "What riders get",
      featureBody:
        "Clear session formats, consistent communication, and a rider-first tone that feels more like a real team than a marketing stunt.",
    },
    positioning: {
      eyebrow: "What the team is",
      title: "A riding community with more structure than a casual group ride, and less ego than a race-only program.",
      summary:
        "The Zevlin Cycling Team exists to create repeatable riding touchpoints: open sessions, training-focused events, community accountability, and honest product feedback from riders who are actually out there doing the work.",
      items: [
        {
          title: "Open where it makes sense",
          body:
            "Public-facing sessions lower the barrier to join, while communication stays clear about what is open, paced, or limited.",
        },
        {
          title: "Training, not theater",
          body:
            "The emphasis is consistency, pacing, handling, and ride-day confidence rather than performative hype or empty club branding.",
        },
        {
          title: "Brand proof through real use",
          body:
            "The team gives Zevlin a feedback loop rooted in actual ride conditions, not abstract product claims or lifestyle copy.",
        },
      ],
      imagePath: "/images/team-community.jpeg",
      imageAlt: "Editorial lifestyle image representing the Zevlin cycling community.",
      caption: "Community rides, session discipline, and rider-first product feedback all belong in the same system.",
    },
    proofStrip: {
      eyebrow: "Why it matters",
      title: "The team strengthens the brand because it creates real rider contact, not just brand aesthetics.",
      items: [
        {
          title: "Consistent sessions",
          description:
            "A team page is only credible if riders can see that the rhythm of rides and training actually exists.",
        },
        {
          title: "Local rider community",
          description:
            "The public team surface gives riders a reason to stay connected to Zevlin beyond a one-time purchase.",
        },
        {
          title: "Faster product feedback",
          description:
            "Real riders surface friction, comfort, and recovery insights faster than passive customer comments ever will.",
        },
      ],
    },
    featuredBlock: {
      eyebrow: "Featured session",
      title: "A structured ride should tell you what to expect before you clip in.",
      summary:
        "Each featured session should communicate format, intensity, location, and the kind of rider it is best for. That keeps the team approachable without making it vague.",
      bullets: [
        "Clear pace and format expectations",
        "Regroup logic or intensity notes where relevant",
        "Direct route or location information",
      ],
      cta: { label: "Reserve a spot", href: "#join" },
    },
    upcoming: {
      eyebrow: "Upcoming sessions",
      title: "The next rides on deck",
      summary:
        "Use this section to see what is coming up next. Live events appear automatically when team content is available, with clean fallback sessions when it is not.",
    },
    joinSection: {
      eyebrow: "Join or inquire",
      title: "Reserve a session without turning this into a complicated membership flow.",
      summary:
        "The fastest credible version is simple: pick an upcoming session, send your details, and let the team follow up like humans instead of forcing a full account system too early.",
      points: [
        "Select the ride or session you want",
        "Share the essentials so the team can reply directly",
        "Use contact for broader team, sponsor, or collaboration questions",
      ],
      contactCta: { label: "Contact the team", href: contactUrl },
      note: "Submitting this form sends a signup request to the team intake workflow. No payment is required here.",
    },
    faq: {
      eyebrow: "Rider expectations",
      title: "Common questions before riders show up",
      items: [
        {
          question: "Do I need to race to ride with the team?",
          answer:
            "No. The team is built around structured riding and community accountability, not only race-day participation.",
        },
        {
          question: "Are sessions open to new riders?",
          answer:
            "Some sessions are openly accessible and some may have pacing or participation expectations. The page should make that clear before signup.",
        },
        {
          question: "What kind of riding does the team focus on?",
          answer:
            "Expect a mix of endurance sessions, group skills, pace work, and ride-day support depending on the published schedule.",
        },
        {
          question: "What if I want to talk about partnerships or support instead?",
          answer:
            "Use the direct contact path for sponsor, partnership, media, or broader team questions so the right person can respond.",
        },
      ],
    },
    footer: {
      title: "More than a calendar, less than a vanity project.",
      summary:
        "The team should reinforce why Zevlin is credible: riders, products, support, and community all pointing in the same direction.",
      links: [
        { label: "Back to Zevlin", href: siteUrl },
        { label: "Shop the store", href: storeUrl },
        { label: "Contact support", href: contactUrl },
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

    const normalized = rows
      .map(normalizeEvent)
      .filter((event): event is TeamEvent => event !== null);

    if (normalized.length > 0) {
      return normalized;
    }

    return fallbackEvents;
  } catch {
    return fallbackEvents;
  }
}
