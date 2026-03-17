"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUPPORT_EMAIL } from "../lib/commerce";
import { useStore } from "./StoreProvider";

type StoreNavProps = {
  marketingSiteUrl: string;
};

type NavItem = {
  label: string;
  href: string;
  type?: "internal" | "external";
  activeOn?: (pathname: string) => boolean;
};

const sectionLinks: NavItem[] = [
  {
    label: "Lineup",
    href: "/#lineup",
    activeOn: (pathname) => pathname === "/",
  },
  {
    label: "Guide",
    href: "/#guide",
    activeOn: (pathname) => pathname === "/",
  },
  {
    label: "Support",
    href: "/#support",
    activeOn: (pathname) => pathname === "/",
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  return item.activeOn ? item.activeOn(pathname) : pathname === item.href;
}

export default function StoreNav({ marketingSiteUrl }: StoreNavProps) {
  const pathname = usePathname();
  const { cartCount, hydrated } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      <header className={isScrolled ? "store-nav-shell is-scrolled" : "store-nav-shell"}>
        <div className="store-nav-bar">
          <Link href="/" className="store-nav-brand" aria-label="Zevlin Store home">
            <Image src="/images/logo.png" alt="Zevlin Bike" width={38} height={38} priority className="store-nav-logo" />
            <span className="store-nav-brand-copy">
              <span className="store-nav-brand-kicker">Zevlin</span>
              <span className="store-nav-brand-title">Store</span>
            </span>
          </Link>

          <nav className="store-nav-center" aria-label="Store sections">
            {sectionLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={isActive(pathname, item) ? "store-nav-link is-active" : "store-nav-link"}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="store-nav-actions">
            <a href={marketingSiteUrl} className="store-nav-utility">
              Back to Zevlin
            </a>
            <Link href="/cart" className={pathname.startsWith("/cart") || pathname.startsWith("/checkout") ? "store-nav-bag is-active" : "store-nav-bag"}>
              Bag
              <span>{hydrated ? cartCount : 0}</span>
            </Link>
            <button
              type="button"
              className="store-nav-toggle"
              onClick={() => setIsDrawerOpen((current) => !current)}
              aria-expanded={isDrawerOpen}
              aria-controls="store-nav-drawer"
              aria-label={isDrawerOpen ? "Close store navigation" : "Open store navigation"}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        className={isDrawerOpen ? "store-drawer-backdrop is-open" : "store-drawer-backdrop"}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden={!isDrawerOpen}
      />

      <aside id="store-nav-drawer" className={isDrawerOpen ? "store-drawer is-open" : "store-drawer"} aria-hidden={!isDrawerOpen}>
        <div className="store-drawer-head">
          <div>
            <p className="store-drawer-kicker">Zevlin Store</p>
            <h2>Direct shopping, no clutter.</h2>
          </div>
          <button type="button" className="store-drawer-close" onClick={() => setIsDrawerOpen(false)}>
            Close
          </button>
        </div>

        <nav className="store-drawer-links" aria-label="Store drawer links">
          {sectionLinks.map((item) => (
            <Link key={item.label} href={item.href} className="store-drawer-link" onClick={() => setIsDrawerOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="store-drawer-link" onClick={() => setIsDrawerOpen(false)}>
            Email support
          </a>
        </nav>

        <div className="store-drawer-actions">
          <Link href="/cart" className="button-primary button-block" onClick={() => setIsDrawerOpen(false)}>
            Open bag ({hydrated ? cartCount : 0})
          </Link>
          <a href={marketingSiteUrl} className="button-secondary button-block" onClick={() => setIsDrawerOpen(false)}>
            Return to Zevlin
          </a>
        </div>
      </aside>
    </>
  );
}
