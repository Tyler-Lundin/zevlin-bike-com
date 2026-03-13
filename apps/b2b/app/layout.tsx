import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Zevlin B2B",
    template: "%s | Zevlin B2B",
  },
  description: "Wholesale, retail, and partnership inquiries for the Zevlin product lineup.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="b2b-shell">{children}</main>
      </body>
    </html>
  );
}
