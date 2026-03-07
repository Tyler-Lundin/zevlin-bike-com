"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "../../../lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const query = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
    const routeKey = query ? `${pathname}?${query}` : pathname;

    if (!routeKey || routeKey === lastTracked.current) {
      return;
    }

    lastTracked.current = routeKey;
    trackEvent("page_view", {
      routeKey,
      referrer: document.referrer || "direct",
    });
  }, [pathname]);

  return null;
}
