import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import TeamEventSignupForm from "../components/TeamEventSignupForm";
import { getTeamPageContent, getUpcomingTeamEvents, type TeamEvent, type TeamLink } from "../lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zevlin Cycling Team",
  description:
    "Structured rides, training sessions, and rider-backed community updates from the Zevlin Cycling Team.",
};

function formatDateLabel(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTimeLabel(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
  }).format(date);
}

function renderLink(link: TeamLink, className: string) {
  return (
    <Link key={`${link.label}-${link.href}`} href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function eventSourceLabel(event: TeamEvent): string {
  return event.source === "directus" ? "Live schedule" : "Team preview";
}

export default async function HomePage() {
  const [content, events] = await Promise.all([getTeamPageContent(), getUpcomingTeamEvents()]);
  const featuredEvent = events[0];
  const signupOptions = events.map((event) => ({
    id: event.id,
    label: `${formatDateLabel(event.eventDateIso)} · ${event.title}`,
  }));

  return (
    <div className="team-page">
      <header className="team-site-header">
        <div className="team-site-header-inner">
          <Link href={content.siteUrl} className="team-brand-lockup">
            <Image src={content.logoPath} alt="Zevlin Bike" width={52} height={52} className="team-brand-logo" />
            <span className="team-brand-copy">
              <span className="team-brand-name">{content.brandName}</span>
              <span className="team-brand-tagline">{content.brandTagline}</span>
            </span>
          </Link>

          <nav className="team-nav" aria-label="Team page">
            {content.navLinks
              .filter((link) => link.variant !== "primary")
              .map((link) => renderLink(link, "team-nav-link"))}
            {content.navLinks
              .filter((link) => link.variant === "primary")
              .map((link) => renderLink(link, "team-nav-cta"))}
          </nav>
        </div>
      </header>

      <section className="team-hero" aria-labelledby="team-hero-title">
        <div className="team-hero-copy">
          <p className="section-eyebrow">{content.hero.eyebrow}</p>
          <h1 id="team-hero-title" className="team-hero-title">
            {content.hero.headline}
          </h1>
          <p className="team-hero-deck">{content.hero.subheadline}</p>

          <div className="team-hero-actions">
            <Link href={content.hero.primaryCta.href} className="team-button-primary">
              {content.hero.primaryCta.label}
            </Link>
            <Link href={content.hero.secondaryCta.href} className="team-button-secondary">
              {content.hero.secondaryCta.label}
            </Link>
          </div>

          <ul className="team-hero-points" aria-label="Team highlights">
            {content.hero.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="team-hero-visual">
          <div className="team-hero-image-shell">
            <Image
              src={content.hero.imagePath}
              alt={content.hero.imageAlt}
              fill
              priority
              sizes="(min-width: 1100px) 40vw, 100vw"
              className="team-hero-image"
            />
          </div>

          <article className="team-highlight-card">
            <p className="section-eyebrow section-eyebrow-tight">{content.hero.featureLabel}</p>
            <p className="team-highlight-body">{content.hero.featureBody}</p>
            {featuredEvent ? (
              <div className="team-highlight-event">
                <span>{eventSourceLabel(featuredEvent)}</span>
                <strong>{featuredEvent.title}</strong>
                <p>
                  {formatDateLabel(featuredEvent.eventDateIso)} at {formatTimeLabel(featuredEvent.eventDateIso)} · {featuredEvent.location}
                </p>
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className="team-story-grid">
        <div className="team-story-copy">
          <p className="section-eyebrow">{content.positioning.eyebrow}</p>
          <h2 className="section-title">{content.positioning.title}</h2>
          <p className="section-body">{content.positioning.summary}</p>

          <div className="team-story-cards">
            {content.positioning.items.map((item) => (
              <article key={item.title} className="team-surface team-story-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="team-editorial-card">
          <div className="team-editorial-image-shell">
            <Image
              src={content.positioning.imagePath}
              alt={content.positioning.imageAlt}
              fill
              sizes="(min-width: 1100px) 34vw, 100vw"
              className="team-editorial-image"
            />
          </div>
          <p>{content.positioning.caption}</p>
        </aside>
      </section>

      <section className="team-proof-section">
        <p className="section-eyebrow">{content.proofStrip.eyebrow}</p>
        <h2 className="section-title">{content.proofStrip.title}</h2>
        <div className="team-proof-grid">
          {content.proofStrip.items.map((item) => (
            <article key={item.title} className="team-surface team-proof-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="team-feature-grid" aria-labelledby="featured-session-title">
        <article className="team-surface team-feature-copy">
          <p className="section-eyebrow">{content.featuredBlock.eyebrow}</p>
          <h2 id="featured-session-title" className="section-title">
            {featuredEvent?.title ?? content.featuredBlock.title}
          </h2>
          <p className="section-body">{featuredEvent?.description ?? content.featuredBlock.summary}</p>
          <ul className="team-bullet-list">
            {content.featuredBlock.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <Link href={content.featuredBlock.cta.href} className="team-inline-link">
            {content.featuredBlock.cta.label}
          </Link>
        </article>

        <article className="team-surface team-feature-meta">
          <div className="team-feature-meta-row">
            <span className="team-meta-label">Status</span>
            <span className="team-meta-value">{featuredEvent ? eventSourceLabel(featuredEvent) : "Schedule pending"}</span>
          </div>
          <div className="team-feature-meta-row">
            <span className="team-meta-label">Date</span>
            <span className="team-meta-value">{featuredEvent ? formatDateLabel(featuredEvent.eventDateIso) : "TBD"}</span>
          </div>
          <div className="team-feature-meta-row">
            <span className="team-meta-label">Time</span>
            <span className="team-meta-value">{featuredEvent ? formatTimeLabel(featuredEvent.eventDateIso) : "TBD"}</span>
          </div>
          <div className="team-feature-meta-row">
            <span className="team-meta-label">Location</span>
            <span className="team-meta-value">{featuredEvent?.location ?? "TBD"}</span>
          </div>
        </article>
      </section>

      <section id="upcoming" className="team-upcoming-section" aria-labelledby="team-upcoming-title">
        <p className="section-eyebrow">{content.upcoming.eyebrow}</p>
        <h2 id="team-upcoming-title" className="section-title">
          {content.upcoming.title}
        </h2>
        <p className="section-body team-upcoming-summary">{content.upcoming.summary}</p>

        <div className="team-events-grid">
          {events.map((event) => (
            <article key={event.id} className="team-surface team-event-card">
              <div className="team-event-topline">
                <p className="team-event-date">{formatDateLabel(event.eventDateIso)}</p>
                <span className="team-event-badge">{eventSourceLabel(event)}</span>
              </div>
              <h3>{event.title}</h3>
              <p className="team-event-time">{formatTimeLabel(event.eventDateIso)}</p>
              <p className="team-event-description">{event.description}</p>
              <p className="team-event-location">{event.location}</p>
              <Link href="#join" className="team-inline-link">
                Reserve this session
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="join" className="team-join-grid" aria-labelledby="team-join-title">
        <article className="team-surface team-join-copy">
          <p className="section-eyebrow">{content.joinSection.eyebrow}</p>
          <h2 id="team-join-title" className="section-title">
            {content.joinSection.title}
          </h2>
          <p className="section-body">{content.joinSection.summary}</p>
          <ul className="team-bullet-list">
            {content.joinSection.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="team-join-note">{content.joinSection.note}</p>
          <Link href={content.joinSection.contactCta.href} className="team-button-secondary">
            {content.joinSection.contactCta.label}
          </Link>
        </article>

        <article className="team-surface team-form-card">
          <TeamEventSignupForm events={signupOptions} />
        </article>
      </section>

      <section id="faq" className="team-faq-section" aria-labelledby="team-faq-title">
        <p className="section-eyebrow">{content.faq.eyebrow}</p>
        <h2 id="team-faq-title" className="section-title">
          {content.faq.title}
        </h2>
        <div className="team-faq-grid">
          {content.faq.items.map((item) => (
            <article key={item.question} className="team-surface team-faq-card">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="team-footer-cta">
        <div>
          <h2>{content.footer.title}</h2>
          <p>{content.footer.summary}</p>
        </div>
        <div className="team-footer-links">
          {content.footer.links.map((link) => renderLink(link, "team-footer-link"))}
        </div>
      </section>
    </div>
  );
}
