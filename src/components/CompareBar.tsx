"use client";

import Link from "next/link";
import type { ProgramMatch } from "@/lib/types";

interface CompareBarProps {
  selectedPrograms: ProgramMatch[];
  onClear: () => void;
}

export default function CompareBar({ selectedPrograms, onClear }: CompareBarProps) {
  if (selectedPrograms.length === 0) return null;

  const compareParam = selectedPrograms
    .map((program) => `${program.universitySlug}:${program.programSlug}`)
    .join(",");

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40">
      <div className="container-app">
        <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{selectedPrograms.length} programme{selectedPrograms.length !== 1 ? "s" : ""} selected</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Compare APS and subject requirements side by side.
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={onClear} className="btn-secondary !py-2 !px-4 !text-xs flex-1 sm:flex-none">
              Clear
            </button>
            <Link
              href={`/compare?p=${encodeURIComponent(compareParam)}`}
              className="btn-primary !py-2 !px-4 !text-xs no-underline flex-1 sm:flex-none text-center"
            >
              Compare →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
