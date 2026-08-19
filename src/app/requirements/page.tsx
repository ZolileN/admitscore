import Link from "next/link";
import RequirementsGrid from "@/components/RequirementsGrid";
import { getSiteStats, getUniversitiesWithProgramCounts } from "@/lib/stats";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { universityCount, programCount } = await getSiteStats();

  return {
    title: "Browse University Requirements — AdmitScore",
    description: `Explore entry requirements for ${programCount}+ programs across ${universityCount} South African universities including UCT, Wits, UP, UJ, Stellenbosch, and UNISA.`,
  };
}

export default async function RequirementsPage() {
  const [{ universityCount, programCount }, universities] = await Promise.all([
    getSiteStats(),
    getUniversitiesWithProgramCounts(),
  ]);

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
        <p style={{ color: "var(--text-secondary)" }} className="text-base mb-2">
          Browse entry requirements for South Africa&apos;s top universities. Click any university to see all programs.
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {programCount} programs across {universityCount} universities
        </p>
      </section>

      <section className="container-wide pb-16">
        <RequirementsGrid universities={universities} />
      </section>
    </main>
  );
}
