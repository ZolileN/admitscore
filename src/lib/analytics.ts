"use client";

export type AnalyticsEventName =
  | "page_view"
  | "aps_calculated"
  | "match_completed"
  | "whatsapp_click"
  | "mlk_cta_click"
  | "pdf_export"
  | "program_viewed"
  | "share_whatsapp"
  | "copy_results_link";

export type AnalyticsProperties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProperties }) => void;
  }
}

export function bucketAps(aps: number): string {
  if (aps <= 15) return "0-15";
  if (aps <= 20) return "16-20";
  if (aps <= 25) return "21-25";
  if (aps <= 30) return "26-30";
  if (aps <= 35) return "31-35";
  return "36+";
}

export function bucketCount(count: number): string {
  if (count === 0) return "0";
  if (count <= 5) return "1-5";
  if (count <= 15) return "6-15";
  if (count <= 30) return "16-30";
  return "31+";
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

  if (window.plausible) {
    window.plausible(eventName.replaceAll("_", " "), { props: properties });
  }

  sendToFirstParty(eventName, path, referrer, properties);
}
