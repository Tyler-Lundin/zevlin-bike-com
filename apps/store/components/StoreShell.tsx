"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./StoreProvider";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export default function StoreShell({
  children,
  marketingSiteUrl,
}: {
  children: ReactNode;
  marketingSiteUrl: string;
}) {
  const pathname = usePathname();
  const { cartCount, hydrated } = useStore();

  return (
    <div className="store-app-shell">
      <header className="store-header">
        <div className="shell-inner store-header-inner">
          <Link href="/" className="store-brand">
            <Image src="/images/logo.png" alt="Zevlin Bike" width={38} height={38} priority />
            <div>
              <p className="store-brand-title">Zevlin Store</p>
              <p className="store-brand-tag">Minimal rider care</p>
            </div>
          </Link>

          <nav className="store-nav" aria-label="Store">
            <Link
              href="/"
              className={isActive(pathname, "/") && pathname === "/" ? "is-active" : undefined}
            >
              Catalog
            </Link>
            <a href="mailto:zevlinbike@gmail.com">Support</a>
            <Link
              href="/cart"
              className={isActive(pathname, "/cart") ? "is-active" : undefined}
            >
              Cart
            </Link>
          </nav>

          <div className="store-header-actions">
            <a href={marketingSiteUrl} className="store-back-link">
              Back to site
            </a>
            <Link href="/cart" className="store-cart-link">
              Bag
              <span>{hydrated ? cartCount : 0}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="store-main">
        <div className="shell-inner store-main-inner">{children}</div>
      </main>

      <footer className="store-footer">
        <div className="shell-inner store-footer-inner">
          <p>Zevlin rider care. Direct products, secure checkout, straightforward support.</p>
          <div className="store-footer-links">
            <a href={marketingSiteUrl}>Main site</a>
            <a href="mailto:zevlinbike@gmail.com">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
