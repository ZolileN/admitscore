export const UNIVERSITY_ABBREVIATIONS: Record<string, string> = {
  uct: "UCT",
  wits: "Wits",
  up: "UP",
  uj: "UJ",
  stellenbosch: "Stellenbosch",
  unisa: "UNISA",
  nwu: "NWU",
  ukzn: "UKZN",
  nmu: "NMU",
  cput: "CPUT",
  tut: "TUT",
  dut: "DUT",
  falsebay: "False Bay TVET",
};

export function getUniversityAbbreviation(slug: string, fallbackName: string) {
  return UNIVERSITY_ABBREVIATIONS[slug] || fallbackName.split(" ").slice(0, 2).join(" ");
}
