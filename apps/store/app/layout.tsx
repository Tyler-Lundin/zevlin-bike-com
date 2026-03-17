import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import StoreShell from "../components/StoreShell";
import { StoreProvider } from "../components/StoreProvider";

const STORE_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://store.zevlinbike.com";
const MARKETING_SITE_URL = process.env.NEXT_PUBLIC_MARKETING_SITE_URL || "https://www.zevlinbike.com";

export const metadata: Metadata = {
  metadataBase: new URL(STORE_SITE_URL),
  title: "Zevlin Store",
  description: "Clean, direct Zevlin product shopping with secure checkout and restrained premium design.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Zevlin Store",
    description: "Minimal rider-care storefront for the fixed Zevlin product lineup.",
    url: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="store-body">
        <StoreProvider>
          <StoreShell marketingSiteUrl={MARKETING_SITE_URL}>{children}</StoreShell>
        </StoreProvider>
      </body>
    </html>
  );
}
