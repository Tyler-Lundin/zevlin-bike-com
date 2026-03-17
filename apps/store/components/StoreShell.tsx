"use client";

import type { ReactNode } from "react";
import StoreNav from "./StoreNav";

export default function StoreShell({
  children,
  marketingSiteUrl,
}: {
  children: ReactNode;
  marketingSiteUrl: string;
}) {
  return (
    <div className="store-app-shell">
      <StoreNav marketingSiteUrl={marketingSiteUrl} />

      <main className="store-main">{children}</main>

      <footer className="store-footer">
        <div className="store-frame store-footer-inner">
          <p>Zevlin rider care, direct checkout, and support that still feels human.</p>
          <div className="store-footer-links">
            <a href={marketingSiteUrl}>Main site</a>
            <a href="mailto:zevlinbike@gmail.com">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
