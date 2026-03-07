import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Zevlin Admin</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
