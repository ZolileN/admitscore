import Link from "next/link";
import { db } from "@/db";
import { universities, programs, programApsRules, programSubjectRules, subjects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { APS_LEVEL_COLORS } from "@/lib/constants";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ university: string; program: string }>;
}

export async function generateStaticParams() {
  const allProgs = db.select({ slug: programs.slug, uniId: programs.universityId }).from(programs).all();
  const allUnis = db.select().from(universities).all();
  const uniMap = new Map(allUnis.map(u => [u.id, u.slug]));
  return allProgs.map((p) => ({
    university: uniMap.get(p.uniId) || "",
    program: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university, program: programSlug } = await params;
  const uniRows = db.select().from(universities).where(eq(universities.slug, university)).all();
  if (uniRows.length === 0) return { title: "Not Found — AdmitScore" };
  const uni = uniRows[0];
  const progRows = db.select().from(programs).where(and(eq(programs.universityId, uni.id), eq(programs.slug, programSlug))).all();
  if (progRows.length === 0) return { title: "Not Found — AdmitScore" };
  const prog = progRows[0];
  return {
    title: `${prog.name} at ${uni.name} — Entry Requirements | AdmitScore`,
    description: `APS score, subject requirements, and entry criteria for ${prog.name} at ${uni.name}. Check if you qualify with South Africa's free APS calculator.`,
  };
}

export default async function ProgramPage({ params }: Props) {
  const { university, program: programSlug } = await params;

  const uniRows = db.select().from(universities).where(eq(universities.slug, university)).all();
  if (uniRows.length === 0) notFound();
  const uni = uniRows[0];

  const progRows = db.select().from(programs).where(and(eq(programs.universityId, uni.id), eq(programs.slug, programSlug))).all();
  if (progRows.length === 0) notFound();
  const prog = progRows[0];

  const apsRuleRows = db.select().from(programApsRules).where(eq(programApsRules.programId, prog.id)).all();
  const apsRule = apsRuleRows.length > 0 ? apsRuleRows[0] : null;

  const subjectRuleRows = db.select().from(programSubjectRules).where(eq(programSubjectRules.programId, prog.id)).all();
  const allSubjects = db.select().from(subjects).all();
  const subjectMap = new Map(allSubjects.map(s => [s.id, s]));

  const rulesWithSubjects = subjectRuleRows.map(r => ({
    ...r,
    subject: subjectMap.get(r.subjectId)!,
  }));

  const mandatory = rulesWithSubjects.filter((r) => r.groupId === null);
  const orGroupsMap = new Map<number, typeof rulesWithSubjects>();
  for (const r of rulesWithSubjects.filter((r) => r.groupId !== null)) {
    const group = orGroupsMap.get(r.groupId!) || [];
    group.push(r);
    orGroupsMap.set(r.groupId!, group);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: prog.name,
    provider: {
      "@type": "CollegeOrUniversity",
      name: uni.name,
      url: uni.websiteUrl,
    },
    educationalProgramMode: "full-time",
    timeToComplete: `P${prog.durationYears}Y`,
  };

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: "rgba(6,8,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container-app flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>A</div>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>AdmitScore</span>
          </Link>
          <Link href="/calculate" className="btn-primary !py-2 !px-4 !text-xs no-underline">Check My APS</Link>
        </div>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="container-app pt-8 pb-4">
        <div className="flex items-center gap-2 text-sm mb-4 flex-wrap" style={{ color: "var(--text-muted)" }}>
          <Link href="/requirements" className="no-underline hover:underline" style={{ color: "var(--text-secondary)" }}>Universities</Link>
          <span>›</span>
          <Link href={`/requirements/${uni.slug}`} className="no-underline hover:underline" style={{ color: "var(--text-secondary)" }}>{uni.name}</Link>
          <span>›</span>
          <span style={{ color: "var(--text-primary)" }}>{prog.name}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
          {prog.name}
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-base mb-2">
          {uni.name} · {prog.faculty}
        </p>
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
            {prog.qualificationType === "degree" ? "Degree" : prog.qualificationType === "diploma" ? "Diploma" : "Extended Degree"}
          </span>
          <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
            {prog.durationYears} Year{prog.durationYears !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      <section className="container-app pb-8">
        <div className="glass-card-static p-6 animate-fade-in-up">
          {apsRule && (
            <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Minimum APS Score
              </div>
              <div className="text-5xl font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--accent-blue)" }}>
                {apsRule.minApsScore}
                <span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>/42</span>
              </div>
              <div className="mt-2 progress-bar">
                <div className="progress-bar-fill" style={{
                  width: `${(apsRule.minApsScore / 42) * 100}%`,
                  background: "linear-gradient(90deg, var(--accent-blue), var(--accent-purple))",
                }} />
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Subject Requirements
            </div>

            {mandatory.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Required (all must be met)</div>
                {mandatory.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                    <span className="text-sm font-medium">{rule.subject.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Min Level</span>
                      <span className="badge-level" style={{ background: `${APS_LEVEL_COLORS[rule.minLevel]}20`, color: APS_LEVEL_COLORS[rule.minLevel] }}>
                        {rule.minLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {orGroupsMap.size > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Alternative (one must be met)</div>
                {Array.from(orGroupsMap.entries()).map(([groupId, rules]) => (
                  <div key={groupId} className="py-2 px-3 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                    {rules.map((rule, i) => (
                      <div key={rule.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">
                          {i > 0 && <span className="text-xs mr-2 font-medium" style={{ color: "var(--accent-blue)" }}>OR</span>}
                          {rule.subject.name}
                        </span>
                        <span className="badge-level" style={{ background: `${APS_LEVEL_COLORS[rule.minLevel]}20`, color: APS_LEVEL_COLORS[rule.minLevel] }}>
                          {rule.minLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-app pb-16">
        <div className="glass-card p-6 text-center" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
            Do you qualify?
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Enter your matric marks and find out instantly.
          </p>
          <Link href="/calculate" className="btn-primary no-underline">
            Check My APS →
          </Link>
        </div>
      </section>
    </main>
  );
}
