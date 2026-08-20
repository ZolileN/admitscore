"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { NSC_SUBJECTS } from "@/lib/subjects";
import { calculateAPS } from "@/lib/aps";
import { loadMarksFromStorage, parseResultsParam } from "@/lib/results-url";
import { useSearchParams } from "next/navigation";
import type { MatchResults } from "@/lib/types";
import ResultsProgramList from "@/components/ResultsProgramList";
import { Suspense } from "react";

interface MarkEntry {
  slug: string;
  name: string;
  mark: number;
}

function SimulateContent() {
  const searchParams = useSearchParams();
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [results, setResults] = useState<MatchResults | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"safe" | "exact" | "near">("safe");

  useEffect(() => {
    const fromUrl = parseResultsParam(searchParams.get("s"));
    const fromStorage = loadMarksFromStorage();
    const source = fromUrl.length > 0 ? fromUrl : fromStorage?.subjects ?? [];

    if (source.length === 0) {
      setMarks([
        { slug: "english-hl", name: "English Home Language", mark: 65 },
        { slug: "mathematics", name: "Mathematics", mark: 62 },
        { slug: "life-orientation", name: "Life Orientation", mark: 70 },
        { slug: "physical-sciences", name: "Physical Sciences", mark: 58 },
        { slug: "life-sciences", name: "Life Sciences", mark: 60 },
        { slug: "accounting", name: "Accounting", mark: 72 },
        { slug: "geography", name: "Geography", mark: 68 },
      ]);
      return;
    }

    setMarks(
      source.map((entry) => ({
        slug: entry.subjectSlug,
        name: NSC_SUBJECTS.find((s) => s.slug === entry.subjectSlug)?.name || entry.subjectSlug,
        mark: typeof (entry as { mark: number | string }).mark === "string"
          ? Number((entry as { mark: string }).mark)
          : (entry as { mark: number }).mark,
      }))
    );
  }, [searchParams]);

  const runMatch = useCallback(async (currentMarks: MarkEntry[]) => {
    const subjectsRes = await fetch("/api/subjects");
    const subjectsList = await subjectsRes.json();
    const slugToId = new Map<string, number>();
    for (const s of subjectsList) slugToId.set(s.slug, s.id);

    const payload = currentMarks
      .map((m) => ({ subjectId: slugToId.get(m.slug) || 0, mark: m.mark }))
      .filter((m) => m.subjectId > 0);

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects: payload }),
    });
    if (res.ok) setResults(await res.json());
  }, []);

  useEffect(() => {
    if (marks.length === 0) return;
    startTransition(() => {
      runMatch(marks);
    });
  }, [marks, runMatch]);

  const updateMark = (index: number, value: number) => {
    setMarks((prev) => prev.map((m, i) => (i === index ? { ...m, mark: value } : m)));
  };

  const aps = marks.length
    ? calculateAPS(
        marks.map((m, i) => ({ subjectId: i + 1, mark: m.mark })),
        { lifeOrientationRule: "exclude" }
      )
    : 0;

  const activePrograms =
    activeTab === "safe"
      ? results?.results.safeBets ?? []
      : activeTab === "exact"
        ? results?.results.exactMatches ?? []
        : results?.results.nearMisses ?? [];

  return (
    <div className="container-app pt-6 pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
          What-if simulator
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Adjust a mark and watch your matches update instantly. Great for planning improvement targets.
        </p>
      </div>

      <div className="glass-card-static p-5">
        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Live APS</div>
        <div className="text-3xl font-bold" style={{ color: "var(--accent-blue)", fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
          {aps}<span className="text-base" style={{ color: "var(--text-muted)" }}>/42</span>
        </div>
        {isPending && <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Updating matches…</p>}
      </div>

      <div className="space-y-4">
        {marks.map((entry, index) => (
          <div key={entry.slug} className="glass-card-static p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-sm font-medium">{entry.name}</span>
              <span className="text-lg font-bold" style={{ color: "var(--accent-blue)" }}>{entry.mark}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={entry.mark}
              onChange={(e) => updateMark(index, Number(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {results && (
        <>
          <div className="tab-bar">
            {(["safe", "exact", "near"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`tab-item ${activeTab === tab ? "active" : ""}`}
              >
                {tab === "safe" ? "Safe" : tab === "exact" ? "Exact" : "Near"} (
                {tab === "safe"
                  ? results.results.safeBets.length
                  : tab === "exact"
                    ? results.results.exactMatches.length
                    : results.results.nearMisses.length}
                )
              </button>
            ))}
          </div>
          {activePrograms.length > 0 ? (
            <ResultsProgramList programs={activePrograms} />
          ) : (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-secondary)" }}>No programmes in this category yet.</p>
          )}
        </>
      )}

      <div className="text-center">
        <Link href="/calculate" className="btn-secondary !text-sm no-underline">← Back to calculator</Link>
      </div>
    </div>
  );
}

export default function SimulatePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="container-app pt-8"><div className="skeleton h-40 w-full" /></div>}>
        <SimulateContent />
      </Suspense>
    </main>
  );
}
