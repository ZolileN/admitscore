"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ResultsProgramList from "@/components/ResultsProgramList";
import { buildWhatsAppShareUrl, parseResultsParam } from "@/lib/results-url";
import type { MatchResults } from "@/lib/types";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<MatchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"safe" | "exact" | "near">("safe");

  useEffect(() => {
    const fetchResults = async () => {
      const entries = parseResultsParam(searchParams.get("s"));
      if (entries.length === 0) {
        setError("No subjects provided. Please go back and enter your marks.");
        setLoading(false);
        return;
      }

      try {
        const subjectsRes = await fetch("/api/subjects");
        const subjectsList = await subjectsRes.json();
        const slugToId = new Map<string, number>();
        for (const subject of subjectsList) slugToId.set(subject.slug, subject.id);

        const subjects = entries
          .map((entry) => ({
            subjectId: slugToId.get(entry.subjectSlug) || 0,
            mark: entry.mark,
          }))
          .filter((entry) => entry.subjectId > 0);

        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjects }),
        });

        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        setResults(data);

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

  if (loading) {
    return (
      <div className="container-app pt-8 space-y-4">
        <div className="skeleton h-10 w-48 mb-2" />
        <div className="skeleton h-5 w-64 mb-6" />
        <div className="skeleton h-12 w-full mb-4" />
        {[1, 2, 3].map((index) => (
          <div key={index} className="skeleton h-40 w-full" />
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

  const activePrograms =
    activeTab === "safe" ? results.results.safeBets :
    activeTab === "exact" ? results.results.exactMatches :
    results.results.nearMisses;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappUrl = buildWhatsAppShareUrl(results.studentAps, results.totalPrograms, shareUrl);

  return (
    <div className="container-app pt-6 pb-24">
      <div className="glass-card-static p-5 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between gap-4">
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
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 !px-4 !text-xs no-underline">
            Share on WhatsApp
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="btn-secondary !py-2 !px-4 !text-xs"
          >
            Copy link
          </button>
        </div>
      </div>

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

      <p className="text-sm mb-4 animate-fade-in" style={{ color: "var(--text-secondary)" }}>
        {activeTab === "safe" && "You comfortably meet all requirements. These are strong options."}
        {activeTab === "exact" && "You meet the minimum requirements. Competitive but possible."}
        {activeTab === "near" && "You're close. Each card shows exactly what to improve."}
      </p>

      {activePrograms.length === 0 ? (
        <div className="glass-card-static p-10 text-center animate-fade-in">
          <div className="text-3xl mb-3">
            {activeTab === "safe" ? "🔒" : activeTab === "exact" ? "🔍" : "📈"}
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            {activeTab === "safe" && "No safe bets found. Check Exact Matches or Near Misses."}
            {activeTab === "exact" && "No exact matches found. Check Near Misses for programmes you're close to qualifying for."}
            {activeTab === "near" && "No near misses found. Try adding more subjects or adjusting your marks."}
          </p>
        </div>
      ) : (
        <ResultsProgramList programs={activePrograms} />
      )}

      <div className="mt-8 text-center">
        <Link href="/calculate" className="btn-secondary !text-sm no-underline">← Recalculate</Link>
      </div>
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
          {[1, 2, 3].map((index) => <div key={index} className="skeleton h-40 w-full" />)}
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </main>
  );
}
