import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import GoogleAnalytics from "./components/analytics/GoogleAnalytics";
import PageViewTracker from "./components/analytics/PageViewTracker";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zevlinbike.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zevlin Bike | Goods for your goods",
  description:
    "Replicated Zevlin legacy marketing content with products, policies, FAQs, testimonials, and rider story sections.",
  keywords: [
    "chamois cream",
    "cycling comfort",
    "bike skincare",
    "saddle sore prevention",
    "zevlin bike",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Zevlin Bike",
    title: "Zevlin Bike | Goods for your goods",
    description:
      "Performance-focused rider care products and support policies rebuilt from the legacy Zevlin marketing source.",
    images: [
      {
        url: "/images/hero-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Zevlin Bike rider hero image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zevlin Bike | Goods for your goods",
    description:
      "Performance-focused rider care products and support policies rebuilt from the legacy Zevlin marketing source.",
    images: ["/images/hero-image.jpeg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="landing-shell">{children}</main>
        <PageViewTracker />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
