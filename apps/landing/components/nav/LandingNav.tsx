"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LandingLink } from "../../lib/content";

const SCROLL_THRESHOLD = 56;
const DESKTOP_BREAKPOINT = 1024;

export default function LandingNav({
  brandName,
  brandTagline,
  logoPath,
  navLinks,
}: {
  brandName: string;
  brandTagline: string;
  logoPath: string;
  navLinks: LandingLink[];
}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { primaryLink, secondaryLinks } = useMemo(() => {
    const primary = navLinks.find((item) => item.variant === "primary") ?? null;
    const secondary = navLinks.filter((item) => item.variant !== "primary");

    return {
      primaryLink: primary,
      secondaryLinks: secondary,
    };
  }, [navLinks]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => setIsDrawerOpen(false);
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  useEffect(() => {
    document.body.classList.toggle("landing-nav-open", isDrawerOpen);

    return () => {
      document.body.classList.remove("landing-nav-open");
    };
  }, [isDrawerOpen]);

  const headerClassName = [
    "landing-nav",
    isScrolled ? "is-scrolled" : "",
    isDrawerOpen ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <header className={headerClassName} data-scrolled={isScrolled}>
        <div className="landing-nav-inner">
          <Link href="#home" className="landing-nav-brand" onClick={closeDrawer}>
            <Image src={logoPath} alt={brandName} width={48} height={48} priority className="landing-nav-logo" />
            <div className="landing-nav-brand-copy">
              <p className="landing-nav-brand-title">{brandName}</p>
              <p className="landing-nav-brand-tagline">{brandTagline}</p>
            </div>
          </Link>

          <nav className="landing-nav-links" aria-label="Primary navigation">
            {secondaryLinks.map((item) => (
              <Link key={item.label} href={item.href} className="landing-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="landing-nav-actions">
            {primaryLink ? (
              <Link href={primaryLink.href} className="landing-nav-cta">
                {primaryLink.label}
              </Link>
            ) : null}

            <button
              type="button"
              className="landing-nav-toggle"
              aria-expanded={isDrawerOpen}
              aria-controls="landing-nav-drawer"
              aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsDrawerOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={isDrawerOpen ? "landing-nav-drawer-shell is-open" : "landing-nav-drawer-shell"}>
        <button
          type="button"
          className="landing-nav-backdrop"
          aria-label="Close navigation overlay"
          onClick={closeDrawer}
        />

        <aside
          id="landing-nav-drawer"
          className="landing-nav-drawer"
          aria-label="Mobile navigation"
          aria-modal="true"
          role="dialog"
        >
          <div className="landing-nav-drawer-head">
            <Link href="#home" className="landing-nav-brand landing-nav-drawer-brand" onClick={closeDrawer}>
              <Image src={logoPath} alt={brandName} width={44} height={44} className="landing-nav-logo" />
              <div className="landing-nav-brand-copy">
                <p className="landing-nav-brand-title">{brandName}</p>
                <p className="landing-nav-brand-tagline">{brandTagline}</p>
              </div>
            </Link>

            <button
              type="button"
              className="landing-nav-close"
              aria-label="Close navigation menu"
              onClick={closeDrawer}
            >
              <span />
              <span />
            </button>
          </div>

          <nav className="landing-nav-drawer-links" aria-label="Mobile primary navigation">
            {secondaryLinks.map((item) => (
              <Link key={item.label} href={item.href} className="landing-nav-drawer-link" onClick={closeDrawer}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="landing-nav-drawer-actions">
            {primaryLink ? (
              <Link href={primaryLink.href} className="landing-nav-drawer-cta" onClick={closeDrawer}>
                {primaryLink.label}
              </Link>
            ) : null}
            <Link href="/contact" className="landing-nav-drawer-secondary" onClick={closeDrawer}>
              Contact support
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
