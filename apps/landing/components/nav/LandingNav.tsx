"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LandingLink, LandingNotice } from "../../lib/content";

const SCROLL_THRESHOLD = 75;
const DESKTOP_BREAKPOINT = 768;

function StoreIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h16" />
      <path d="M4 6h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

export default function LandingNav({
  brandName,
  logoPath,
  navLinks,
  storeUrl,
  announcementItems,
}: {
  brandName: string;
  logoPath: string;
  navLinks: LandingLink[];
  storeUrl: string;
  announcementItems: LandingNotice[];
}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);

  const currentNotice = announcementItems[noticeIndex] ?? announcementItems[0] ?? null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => setIsMenuOpen(false);
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setIsMenuOpen(false);
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
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle("landing-nav-open", isMenuOpen);

    return () => {
      document.body.classList.remove("landing-nav-open");
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!currentNotice || bannerDismissed || isScrolled || announcementItems.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setNoticeIndex((current) => (current + 1) % announcementItems.length);
    }, Math.max(currentNotice.rotationIntervalMs ?? 6000, 2000));

    return () => window.clearInterval(interval);
  }, [currentNotice, announcementItems.length, bannerDismissed, isScrolled]);

  const hasBanner = Boolean(currentNotice);
  const isBannerVisible = hasBanner && !bannerDismissed && !isScrolled;
  const shouldShowReopen = hasBanner && bannerDismissed && !isScrolled;

  const closeMenu = () => setIsMenuOpen(false);
  const headerClassName = [
    "landing-header",
    isScrolled ? "is-scrolled" : null,
    hasBanner ? "has-banner" : null,
    hasBanner ? (isBannerVisible ? "is-banner-visible" : "is-banner-hidden") : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {shouldShowReopen ? (
        <button
          type="button"
          className="landing-banner-reopen"
          onClick={() => setBannerDismissed(false)}
          aria-label="Show announcement banner"
        >
          <span>Announcements</span>
        </button>
      ) : null}

      <header className={headerClassName}>
        {hasBanner ? (
          <div
            className={isBannerVisible ? "landing-banner is-visible" : "landing-banner is-hidden"}
            role="region"
            aria-label="Site announcements"
            aria-hidden={!isBannerVisible}
          >
            <div className="landing-banner-inner">
              <div className="landing-banner-copy">
                {currentNotice?.title ? <span className="landing-banner-title">{currentNotice.title}</span> : null}
                <span className="landing-banner-message">{currentNotice?.message}</span>
              </div>

              <div className="landing-banner-actions">
                {currentNotice?.ctaLabel && currentNotice?.ctaHref ? (
                  <Link href={currentNotice.ctaHref} className="landing-banner-cta">
                    {currentNotice.ctaLabel}
                  </Link>
                ) : null}

                {currentNotice?.dismissible !== false ? (
                  <button
                    type="button"
                    className="landing-banner-close"
                    aria-label="Dismiss announcement banner"
                    onClick={() => setBannerDismissed(true)}
                  >
                    <CloseIcon />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="landing-nav-wrap">
          <div className="landing-nav-shell">
            <Link href="#home" className="landing-nav-brand" onClick={closeMenu}>
              <Image src={logoPath} alt={brandName} width={32} height={32} priority className="landing-nav-logo" />
              <span className="landing-nav-brand-label">{brandName}</span>
            </Link>

            <nav className="landing-nav-links" aria-label="Primary navigation">
              {navLinks.map((item) => (
                <Link key={item.label} href={item.href} className="landing-nav-link">
                  {item.label}
                </Link>
              ))}
              <Link href={storeUrl} className="landing-nav-store-link" aria-label="Open store">
                <StoreIcon />
              </Link>
            </nav>

            <div className="landing-nav-mobile-actions">
              <Link href={storeUrl} className="landing-nav-store-link" aria-label="Open store">
                <StoreIcon />
              </Link>
              <button
                type="button"
                className="landing-nav-toggle"
                aria-expanded={isMenuOpen}
                aria-controls="landing-mobile-menu"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={() => setIsMenuOpen((current) => !current)}
              >
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        <div className={isMenuOpen ? "landing-mobile-menu-shell is-open" : "landing-mobile-menu-shell"}>
          <button
            type="button"
            className="landing-mobile-menu-backdrop"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          />

          <nav id="landing-mobile-menu" className="landing-mobile-menu" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className="landing-mobile-menu-link" onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
            <Link href={storeUrl} className="landing-mobile-menu-link landing-mobile-menu-store" onClick={closeMenu}>
              Store
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
