import { NextRequest, NextResponse } from "next/server";
import { count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { verifyAnalyticsAdminToken } from "@/lib/analytics-server";

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!verifyAnalyticsAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = daysAgo(30);

  const [totalsByEvent, totalsByDay, topPaths, recentEvents] = await Promise.all([
    db
      .select({
        eventName: analyticsEvents.eventName,
        total: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.day, since))
      .groupBy(analyticsEvents.eventName)
      .orderBy(desc(count())),

    db
      .select({
        day: analyticsEvents.day,
        total: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.day, since))
      .groupBy(analyticsEvents.day)
      .orderBy(analyticsEvents.day),

    db
      .select({
        path: analyticsEvents.path,
        total: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.day, since))
      .groupBy(analyticsEvents.path)
      .orderBy(desc(count()))
      .limit(10),

    db
      .select({
        eventName: analyticsEvents.eventName,
        path: analyticsEvents.path,
        properties: analyticsEvents.properties,
        createdAt: analyticsEvents.createdAt,
      })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.eventName, "match_completed"))
      .orderBy(desc(analyticsEvents.id))
      .limit(20),
  ]);

  const totalEvents = totalsByEvent.reduce((sum, row) => sum + row.total, 0);
  const pageViews = totalsByEvent.find((row) => row.eventName === "page_view")?.total ?? 0;
  const matches = totalsByEvent.find((row) => row.eventName === "match_completed")?.total ?? 0;

  return NextResponse.json({
    period: { from: since, to: daysAgo(0) },
    summary: {
      totalEvents,
      pageViews,
      matchCalculations: matches,
      conversionRate: pageViews > 0 ? Number(((matches / pageViews) * 100).toFixed(1)) : 0,
    },
    totalsByEvent,
    totalsByDay,
    topPaths: topPaths.filter((row) => row.path),
    recentMatchEvents: recentEvents.map((row) => ({
      ...row,
      properties: row.properties ? JSON.parse(row.properties) : null,
    })),
  });
}
