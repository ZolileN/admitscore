"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface ProgramCardData {
  slug: string;
  name: string;
  faculty: string;
  qualificationType: string;
  durationYears: number;
  minAps: number | null;
}

interface UniversityProgramsGridProps {
  universitySlug: string;
  programs: ProgramCardData[];
}

export default function UniversityProgramsGrid({ universitySlug, programs }: UniversityProgramsGridProps) {
  const [query, setQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");

  const faculties = useMemo(
    () => Array.from(new Set(programs.map((program) => program.faculty))).sort(),
    [programs]
  );

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesQuery =
        !normalizedQuery ||
        program.name.toLowerCase().includes(normalizedQuery) ||
        program.faculty.toLowerCase().includes(normalizedQuery);

      const matchesFaculty = facultyFilter === "all" || program.faculty === facultyFilter;
      return matchesQuery && matchesFaculty;
    });
  }, [programs, query, facultyFilter]);

  const groupedPrograms = useMemo(() => {
    const groups = new Map<string, ProgramCardData[]>();
    for (const program of filteredPrograms) {
      const group = groups.get(program.faculty) || [];
      group.push(program);
      groups.set(program.faculty, group);
    }
    return groups;
  }, [filteredPrograms]);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-3 mb-8">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search programmes..."
          className="input-field flex-1"
          aria-label="Search programmes"
        />
        <select
          value={facultyFilter}
          onChange={(event) => setFacultyFilter(event.target.value)}
          className="input-field lg:max-w-xs"
          aria-label="Filter by faculty"
        >
          <option value="all">All faculties</option>
          {faculties.map((faculty) => (
            <option key={faculty} value={faculty}>{faculty}</option>
          ))}
        </select>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="glass-card-static p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No programmes match your search.
          </p>
        </div>
      ) : (
        Array.from(groupedPrograms.entries()).map(([faculty, facultyPrograms]) => (
          <div key={faculty} className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>
              {faculty}
            </h2>
            <div className="space-y-3">
              {facultyPrograms.map((program) => (
                <Link
                  key={program.slug}
                  href={`/requirements/${universitySlug}/${program.slug}`}
                  className="glass-card p-4 flex items-center justify-between no-underline block"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{program.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {program.qualificationType === "degree" ? "Degree" : program.qualificationType === "diploma" ? "Diploma" : "Extended"} · {program.durationYears} years
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {program.minAps !== null && (
                      <div className="text-right">
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>Min APS</div>
                        <div className="text-lg font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--accent-blue)" }}>
                          {program.minAps}
                        </div>
                      </div>
                    )}
                    <span style={{ color: "var(--text-muted)" }}>›</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
