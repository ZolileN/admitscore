"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NSC_SUBJECTS } from "@/lib/subjects";
import { percentageToLevel } from "@/lib/aps";
import { APS_LEVEL_COLORS } from "@/lib/constants";
import { encodeResultsParam, loadMarksFromStorage, saveMarksToStorage } from "@/lib/results-url";

interface SubjectEntry {
  id: string;
  subjectSlug: string | null;
  subjectName: string;
  mark: string;
  isCompulsory: boolean;
}

const INITIAL_SUBJECTS: SubjectEntry[] = [
  { id: "1", subjectSlug: "english-hl", subjectName: "English Home Language", mark: "", isCompulsory: true },
  { id: "2", subjectSlug: "mathematics", subjectName: "Mathematics", mark: "", isCompulsory: true },
  { id: "3", subjectSlug: "life-orientation", subjectName: "Life Orientation", mark: "", isCompulsory: true },
  { id: "4", subjectSlug: null, subjectName: "", mark: "", isCompulsory: false },
  { id: "5", subjectSlug: null, subjectName: "", mark: "", isCompulsory: false },
  { id: "6", subjectSlug: null, subjectName: "", mark: "", isCompulsory: false },
  { id: "7", subjectSlug: null, subjectName: "", mark: "", isCompulsory: false },
];

let nextId = 8;

