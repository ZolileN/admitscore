import Link from "next/link";
import { db } from "@/db";
import { universities, programs } from "@/db/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse University Requirements — AdmitScore",
  description: "Explore entry requirements for 70+ programs across UCT, Wits, UP, UJ, and Stellenbosch. Find the APS score and subjects you need.",
};

export default async function RequirementsPage() {
  const allUnis = await db.select().from(universities);
  const allProgs = await db.select().from(programs);

  // Group programs by university
  const uniPrograms = new Map<number, number>();
  for (const p of allProgs) {
    uniPrograms.set(p.universityId, (uniPrograms.get(p.universityId) || 0) + 1);
  }

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: "rgba(6,8,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container-wide flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>A</div>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>AdmitScore</span>
          </Link>
          <Link href="/calculate" className="btn-primary !py-2 !px-4 !text-xs no-underline">Check My APS</Link>
        </div>
      </nav>

      <section className="container-wide pt-8 pb-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
          University Requirements
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-base mb-8">
          Browse entry requirements for South Africa&apos;s top universities. Click any university to see all programs.
        </p>
      </section>

      <section className="container-wide pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {allUnis.map((uni) => {
            const progCount = uniPrograms.get(uni.id) || 0;
            return (
              <Link
                key={uni.slug}
                href={`/requirements/${uni.slug}`}
                className="glass-card p-6 no-underline block group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))", color: "var(--accent-blue)" }}>
                    {uni.name.split(" ").map(w => w[0]).join("").slice(0, 3)}
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                    {uni.province}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>
                  {uni.name}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {progCount} program{progCount !== 1 ? "s" : ""} available
                </p>
                <div className="mt-4 flex items-center text-sm font-medium" style={{ color: "var(--accent-blue)" }}>
                  View Programs →
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
