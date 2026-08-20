export const DATA_UPDATED_AT = "2026-08-20";

export const BURSARY_HINTS: Record<string, string> = {
  default: "Check NSFAS and faculty bursaries on the university website.",
  medicine: "Health sciences programmes often have additional bursary and selection processes.",
  engineering: "Engineering faculties may offer merit bursaries for strong Maths and Physical Sciences.",
  unisa: "UNISA students may qualify for NSFAS if registered for sufficient credits.",
};

export function getBursaryNote(faculty: string, universitySlug: string): string {
  if (universitySlug === "unisa") return BURSARY_HINTS.unisa;
  const lower = faculty.toLowerCase();
  if (lower.includes("health") || lower.includes("medicine")) return BURSARY_HINTS.medicine;
  if (lower.includes("engineer")) return BURSARY_HINTS.engineering;
  return BURSARY_HINTS.default;
}
