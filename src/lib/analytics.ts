"use client";

import type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics-shared";
export type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics-shared";
export { bucketAps, bucketCount } from "@/lib/analytics-shared";

declare global {
  interface Window {
    umami?: {
      track: (
        event: string | ((props: Record<string, unknown>) => Record<string, unknown>),
        data?: AnalyticsProperties
      ) => void;
    };
  }
}

function sendToFirstParty(
  eventName: AnalyticsEventName,
  path: string,
  referrer: string | undefined,
  properties?: AnalyticsProperties
) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, path, referrer, properties }),
    keepalive: true,
  }).catch(() => {});
}

export function trackUmamiPageView(url: string) {
  if (typeof window === "undefined" || !window.umami) return;
  window.umami.track((props) => ({ ...props, url }));
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsProperties
) {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;
  const referrer = document.referrer || undefined;

  void import("@vercel/analytics").then(({ track }) => {
    track(eventName, properties);
  }).catch(() => {});

  if (window.umami && eventName !== "page_view") {
    window.umami.track(eventName, properties);
  }

  sendToFirstParty(eventName, path, referrer, properties);
}
