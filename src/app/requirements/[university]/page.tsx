import Link from "next/link";
import { db } from "@/db";
import { universities, programs, programApsRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ university: string }>;
}

export async function generateStaticParams() {
  const unis = await db.select({ slug: universities.slug }).from(universities);
  return unis.map((u) => ({ university: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university } = await params;
  const uniRows = await db.select().from(universities).where(eq(universities.slug, university));
  if (uniRows.length === 0) return { title: "University Not Found — AdmitScore" };
  const uni = uniRows[0];
  return {
    title: `${uni.name} Entry Requirements — AdmitScore`,
    description: `View APS scores and subject requirements for all programs at ${uni.name}. Free admissions checker for South African students.`,
  };
}

export default async function UniversityPage({ params }: Props) {
  const { university } = await params;
  const uniRows = await db.select().from(universities).where(eq(universities.slug, university));
  if (uniRows.length === 0) notFound();
  const uni = uniRows[0];

  const uniPrograms = await db.select().from(programs).where(eq(programs.universityId, uni.id));
  const allApsRules = await db.select().from(programApsRules);
  const apsMap = new Map(allApsRules.map(r => [r.programId, r]));

  // Group by faculty
  const facultyMap = new Map<string, (typeof uniPrograms[0] & { apsRule?: typeof allApsRules[0] })[]>();
  for (const p of uniPrograms) {
    const group = facultyMap.get(p.faculty) || [];
    group.push({ ...p, apsRule: apsMap.get(p.id) });
    facultyMap.set(p.faculty, group);
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
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          <Link href="/requirements" className="no-underline hover:underline" style={{ color: "var(--text-secondary)" }}>Universities</Link>
          <span>›</span>
          <span style={{ color: "var(--text-primary)" }}>{uni.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
              {uni.name}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {uni.province} · {uniPrograms.length} programs
              {uni.slug === "unisa" && " · Distance learning"}
              {uni.websiteUrl && (
                <> · <a href={uni.websiteUrl} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline" style={{ color: "var(--accent-blue)" }}>{uni.websiteUrl.replace("https://", "")}</a></>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="container-wide pb-16">
        {Array.from(facultyMap.entries()).map(([faculty, progs]) => (
          <div key={faculty} className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>
              {faculty}
            </h2>
            <div className="space-y-3">
              {progs.map((prog) => (
                <Link
                  key={prog.slug}
                  href={`/requirements/${uni.slug}/${prog.slug}`}
                  className="glass-card p-4 flex items-center justify-between no-underline block"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{prog.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {prog.qualificationType === "degree" ? "Degree" : prog.qualificationType === "diploma" ? "Diploma" : "Extended"} · {prog.durationYears} years
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {prog.apsRule && (
                      <div className="text-right">
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>Min APS</div>
                        <div className="text-lg font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--accent-blue)" }}>
                          {prog.apsRule.minApsScore}
                        </div>
                      </div>
                    )}
                    <span style={{ color: "var(--text-muted)" }}>›</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
