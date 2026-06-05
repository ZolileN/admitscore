"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NSC_SUBJECTS } from "@/lib/subjects";
import { APS_LEVEL_COLORS } from "@/lib/constants";
import { levelToMinPercentage } from "@/lib/aps";
import type { MatchResults, ProgramMatch } from "@/lib/types";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<MatchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"safe" | "exact" | "near">("safe");

  useEffect(() => {
    const fetchResults = async () => {
      const s = searchParams.get("s");
      if (!s) { setError("No subjects provided. Please go back and enter your marks."); setLoading(false); return; }

      try {
        // Parse: "subjectIndex:mark,subjectIndex:mark,..."
        const entries = s.split(",").map((entry) => {
          const [indexStr, markStr] = entry.split(":");
          const subjectData = NSC_SUBJECTS[parseInt(indexStr)];
          if (!subjectData) throw new Error("Invalid subject");
          return { subjectSlug: subjectData.slug, mark: parseInt(markStr) };
        });

        // We need subject IDs from the DB — fetch them via a mapping endpoint or include in seed
        // For now, fetch subjects list and map by slug
        const subjectsRes = await fetch("/api/subjects");
        const subjectsList = await subjectsRes.json();
        const slugToId = new Map<string, number>();
        for (const sub of subjectsList) { slugToId.set(sub.slug, sub.id); }

        const subjects = entries.map((e) => ({
          subjectId: slugToId.get(e.subjectSlug) || 0,
          mark: e.mark,
        })).filter((s) => s.subjectId > 0);

        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjects }),
        });

        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        setResults(data);

        // Auto-select first non-empty tab
        if (data.results.safeBets.length > 0) setActiveTab("safe");
        else if (data.results.exactMatches.length > 0) setActiveTab("exact");
        else if (data.results.nearMisses.length > 0) setActiveTab("near");
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  // ─── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <div className="container-app pt-8 space-y-4">
        <div className="skeleton h-10 w-48 mb-2" />
        <div className="skeleton h-5 w-64 mb-6" />
        <div className="skeleton h-12 w-full mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app pt-20 text-center">
        <div className="glass-card-static p-10">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
            {error}
          </h2>
          <Link href="/calculate" className="btn-primary mt-6 inline-flex no-underline">← Back to Calculator</Link>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const tabs = [
    { key: "safe" as const, label: "Safe Bets", count: results.results.safeBets.length, icon: "✅", color: "var(--accent-emerald)" },
    { key: "exact" as const, label: "Exact Matches", count: results.results.exactMatches.length, icon: "🎯", color: "var(--accent-blue)" },
    { key: "near" as const, label: "Near Misses", count: results.results.nearMisses.length, icon: "⚡", color: "var(--accent-amber)" },
  ];

  const activePrograms: ProgramMatch[] =
    activeTab === "safe" ? results.results.safeBets :
    activeTab === "exact" ? results.results.exactMatches :
    results.results.nearMisses;

  return (
    <div className="container-app pt-6 pb-12">
      {/* APS Summary */}
      <div className="glass-card-static p-5 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Your APS Score</div>
            <div className="text-4xl font-bold mt-1" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--accent-blue)" }}>
              {results.studentAps}<span className="text-lg" style={{ color: "var(--text-muted)" }}>/42</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Total Matches</div>
            <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
              {results.totalPrograms}
            </div>
          </div>
        </div>
        <div className="mt-3 progress-bar">
          <div className="progress-bar-fill" style={{ width: `${(results.studentAps / 42) * 100}%`, background: "linear-gradient(90deg, var(--accent-blue), var(--accent-purple))" }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
          >
            <span className="mr-1 hidden sm:inline">{tab.icon}</span>
            <span className="text-xs sm:text-sm">{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{
                background: activeTab === tab.key ? `${tab.color}20` : "var(--bg-tertiary)",
                color: activeTab === tab.key ? tab.color : "var(--text-muted)",
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-sm mb-4 animate-fade-in" style={{ color: "var(--text-secondary)" }}>
        {activeTab === "safe" && "You comfortably meet all requirements. These are strong options."}
        {activeTab === "exact" && "You meet the minimum requirements. Competitive but possible."}
        {activeTab === "near" && "You're close! Here's exactly what to improve."}
      </p>

      {/* Program Cards */}
      {activePrograms.length === 0 ? (
        <div className="glass-card-static p-10 text-center animate-fade-in">
          <div className="text-3xl mb-3">
            {activeTab === "safe" ? "🔒" : activeTab === "exact" ? "🔍" : "📈"}
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            {activeTab === "safe" && "No safe bets found. Check Exact Matches or Near Misses."}
            {activeTab === "exact" && "No exact matches found. Check Near Misses for programs you're close to qualifying for."}
            {activeTab === "near" && "No near misses found. Try adding more subjects or adjusting your marks."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {activePrograms.map((program) => (
            <ProgramCard key={`${program.universitySlug}-${program.programSlug}`} program={program} />
          ))}
        </div>
      )}

      {/* Back to calculator */}
      <div className="mt-8 text-center">
        <Link href="/calculate" className="btn-secondary !text-sm no-underline">← Recalculate</Link>
      </div>
    </div>
  );
}

function ProgramCard({ program }: { program: ProgramMatch }) {
  const borderColor = program.category === "safe" ? "var(--accent-emerald)" : program.category === "exact" ? "var(--accent-blue)" : "var(--accent-amber)";
  const glowClass = program.category === "safe" ? "glow-emerald" : program.category === "exact" ? "glow-blue" : "glow-amber";
  const badgeClass = program.category === "safe" ? "badge-safe" : program.category === "exact" ? "badge-exact" : "badge-near";
  const badgeLabel = program.category === "safe" ? "Safe Bet" : program.category === "exact" ? "Match" : "Near Miss";

  // APS bar
  const apsPercent = Math.min(100, (program.studentAps / program.requiredAps) * 100);

  // Group subject requirements: mandatory vs OR groups
  const mandatory = program.subjectRequirements.filter((r) => r.groupId === null);
  const orGroupsMap = new Map<number, typeof program.subjectRequirements>();
  for (const r of program.subjectRequirements.filter((r) => r.groupId !== null)) {
    const group = orGroupsMap.get(r.groupId!) || [];
    group.push(r);
    orGroupsMap.set(r.groupId!, group);
  }

  return (
    <div className={`glass-card-static p-5 ${glowClass}`} style={{ borderLeft: `3px solid ${borderColor}` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <Link href={`/requirements/${program.universitySlug}/${program.programSlug}`} className="text-base font-bold no-underline hover:underline" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>
            {program.programName}
          </Link>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {program.universityName} · {program.faculty}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {program.qualificationType === "degree" ? "Degree" : program.qualificationType === "diploma" ? "Diploma" : "Extended Degree"} · {program.durationYears} year{program.durationYears !== 1 ? "s" : ""}
          </div>
        </div>
        <span className={`badge ${badgeClass} shrink-0`}>{badgeLabel}</span>
      </div>

      {/* APS Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span style={{ color: "var(--text-muted)" }}>APS Required: {program.requiredAps}</span>
          <span className="font-bold" style={{ color: program.apsGap === 0 ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
            Yours: {program.studentAps}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{
            width: `${apsPercent}%`,
            background: program.apsGap === 0
              ? "linear-gradient(90deg, var(--accent-emerald), #22c55e)"
              : "linear-gradient(90deg, var(--accent-amber), #f97316)",
          }} />
        </div>
        {program.apsGap > 0 && (
          <div className="text-xs mt-1 font-medium" style={{ color: "var(--accent-amber)" }}>
            Need {program.apsGap} more APS point{program.apsGap !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Subject Requirements */}
      <div className="space-y-1.5">
        {mandatory.map((req) => (
          <SubjectReqRow key={req.subjectId} req={req} isNearMiss={program.category === "near"} />
        ))}
        {Array.from(orGroupsMap.entries()).map(([groupId, reqs]) => {
          const anyMet = reqs.some((r) => r.met);
          return (
            <div key={groupId} className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="w-4 text-center">{anyMet ? "✓" : "✗"}</span>
              <span style={{ color: anyMet ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                {reqs.map((r, i) => (
                  <span key={r.subjectId}>
                    {i > 0 && <span style={{ color: "var(--text-muted)" }}> or </span>}
                    {r.subjectName} (L{r.minLevel}+)
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubjectReqRow({ req, isNearMiss }: { req: ProgramMatch["subjectRequirements"][0]; isNearMiss: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="w-4 text-center">{req.met ? "✓" : "✗"}</span>
      <span style={{ color: req.met ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
        {req.subjectName}: Level {req.minLevel}+
      </span>
      {req.studentLevel !== null && (
        <span className="badge-level !w-5 !h-5 !text-xs" style={{ background: `${APS_LEVEL_COLORS[req.studentLevel]}20`, color: APS_LEVEL_COLORS[req.studentLevel] }}>
          {req.studentLevel}
        </span>
      )}
      {!req.met && isNearMiss && req.studentLevel !== null && req.gap > 0 && (
        <span className="text-xs font-medium" style={{ color: "var(--accent-amber)" }}>
          — Raise to {levelToMinPercentage(req.minLevel)}%+
        </span>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: "rgba(6,8,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container-app flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>A</div>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>AdmitScore</span>
          </Link>
          <Link href="/calculate" className="btn-primary !py-2 !px-4 !text-xs no-underline">New Calculation</Link>
        </div>
      </nav>
      <Suspense fallback={
        <div className="container-app pt-8 space-y-4">
          <div className="skeleton h-10 w-48 mb-2" />
          <div className="skeleton h-12 w-full mb-4" />
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 w-full" />)}
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </main>
  );
}
