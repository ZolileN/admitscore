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
  ufs: "UFS",
  univen: "UNIVEN",
  spu: "SPU",
  wsu: "WSU",
  rhodes: "Rhodes",
  eeetvet: "EEC TVET",
  coastalkzn: "Coastal KZN",
  southcape: "South Cape TVET",
  orbit: "Orbit TVET",
  umfolozi: "Umfolozi TVET",
  westcoast: "West Coast TVET",
};

export function getUniversityAbbreviation(slug: string, fallbackName: string) {
  return UNIVERSITY_ABBREVIATIONS[slug] || fallbackName.split(" ").slice(0, 2).join(" ");
}
