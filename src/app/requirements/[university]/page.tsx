import Link from "next/link";
import UniversityProgramsGrid from "@/components/UniversityProgramsGrid";
import UnisaNotice from "@/components/UnisaNotice";
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
  return unis.map((uni) => ({ university: uni.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university } = await params;
  const uniRows = await db.select().from(universities).where(eq(universities.slug, university));
  if (uniRows.length === 0) return { title: "University Not Found — AdmitScore" };
  const uni = uniRows[0];
  return {
    title: `${uni.name} Entry Requirements — AdmitScore`,
    description: `View APS scores and subject requirements for all programmes at ${uni.name}. Free admissions checker for South African students.`,
  };
}

export default async function UniversityPage({ params }: Props) {
  const { university } = await params;
  const uniRows = await db.select().from(universities).where(eq(universities.slug, university));
  if (uniRows.length === 0) notFound();
  const uni = uniRows[0];

  const uniPrograms = await db.select().from(programs).where(eq(programs.universityId, uni.id));
  const allApsRules = await db.select().from(programApsRules);
  const apsMap = new Map(allApsRules.map((rule) => [rule.programId, rule.minApsScore]));

  const programCards = uniPrograms.map((program) => ({
    slug: program.slug,
    name: program.name,
    faculty: program.faculty,
    qualificationType: program.qualificationType,
    durationYears: program.durationYears,
    minAps: apsMap.get(program.id) ?? null,
  }));

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

        <div className="flex items-start gap-4 mb-6">
          {uni.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={uni.logoUrl} alt="" className="w-14 h-14 rounded-xl p-2" style={{ background: "var(--bg-tertiary)" }} />
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
              {uni.name}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {uni.province} · {uniPrograms.length} programmes
              {uni.slug === "unisa" && " · Distance learning"}
              {uni.websiteUrl && (
                <> · <a href={uni.websiteUrl} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline" style={{ color: "var(--accent-blue)" }}>{uni.websiteUrl.replace("https://", "")}</a></>
              )}
            </p>
          </div>
        </div>

        {uni.slug === "unisa" && (
          <div className="mb-8">
            <UnisaNotice />
          </div>
        )}
      </section>

      <section className="container-wide pb-16">
        <UniversityProgramsGrid universitySlug={uni.slug} programs={programCards} />
      </section>
    </main>
  );
}
