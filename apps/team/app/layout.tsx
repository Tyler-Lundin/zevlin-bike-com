import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="team-shell">
          <header className="team-header">
            <p className="team-brand">Zevlin Cycling Team</p>
            <p className="team-subtitle">Events, updates, and rider onboarding.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
