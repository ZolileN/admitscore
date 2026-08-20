import Link from "next/link";
import DataFreshnessBadge from "@/components/DataFreshnessBadge";
import MlkComputerCta from "@/components/MlkComputerCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About AdmitScore — How APS Matching Works",
  description: "Learn how AdmitScore calculates APS, matches you to university programmes, and keeps requirements up to date.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen pb-16">
      <div className="container-app pt-8 space-y-8">
        <div>
          <DataFreshnessBadge />
          <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-3" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
            How AdmitScore works
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            AdmitScore converts your NSC marks into an Admission Point Score (APS) and checks them against real programme requirements across South African universities and TVET colleges.
          </p>
        </div>

        <section className="glass-card-static p-6 space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>APS calculation</h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li>Standard NSC: 80%+ = Level 7, 70%+ = 6, 60%+ = 5, 50%+ = 4, 40%+ = 3, 30%+ = 2.</li>
            <li>Most universities exclude Life Orientation and use your best 6 subjects (max APS 42).</li>
            <li>Wits caps Life Orientation at 4 points and uses 7 subjects (max APS 46).</li>
            <li>UKZN awards 8 points for 90%+ in a subject (max APS 48).</li>
          </ul>
        </section>

        <section className="glass-card-static p-6 space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>Match categories</h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li><strong style={{ color: "var(--accent-emerald)" }}>Safe Bets</strong> — you meet all subject requirements with room to spare.</li>
            <li><strong style={{ color: "var(--accent-blue)" }}>Exact Matches</strong> — you meet the minimum APS and subject levels.</li>
            <li><strong style={{ color: "var(--accent-amber)" }}>Near Misses</strong> — you are close; each card shows what to improve.</li>
          </ul>
        </section>

        <section className="glass-card-static p-6 space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>Data sources</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Programme APS and subject requirements are sourced from official university prospectuses and qualification pages, then verified manually each admission cycle. Always confirm final requirements on the institution&apos;s website before applying.
          </p>
          <Link href="/requirements" className="btn-secondary !text-sm no-underline inline-flex">Browse all programmes</Link>
        </section>

        <MlkComputerCta />
      </div>
    </main>
  );
}
