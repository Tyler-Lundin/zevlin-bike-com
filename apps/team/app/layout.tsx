import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Zevlin Cycling Team",
    template: "%s | Zevlin Cycling Team",
  },
  description: "Structured rides, team sessions, and rider-backed community updates from Zevlin.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="team-shell">{children}</main>
      </body>
    </html>
  );
}
