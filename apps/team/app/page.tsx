import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import TeamEventSignupForm from "../components/TeamEventSignupForm";
import TeamNav from "../components/TeamNav";
import { getTeamPageContent, getUpcomingTeamEvents } from "../lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zevlin Cycling Team",
  description: "Structured rides, training sessions, and rider-backed community updates from the Zevlin Cycling Team.",
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

export default async function HomePage() {
  const [content, events] = await Promise.all([getTeamPageContent(), getUpcomingTeamEvents()]);
  const featuredEvent = events[0];
  const signupOptions = events.map((event) => ({
    id: event.id,
    label: `${formatDateLabel(event.eventDateIso)} · ${event.title}`,
  }));

  return (
    <div className="team-page">
      <TeamNav
        brandName={content.brandName}
        brandTagline={content.brandTagline}
        logoPath={content.logoPath}
        siteUrl={content.siteUrl}
        navLinks={content.navLinks}
      />

      <section className="team-section team-hero-section" aria-labelledby="team-hero-title">
        <div className="team-frame team-hero-grid">
          <div className="team-hero-copy">
            <p className="team-section-kicker">{content.hero.eyebrow}</p>
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
                sizes="(min-width: 1100px) 48vw, 100vw"
                className="team-hero-image"
              />
            </div>

            <article className="team-surface team-hero-note">
              <p className="team-section-kicker team-section-kicker-tight">{content.hero.featureLabel}</p>
              <p className="team-hero-note-body">{content.hero.featureBody}</p>
              {featuredEvent ? (
                <div className="team-hero-note-grid">
                  <div>
                    <span>Date</span>
                    <strong>{formatDateLabel(featuredEvent.eventDateIso)}</strong>
                  </div>
                  <div>
                    <span>Time</span>
                    <strong>{formatTimeLabel(featuredEvent.eventDateIso)}</strong>
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>{featuredEvent.location}</strong>
                  </div>
                </div>
              ) : null}
            </article>
          </div>
        </div>
      </section>

      <section id="what-it-is" className="team-section team-editorial-section">
        <div className="team-frame team-editorial-grid">
          <div className="team-section-intro">
            <p className="team-section-kicker">{content.positioning.eyebrow}</p>
            <h2 className="team-section-title">{content.positioning.title}</h2>
            <p className="team-section-body">{content.positioning.summary}</p>
          </div>

          <aside className="team-surface team-editorial-card">
            <div className="team-editorial-image-shell">
              <Image
                src={content.positioning.imagePath}
                alt={content.positioning.imageAlt}
                fill
                sizes="(min-width: 1100px) 36vw, 100vw"
                className="team-editorial-image"
              />
            </div>
            <p>{content.positioning.caption}</p>
          </aside>
        </div>

        <div className="team-frame team-editorial-cards">
          {content.positioning.items.map((item) => (
            <article key={item.title} className="team-surface team-editorial-copy-card">
              <p className="team-label">Team structure</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="sessions" className="team-section team-proof-section">
        <div className="team-frame team-section-intro">
          <p className="team-section-kicker">{content.proofStrip.eyebrow}</p>
          <h2 className="team-section-title">{content.proofStrip.title}</h2>
        </div>

        <div className="team-frame team-proof-grid">
          {content.proofStrip.items.map((item) => (
            <article key={item.title} className="team-surface team-proof-card">
              <p className="team-label">Session rhythm</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="team-section team-feature-section" aria-labelledby="featured-session-title">
        <div className="team-frame team-feature-grid">
          <article className="team-surface team-feature-copy">
            <p className="team-section-kicker">{content.featuredBlock.eyebrow}</p>
            <h2 id="featured-session-title" className="team-section-title">
              {featuredEvent?.title ?? content.featuredBlock.title}
            </h2>
            <p className="team-section-body">{featuredEvent?.description ?? content.featuredBlock.summary}</p>
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
              <span className="team-meta-label">Session</span>
              <strong className="team-meta-value">{featuredEvent ? "Upcoming ride" : "Schedule pending"}</strong>
            </div>
            <div className="team-feature-meta-row">
              <span className="team-meta-label">Date</span>
              <strong className="team-meta-value">{featuredEvent ? formatDateLabel(featuredEvent.eventDateIso) : "TBD"}</strong>
            </div>
            <div className="team-feature-meta-row">
              <span className="team-meta-label">Time</span>
              <strong className="team-meta-value">{featuredEvent ? formatTimeLabel(featuredEvent.eventDateIso) : "TBD"}</strong>
            </div>
            <div className="team-feature-meta-row">
              <span className="team-meta-label">Location</span>
              <strong className="team-meta-value">{featuredEvent?.location ?? "TBD"}</strong>
            </div>
          </article>
        </div>
      </section>

      <section id="upcoming" className="team-section team-upcoming-section" aria-labelledby="team-upcoming-title">
        <div className="team-frame team-section-intro">
          <p className="team-section-kicker">{content.upcoming.eyebrow}</p>
          <h2 id="team-upcoming-title" className="team-section-title">
            {content.upcoming.title}
          </h2>
          <p className="team-section-body team-upcoming-summary">{content.upcoming.summary}</p>
        </div>

        <div className="team-frame team-schedule-list">
          {events.map((event) => (
            <article key={event.id} className="team-surface team-schedule-row">
              <div className="team-schedule-date-block">
                <span>{formatDateLabel(event.eventDateIso)}</span>
                <strong>{formatTimeLabel(event.eventDateIso)}</strong>
              </div>
              <div className="team-schedule-copy">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
              <div className="team-schedule-meta">
                <span>Location</span>
                <strong>{event.location}</strong>
              </div>
              <Link href="#join" className="team-inline-link">
                Reserve this session
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="join" className="team-section team-join-section" aria-labelledby="team-join-title">
        <div className="team-frame team-join-grid">
          <article className="team-surface team-join-copy">
            <p className="team-section-kicker">{content.joinSection.eyebrow}</p>
            <h2 id="team-join-title" className="team-section-title">
              {content.joinSection.title}
            </h2>
            <p className="team-section-body">{content.joinSection.summary}</p>
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
        </div>
      </section>

      <section id="faq" className="team-section team-faq-section" aria-labelledby="team-faq-title">
        <div className="team-frame team-section-intro">
          <p className="team-section-kicker">{content.faq.eyebrow}</p>
          <h2 id="team-faq-title" className="team-section-title">
            {content.faq.title}
          </h2>
        </div>

        <div className="team-frame team-faq-grid">
          {content.faq.items.map((item) => (
            <article key={item.question} className="team-surface team-faq-card">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="team-section team-footer-section">
        <div className="team-frame team-footer-inner">
          <div>
            <h2>{content.footer.title}</h2>
            <p>{content.footer.summary}</p>
          </div>
          <div className="team-footer-links">
            {content.footer.links.map((link) => (
              <Link key={`${link.label}-${link.href}`} href={link.href} className="team-footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
