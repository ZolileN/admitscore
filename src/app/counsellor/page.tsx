"use client";

import { useState } from "react";
import Link from "next/link";
import { encodeResultsParam } from "@/lib/results-url";

interface StudentRow {
  id: string;
  name: string;
  englishMark: string;
  mathsMark: string;
  scienceMark: string;
}

let rowId = 1;

export default function CounsellorPage() {
  const [rows, setRows] = useState<StudentRow[]>([
    { id: String(rowId++), name: "Student 1", englishMark: "65", mathsMark: "58", scienceMark: "62" },
  ]);

  const addRow = () => {
    setRows((prev) => [...prev, { id: String(rowId++), name: `Student ${prev.length + 1}`, englishMark: "", mathsMark: "", scienceMark: "" }]);
  };

  const updateRow = (id: string, field: keyof StudentRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const buildResultsUrl = (row: StudentRow) => {
    const entries = [
      { subjectSlug: "english-hl", mark: Number(row.englishMark) || 0 },
      { subjectSlug: "mathematics", mark: Number(row.mathsMark) || 0 },
      { subjectSlug: "physical-sciences", mark: Number(row.scienceMark) || 0 },
      { subjectSlug: "life-orientation", mark: 70 },
      { subjectSlug: "life-sciences", mark: 55 },
      { subjectSlug: "geography", mark: 60 },
    ].filter((e) => e.mark > 0);
    return `/results?s=${encodeResultsParam(entries)}`;
  };

  const printReport = () => {
    window.print();
  };

  return (
    <main className="min-h-screen pb-16">
      <div className="container-wide pt-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
            Counsellor mode
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Enter quick marks for multiple learners and open individual match reports. Use Print for a class summary.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={addRow} className="btn-secondary !text-sm">Add student</button>
          <button type="button" onClick={printReport} className="btn-primary !text-sm">Print summary</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">English %</th>
                <th className="text-left py-3 px-2">Maths %</th>
                <th className="text-left py-3 px-2">Physical Sciences %</th>
                <th className="text-left py-3 px-2 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="py-3 px-2">
                    <input
                      className="input-field !py-2 !text-sm w-full max-w-[160px]"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, "name", e.target.value)}
                    />
                  </td>
                  {(["englishMark", "mathsMark", "scienceMark"] as const).map((field) => (
                    <td key={field} className="py-3 px-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="input-field !py-2 !text-sm w-20"
                        value={row[field]}
                        onChange={(e) => updateRow(row.id, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="py-3 px-2 print:hidden">
                    <Link href={buildResultsUrl(row)} className="btn-primary !py-2 !px-3 !text-xs no-underline">
                      View matches
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs print:block hidden" style={{ color: "var(--text-muted)" }}>
          AdmitScore counsellor summary — {new Date().toLocaleDateString("en-ZA")}
        </p>
      </div>
    </main>
  );
}
