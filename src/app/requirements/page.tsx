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
