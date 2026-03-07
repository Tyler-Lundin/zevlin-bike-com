"use client";

type BrowserWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: Array<Record<string, unknown>>;
};

export type AnalyticsMetadata = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(eventName: string, metadata: AnalyticsMetadata = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  const pagePath = window.location.pathname;
  const browserWindow = window as BrowserWindow;

  if (typeof browserWindow.gtag === "function") {
    browserWindow.gtag("event", eventName, metadata);
  }

  if (!Array.isArray(browserWindow.dataLayer)) {
    browserWindow.dataLayer = [];
  }
  browserWindow.dataLayer.push({
    event: eventName,
    ...metadata,
    pagePath,
  });

  const payload = JSON.stringify({
    eventName,
    pagePath,
    channel: "web",
    metadata,
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/event", blob);
    return;
  }

  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  });
}
