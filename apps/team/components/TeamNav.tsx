"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TeamLink } from "../lib/content";

type TeamNavProps = {
  brandName: string;
  brandTagline: string;
  logoPath: string;
  siteUrl: string;
  navLinks: TeamLink[];
};

export default function TeamNav({ brandName, brandTagline, logoPath, siteUrl, navLinks }: TeamNavProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const primaryLink = navLinks.find((link) => link.variant === "primary");
  const sectionLinks = navLinks.filter((link) => link.variant !== "primary");

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 56);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => setIsDrawerOpen(false);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isDrawerOpen]);

  return (
    <>
      <header className={isScrolled ? "team-nav-shell is-scrolled" : "team-nav-shell"}>
        <div className="team-nav-bar">
          <Link href="/" className="team-nav-brand" aria-label="Zevlin Cycling Team home">
            <Image src={logoPath} alt="Zevlin Bike" width={42} height={42} priority className="team-nav-logo" />
            <span className="team-nav-brand-copy">
              <span className="team-nav-brand-kicker">Zevlin</span>
              <span className="team-nav-brand-title">{brandName}</span>
              <span className="team-nav-brand-tagline">{brandTagline}</span>
            </span>
          </Link>

          <nav className="team-nav-center" aria-label="Team page sections">
            {sectionLinks.map((link) => (
              <Link key={`${link.label}-${link.href}`} href={link.href} className="team-nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="team-nav-actions">
            {primaryLink ? (
              <Link href={primaryLink.href} className="team-nav-cta">
                {primaryLink.label}
              </Link>
            ) : null}
            <button
              type="button"
              className="team-nav-toggle"
              onClick={() => setIsDrawerOpen((current) => !current)}
              aria-expanded={isDrawerOpen}
              aria-controls="team-nav-drawer"
              aria-label={isDrawerOpen ? "Close team navigation" : "Open team navigation"}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        className={isDrawerOpen ? "team-drawer-backdrop is-open" : "team-drawer-backdrop"}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden={!isDrawerOpen}
      />

      <aside id="team-nav-drawer" className={isDrawerOpen ? "team-drawer is-open" : "team-drawer"} aria-hidden={!isDrawerOpen}>
        <div className="team-drawer-head">
          <div>
            <p className="team-drawer-kicker">Zevlin Cycling Team</p>
            <h2>Join the next ride.</h2>
          </div>
          <button type="button" className="team-drawer-close" onClick={() => setIsDrawerOpen(false)}>
            Close
          </button>
        </div>

        <nav className="team-drawer-links" aria-label="Team drawer links">
          {sectionLinks.map((link) => (
            <Link key={`${link.label}-${link.href}`} href={link.href} className="team-drawer-link" onClick={() => setIsDrawerOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="team-drawer-actions">
          {primaryLink ? (
            <Link href={primaryLink.href} className="team-button-primary button-block" onClick={() => setIsDrawerOpen(false)}>
              {primaryLink.label}
            </Link>
          ) : null}
          <a href={siteUrl} className="team-button-secondary button-block" onClick={() => setIsDrawerOpen(false)}>
            Back to Zevlin
          </a>
        </div>
      </aside>
    </>
  );
}
