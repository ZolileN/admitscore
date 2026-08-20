import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function recordAnalyticsEvent(
  eventName: AnalyticsEventName,
  options?: {
    path?: string;
    referrer?: string;
    properties?: AnalyticsProperties;
  }
) {
  const now = new Date().toISOString();

  await db.insert(analyticsEvents).values({
    eventName,
    path: options?.path ?? null,
    referrer: options?.referrer ?? null,
    properties: options?.properties ? JSON.stringify(options.properties) : null,
    day: todayKey(),
    createdAt: now,
  });
}

export function verifyAnalyticsAdminToken(token: string | null | undefined) {
  const expected = process.env.ANALYTICS_ADMIN_TOKEN;
  return Boolean(expected && token && token === expected);
}