export default function CalculatePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectEntry[]>(INITIAL_SUBJECTS);
  const [activeCombobox, setActiveCombobox] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const comboboxRef = useRef<HTMLDivElement>(null);

  // ─── Calculate live APS ──────────────────────────────────
  const validSubjects = subjects.filter((s) => s.subjectSlug && s.mark && !isNaN(Number(s.mark)));
  const loSlug = "life-orientation";
  const nonLOSubjects = validSubjects.filter((s) => s.subjectSlug !== loSlug);
  const levels = nonLOSubjects.map((s) => percentageToLevel(Number(s.mark)));
  levels.sort((a, b) => b - a);
  const bestSix = levels.slice(0, 6);
  const currentAPS = bestSix.reduce((sum, l) => sum + l, 0);
  const maxAPS = 42;

  // ─── Subject options filtered ────────────────────────────
  const usedSlugs = new Set(subjects.map((s) => s.subjectSlug).filter(Boolean));
  const filteredOptions = NSC_SUBJECTS.filter(
    (s) => !usedSlugs.has(s.slug) && s.slug !== loSlug && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Close combobox on outside click ─────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setActiveCombobox(null);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Restore saved marks ───────────────────────────────────
  useEffect(() => {
    const saved = loadMarksFromStorage();
    if (!saved?.subjects.length) return;

    const savedMap = new Map(saved.subjects.map((entry) => [entry.subjectSlug, entry.mark]));
    const optionalSaved = saved.subjects.filter((entry) =>
      !["english-hl", "english-fal", "mathematics", "mathematical-literacy", "life-orientation"].includes(entry.subjectSlug)
    );
    let optionalIndex = 0;

    setSubjects((prev) => prev.map((entry) => {
      if (entry.subjectSlug && savedMap.has(entry.subjectSlug)) {
        return { ...entry, mark: savedMap.get(entry.subjectSlug)! };
      }

      if (!entry.isCompulsory && !entry.subjectSlug && optionalSaved[optionalIndex]) {
        const savedEntry = optionalSaved[optionalIndex++];
        const subject = NSC_SUBJECTS.find((candidate) => candidate.slug === savedEntry.subjectSlug);
        if (!subject) return entry;
        return {
          ...entry,
          subjectSlug: subject.slug,
          subjectName: subject.name,
          mark: savedEntry.mark,
        };
      }

      return entry;
    }));
  }, []);

  // ─── Select Subject ──────────────────────────────────────
  const selectSubject = useCallback((entryId: string, subject: typeof NSC_SUBJECTS[0]) => {
    setSubjects((prev) => prev.map((s) => s.id === entryId ? { ...s, subjectSlug: subject.slug, subjectName: subject.name } : s));
    setActiveCombobox(null);
    setSearchTerm("");
    // Focus the mark input
    setTimeout(() => {
      const markInput = document.querySelector(`input[data-mark-id="${entryId}"]`) as HTMLInputElement;
      markInput?.focus();
    }, 50);
  }, []);

  // ─── Update Mark ─────────────────────────────────────────
  const updateMark = useCallback((id: string, value: string) => {
    const num = value === "" ? "" : Math.min(100, Math.max(0, parseInt(value) || 0)).toString();
    setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, mark: num } : s));
  }, []);

  // ─── Add / Remove Subject ────────────────────────────────
  const addSubject = () => {
    if (subjects.length >= 9) return;
    setSubjects((prev) => [...prev, { id: String(nextId++), subjectSlug: null, subjectName: "", mark: "", isCompulsory: false }]);
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // ─── Swap compulsory language/math ───────────────────────
  const swapSubject = (id: string, newSlug: string, newName: string) => {
    setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, subjectSlug: newSlug, subjectName: newName } : s));
  };

  // ─── Submit ──────────────────────────────────────────────
  const canSubmit = validSubjects.length >= 6;
  const handleSubmit = () => {
    if (!canSubmit) return;

    saveMarksToStorage(
      validSubjects.map((entry) => ({
        subjectSlug: entry.subjectSlug!,
        mark: entry.mark,
      }))
    );

    const payload = encodeResultsParam(
      validSubjects.map((entry) => ({
        subjectSlug: entry.subjectSlug!,
        mark: Number(entry.mark),
      }))
    );

    startTransition(() => {
      router.push(`/results?s=${encodeURIComponent(payload)}`);
    });
  };

  return (
    <main className="min-h-screen pb-32">
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: "rgba(6,8,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container-app flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>A</div>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>AdmitScore</span>
          </Link>
          <Link href="/requirements" className="text-sm no-underline" style={{ color: "var(--text-secondary)" }}>Browse</Link>
        </div>
      </nav>

      {/* Header */}
      <section className="container-app pt-8 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
          Calculate Your APS
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Enter your matric subjects and percentages below. We&apos;ll calculate your APS and match you to qualifying programs.
        </p>
      </section>

      {/* Subject Entries */}
      <section className="container-app space-y-3">
        {subjects.map((entry, index) => {
          const mark = entry.mark ? Number(entry.mark) : null;
          const level = mark !== null ? percentageToLevel(mark) : null;
          const isLO = entry.subjectSlug === loSlug;

          return (
            <div
              key={entry.id}
              className={`glass-card-static p-4 animate-scale-in${activeCombobox === entry.id ? " combobox-active" : ""}`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-start gap-3">
                {/* Subject selector or name */}
                <div className="flex-1 min-w-0" ref={activeCombobox === entry.id ? comboboxRef : undefined}>
                  {entry.isCompulsory ? (
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{entry.subjectName}</div>
                      {entry.id === "1" && (
                        <div className="flex gap-2 mt-2">
                          {[
                            { slug: "english-hl", label: "HL" },
                            { slug: "english-fal", label: "FAL" },
                          ].map((opt) => (
                            <button
                              key={opt.slug}
                              onClick={() => swapSubject(entry.id, opt.slug, `English ${opt.label === "HL" ? "Home Language" : "First Additional Language"}`)}
                              className="text-xs px-3 py-1 rounded-full border transition-all"
                              style={{
                                background: entry.subjectSlug === opt.slug ? "var(--accent-blue)" : "transparent",
                                borderColor: entry.subjectSlug === opt.slug ? "var(--accent-blue)" : "var(--border-medium)",
                                color: entry.subjectSlug === opt.slug ? "#fff" : "var(--text-secondary)",
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {entry.id === "2" && (
                        <div className="flex gap-2 mt-2">
                          {[
                            { slug: "mathematics", label: "Maths" },
                            { slug: "mathematical-literacy", label: "Maths Lit" },
                          ].map((opt) => (
                            <button
                              key={opt.slug}
                              onClick={() => swapSubject(entry.id, opt.slug, opt.slug === "mathematics" ? "Mathematics" : "Mathematical Literacy")}
                              className="text-xs px-3 py-1 rounded-full border transition-all"
                              style={{
                                background: entry.subjectSlug === opt.slug ? "var(--accent-blue)" : "transparent",
                                borderColor: entry.subjectSlug === opt.slug ? "var(--accent-blue)" : "var(--border-medium)",
                                color: entry.subjectSlug === opt.slug ? "#fff" : "var(--text-secondary)",
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {isLO && (
                        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Excluded from APS by most universities</div>
                      )}
                    </div>
                  ) : entry.subjectSlug ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{entry.subjectName}</span>
                      <button
                        onClick={() => setSubjects((prev) => prev.map((s) => s.id === entry.id ? { ...s, subjectSlug: null, subjectName: "", mark: "" } : s))}
                        className="text-xs px-2 py-0.5 rounded-full border cursor-pointer"
                        style={{ color: "var(--text-muted)", borderColor: "var(--border-subtle)", background: "transparent" }}
                      >
                        change
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search subjects..."
                        value={activeCombobox === entry.id ? searchTerm : ""}
                        onFocus={() => { setActiveCombobox(entry.id); setSearchTerm(""); setHighlightedIndex(0); }}
                        onChange={(e) => { setSearchTerm(e.target.value); setHighlightedIndex(0); }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1)); }
                          if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)); }
                          if (e.key === "Enter" && filteredOptions[highlightedIndex]) { e.preventDefault(); selectSubject(entry.id, filteredOptions[highlightedIndex]); }
                          if (e.key === "Escape") { setActiveCombobox(null); setSearchTerm(""); }
                        }}
                        className="input-field !py-2 !text-sm"
                      />
                      {activeCombobox === entry.id && filteredOptions.length > 0 && (
                        <div className="combobox-dropdown">
                          {filteredOptions.slice(0, 15).map((opt, i) => (
                            <div
                              key={opt.slug}
                              className={`combobox-option ${i === highlightedIndex ? "highlighted" : ""}`}
                              onMouseDown={(e) => { e.preventDefault(); selectSubject(entry.id, opt); }}
                              onMouseEnter={() => setHighlightedIndex(i)}
                            >
                              <span>{opt.name}</span>
                              <span className="category-tag ml-2">{opt.category}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mark input + Level badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {entry.subjectSlug && (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          data-mark-id={entry.id}
                          placeholder="%"
                          value={entry.mark}
                          onChange={(e) => updateMark(entry.id, e.target.value.replace(/\D/g, ""))}
                          className="input-mark"
                          maxLength={3}
                        />
                      </div>
                      {level !== null && (
                        <div
                          className="badge-level"
                          style={{ background: `${APS_LEVEL_COLORS[level]}20`, color: APS_LEVEL_COLORS[level] }}
                        >
                          {level}
                        </div>
                      )}
                    </>
                  )}
                  {!entry.isCompulsory && (
                    <button
                      onClick={() => removeSubject(entry.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-sm cursor-pointer border-0"
                      style={{ color: "var(--text-muted)", background: "transparent" }}
                      title="Remove subject"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Subject Button */}
        {subjects.length < 9 && (
          <button onClick={addSubject} className="w-full py-3 text-sm font-medium rounded-xl border-2 border-dashed cursor-pointer transition-colors" style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)", background: "transparent" }}>
            + Add Another Subject
          </button>
        )}
      </section>

      {/* ── Sticky APS Bar ──────────────────────────────── */}
      <div className="sticky-aps-bar">
        <div className="container-app">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Your APS</div>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: currentAPS > 0 ? "var(--accent-blue)" : "var(--text-muted)" }}>
                  {currentAPS}<span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>/{maxAPS}</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {validSubjects.length} subject{validSubjects.length !== 1 ? "s" : ""} entered
                  {!canSubmit && ` (need ${6 - validSubjects.length} more)`}
                </div>
                <div className="w-32 mt-1 progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${(currentAPS / maxAPS) * 100}%`, background: "linear-gradient(90deg, var(--accent-blue), var(--accent-purple))" }} />
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              className="btn-primary !py-3 !px-6 !text-sm"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Matching...
                </span>
              ) : (
                "Find My Matches →"
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
