"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface UniversityCard {
  name: string;
  slug: string;
  province: string;
  logoUrl?: string | null;
  programCount: number;
}

interface RequirementsGridProps {
  universities: UniversityCard[];
}

export default function RequirementsGrid({ universities }: RequirementsGridProps) {
  const [query, setQuery] = useState("");

  const filteredUniversities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return universities;

    return universities.filter((uni) =>
      uni.name.toLowerCase().includes(normalizedQuery) ||
      uni.province.toLowerCase().includes(normalizedQuery) ||
      uni.slug.toLowerCase().includes(normalizedQuery)
    );
  }, [query, universities]);

  return (
    <>
      <div className="mb-8">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search universities or provinces..."
          className="input-field max-w-xl"
          aria-label="Search universities"
        />
        {query && (
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            {filteredUniversities.length} of {universities.length} universities
          </p>
        )}
      </div>

      {filteredUniversities.length === 0 ? (
        <div className="glass-card-static p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No universities match &ldquo;{query}&rdquo;. Try a different search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredUniversities.map((uni) => (
            <Link
              key={uni.slug}
              href={`/requirements/${uni.slug}`}
              className="glass-card p-6 no-underline block group"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))", color: "var(--accent-blue)" }}>
                  {uni.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={uni.logoUrl} alt="" className="w-8 h-8 object-contain" />
                  ) : (
                    uni.name.split(" ").map((word) => word[0]).join("").slice(0, 3)
                  )}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {uni.slug === "unisa" && (
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>
                      Distance learning
                    </span>
                  )}
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                    {uni.province}
                  </span>
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>
                {uni.name}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {uni.programCount} program{uni.programCount !== 1 ? "s" : ""} available
              </p>
              <div className="mt-4 flex items-center text-sm font-medium" style={{ color: "var(--accent-blue)" }}>
                View Programs →
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
