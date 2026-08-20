"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProgramMatch } from "@/lib/types";
import CompareBar from "./CompareBar";

interface ResultsProgramListProps {
  programs: ProgramMatch[];
}

export default function ResultsProgramList({ programs }: ResultsProgramListProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const selectedPrograms = useMemo(
    () => programs.filter((program) => selectedKeys.includes(`${program.universitySlug}:${program.programSlug}`)),
    [programs, selectedKeys]
  );

  const toggleProgram = (program: ProgramMatch) => {
    const key = `${program.universitySlug}:${program.programSlug}`;
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : current.length < 3 ? [...current, key] : current
    );
  };

  return (
    <>
      <div className="space-y-4 stagger-children">
        {programs.map((program) => {
          const key = `${program.universitySlug}:${program.programSlug}`;
          const isSelected = selectedKeys.includes(key);

          return (
            <div key={key} className="relative">
              <label className="absolute top-4 right-4 z-10 flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleProgram(program)}
                  className="accent-blue-500"
                />
                Compare
              </label>
              <ProgramCard program={program} />
            </div>
          );
        })}
      </div>
      <CompareBar selectedPrograms={selectedPrograms} onClear={() => setSelectedKeys([])} />
    </>
  );
}

function ProgramCard({ program }: { program: ProgramMatch }) {
  const borderColor = program.category === "safe" ? "var(--accent-emerald)" : program.category === "exact" ? "var(--accent-blue)" : "var(--accent-amber)";
  const glowClass = program.category === "safe" ? "glow-emerald" : program.category === "exact" ? "glow-blue" : "glow-amber";
  const badgeClass = program.category === "safe" ? "badge-safe" : program.category === "exact" ? "badge-exact" : "badge-near";
  const badgeLabel = program.category === "safe" ? "Safe Bet" : program.category === "exact" ? "Match" : "Near Miss";
  const apsPercent = Math.min(100, (program.studentAps / program.requiredAps) * 100);

  const mandatory = program.subjectRequirements.filter((req) => req.groupId === null);
  const orGroupsMap = new Map<number, typeof program.subjectRequirements>();
  for (const req of program.subjectRequirements.filter((entry) => entry.groupId !== null)) {
    const group = orGroupsMap.get(req.groupId!) || [];
    group.push(req);
    orGroupsMap.set(req.groupId!, group);
  }

  return (
    <div className={`glass-card-static p-5 pr-24 ${glowClass}`} style={{ borderLeft: `3px solid ${borderColor}` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <Link href={`/requirements/${program.universitySlug}/${program.programSlug}`} className="text-base font-bold no-underline hover:underline" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>
            {program.programName}
          </Link>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {program.universityName} · {program.faculty}
          </div>
          {program.nsfasEligible && (
            <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-emerald)" }}>
              NSFAS eligible
            </span>
          )}
          {program.bursaryNote && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{program.bursaryNote}</p>
          )}
          {program.universitySlug === "unisa" && (
            <div className="text-xs mt-1" style={{ color: "var(--accent-amber)" }}>
              Space-limited admission — minimum APS is not a guarantee.
            </div>
          )}
        </div>
        <span className={`badge ${badgeClass} shrink-0`}>{badgeLabel}</span>
      </div>

      {program.category === "near" && program.nearMissSummary && (
        <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: "rgba(245,158,11,0.08)", color: "var(--accent-amber)" }}>
          <strong>To qualify:</strong> {program.nearMissSummary}
        </div>
      )}

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

      <div className="space-y-1.5">
        {mandatory.map((req) => (
          <SubjectReqRow key={req.subjectId} req={req} isNearMiss={program.category === "near"} />
        ))}
        {Array.from(orGroupsMap.entries()).map(([groupId, reqs]) => {
          const anyMet = reqs.some((req) => req.met);
          return (
            <div key={groupId} className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="w-4 text-center">{anyMet ? "✓" : "✗"}</span>
              <span style={{ color: anyMet ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                {reqs.map((req, index) => (
                  <span key={req.subjectId}>
                    {index > 0 && <span style={{ color: "var(--text-muted)" }}> or </span>}
                    {req.subjectName} (L{req.minLevel}+)
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
    <div className="flex items-center gap-1.5 text-xs flex-wrap">
      <span className="w-4 text-center">{req.met ? "✓" : "✗"}</span>
      <span style={{ color: req.met ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
        {req.subjectName}: Level {req.minLevel}+
      </span>
      {!req.met && isNearMiss && req.studentLevel !== null && req.gap > 0 && (
        <span className="text-xs font-medium" style={{ color: "var(--accent-amber)" }}>
          — Short by {req.gap} level{req.gap !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
