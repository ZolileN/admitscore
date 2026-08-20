"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type SummaryResponse = {
  period: { from: string; to: string };
  summary: {
    totalEvents: number;
    pageViews: number;
    matchCalculations: number;
    conversionRate: number;
  };
  totalsByEvent: Array<{ eventName: string; total: number }>;
  totalsByDay: Array<{ day: string; total: number }>;
  topPaths: Array<{ path: string | null; total: number }>;
  recentMatchEvents: Array<{
    eventName: string;
    path: string | null;
    properties: Record<string, string | number | boolean> | null;
    createdAt: string;
  }>;
};

function AdminAnalyticsContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Missing analytics token. Set ANALYTICS_ADMIN_TOKEN in your environment and open /admin/analytics?token=YOUR_TOKEN");
      setLoading(false);
      return;
    }

    fetch(`/api/analytics/summary?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized or analytics unavailable");
        return res.json() as Promise<SummaryResponse>;
      })
      .then(setData)
      .catch(() => setError("Could not load analytics. Check your admin token and database connection."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <main className="container-app py-10">
        <div className="skeleton h-10 w-64 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-24 w-full" />)}
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="container-app py-16">
        <div className="glass-card-static p-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
            Analytics dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container-app py-10 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
          AdmitScore analytics
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Last 30 days ({data.period.from} to {data.period.to}). Anonymous usage only — no matric marks stored.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Page views", value: data.summary.pageViews },
          { label: "APS calculations", value: data.summary.matchCalculations },
          { label: "Conversion rate", value: `${data.summary.conversionRate}%` },
          { label: "Total events", value: data.summary.totalEvents },
        ].map((card) => (
          <div key={card.label} className="glass-card-static p-5">
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>{card.label}</div>
            <div className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card-static p-6">
          <h2 className="text-lg font-semibold mb-4">Events by type</h2>
          <div className="space-y-2">
            {data.totalsByEvent.map((row) => (
              <div key={row.eventName} className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>{row.eventName.replaceAll("_", " ")}</span>
                <span className="font-semibold">{row.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card-static p-6">
          <h2 className="text-lg font-semibold mb-4">Top pages</h2>
          <div className="space-y-2">
            {data.topPaths.map((row) => (
              <div key={row.path ?? "unknown"} className="flex items-center justify-between text-sm gap-4">
                <span className="truncate" style={{ color: "var(--text-secondary)" }}>{row.path}</span>
                <span className="font-semibold shrink-0">{row.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card-static p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Daily traffic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {data.totalsByDay.map((row) => (
              <div key={row.day} className="rounded-lg p-3 text-center" style={{ background: "var(--bg-tertiary)" }}>
                <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{row.day.slice(5)}</div>
                <div className="font-bold">{row.total}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="text-sm mt-8" style={{ color: "var(--text-muted)" }}>
        View traffic in your Umami Cloud dashboard. Vercel Analytics covers Web Vitals on deploy.
      </p>
    </main>
  );
}

export default AdminAnalyticsContent;
