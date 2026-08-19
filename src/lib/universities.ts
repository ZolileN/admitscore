export const UNIVERSITY_ABBREVIATIONS: Record<string, string> = {
  uct: "UCT",
  wits: "Wits",
  up: "UP",
  uj: "UJ",
  stellenbosch: "Stellenbosch",
  unisa: "UNISA",
};

export function getUniversityAbbreviation(slug: string, fallbackName: string) {
  return UNIVERSITY_ABBREVIATIONS[slug] || fallbackName.split(" ").slice(0, 2).join(" ");
}
