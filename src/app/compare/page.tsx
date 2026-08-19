import Link from "next/link";
import { db } from "@/db";
import { programs, programApsRules, programSubjectRules, subjects, universities } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { APS_LEVEL_COLORS } from "@/lib/constants";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<{ p?: string }>;
}

export const metadata: Metadata = {
  title: "Compare Programmes — AdmitScore",
  description: "Compare APS scores and subject requirements across South African university programmes.",
};

export default async function ComparePage({ searchParams }: Props) {
  const { p } = await searchParams;
  const selections = (p || "")
    .split(",")
    .map((entry) => {
      const [universitySlug, programSlug] = entry.split(":");
      return universitySlug && programSlug ? { universitySlug, programSlug } : null;
    })
    .filter((entry): entry is { universitySlug: string; programSlug: string } => entry !== null)
    .slice(0, 3);

  if (selections.length < 2) {
    return (
      <main className="min-h-screen container-app pt-20 text-center">
        <div className="glass-card-static p-10">
          <h1 className="text-2xl font-bold mb-3">Compare Programmes</h1>
          <p style={{ color: "var(--text-secondary)" }}>Select at least two programmes from your results to compare them.</p>
          <Link href="/calculate" className="btn-primary mt-6 inline-flex no-underline">Calculate My APS</Link>
        </div>
      </main>
    );
  }

  const uniSlugs = selections.map((entry) => entry.universitySlug);
  const uniRows = await db.select().from(universities).where(inArray(universities.slug, uniSlugs));
  const uniMap = new Map(uniRows.map((uni) => [uni.slug, uni]));

  const compareData = await Promise.all(
    selections.map(async ({ universitySlug, programSlug }) => {
      const uni = uniMap.get(universitySlug);
      if (!uni) return null;

      const progRows = await db.select().from(programs).where(and(eq(programs.universityId, uni.id), eq(programs.slug, programSlug)));
      if (progRows.length === 0) return null;
      const program = progRows[0];

      const [apsRule] = await db.select().from(programApsRules).where(eq(programApsRules.programId, program.id));
      const subjectRuleRows = await db.select().from(programSubjectRules).where(eq(programSubjectRules.programId, program.id));
      const allSubjects = await db.select().from(subjects);
      const subjectMap = new Map(allSubjects.map((subject) => [subject.id, subject]));

      return {
        universityName: uni.name,
        universitySlug: uni.slug,
        program,
        apsRule,
        subjectRules: subjectRuleRows.map((rule) => ({
          ...rule,
          subjectName: subjectMap.get(rule.subjectId)?.name || "Unknown",
        })),
      };
    })
  );

  const programsToCompare = compareData.filter(Boolean);

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

      <section className="container-wide pt-8 pb-16">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
          Compare Programmes
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Side-by-side APS and subject requirements.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {programsToCompare.map((entry) => entry && (
            <div key={`${entry.universitySlug}-${entry.program.slug}`} className="glass-card-static p-5">
              <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{entry.universityName}</div>
              <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>{entry.program.name}</h2>
              <div className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>{entry.program.faculty}</div>

              <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Minimum APS</div>
                <div className="text-4xl font-bold" style={{ color: "var(--accent-blue)" }}>
                  {entry.apsRule?.minApsScore ?? "—"}
                </div>
              </div>

              <div className="space-y-2">
                {entry.subjectRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between text-sm py-1">
                    <span>{rule.subjectName}{rule.groupId !== null ? " (alt.)" : ""}</span>
                    <span className="badge-level" style={{ background: `${APS_LEVEL_COLORS[rule.minLevel]}20`, color: APS_LEVEL_COLORS[rule.minLevel] }}>
                      {rule.minLevel}
                    </span>
                  </div>
                ))}
              </div>

              <Link href={`/requirements/${entry.universitySlug}/${entry.program.slug}`} className="inline-flex mt-5 text-sm no-underline" style={{ color: "var(--accent-blue)" }}>
                View full requirements →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
