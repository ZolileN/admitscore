import { APPLICATION_DEADLINES } from "@/lib/deadlines";
import DataFreshnessBadge from "@/components/DataFreshnessBadge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Deadlines — AdmitScore",
  description: "Key university application and NSFAS funding deadlines for South African students.",
};

export default function TimelinePage() {
  const grouped = {
    university: APPLICATION_DEADLINES.filter((d) => d.category === "university"),
    tvet: APPLICATION_DEADLINES.filter((d) => d.category === "tvet"),
    funding: APPLICATION_DEADLINES.filter((d) => d.category === "funding"),
    general: APPLICATION_DEADLINES.filter((d) => d.category === "general"),
  };

  return (
    <main className="min-h-screen pb-16">
      <div className="container-app pt-8 space-y-8">
        <div>
          <DataFreshnessBadge />
          <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-3" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
            Application timeline
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Key dates for the 2026/2027 admission cycle. Verify on official sites — dates may change.
          </p>
        </div>

        {(["university", "tvet", "funding", "general"] as const).map((category) => (
          <section key={category}>
            <h2 className="text-lg font-bold mb-4 capitalize" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
              {category === "university"
                ? "Universities"
                : category === "tvet"
                  ? "TVET colleges"
                  : category === "funding"
                    ? "Funding"
                    : "General"}
            </h2>
            <div className="space-y-3">
              {grouped[category].map((item) => (
                <div key={item.id} className="glass-card-static p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.institution}</p>
                    </div>
                    <div className="text-sm font-medium" style={{ color: "var(--accent-blue)" }}>
                      Closes {item.closes}
                      {item.opens ? ` · Opens ${item.opens}` : ""}
                    </div>
                  </div>
                  {item.note && (
                    <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>{item.note}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
