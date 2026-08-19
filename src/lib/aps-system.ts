import type { LifeOrientationRule } from "./aps";

const LO_RULE_BY_UNIVERSITY: Record<string, LifeOrientationRule> = {
  wits: "cap4",
};

export function getLifeOrientationRule(universitySlug: string, apsSystemType?: string): LifeOrientationRule {
  if (LO_RULE_BY_UNIVERSITY[universitySlug]) {
    return LO_RULE_BY_UNIVERSITY[universitySlug];
  }

  if (apsSystemType === "cap4") return "cap4";
  if (apsSystemType === "halve") return "halve";
  if (apsSystemType === "include") return "include";

  return "exclude";
}

export function getMaxApsForUniversity(universitySlug: string, apsSystemType?: string) {
  const rule = getLifeOrientationRule(universitySlug, apsSystemType);
  if (rule === "exclude") return 42;
  if (rule === "cap4") return 46;
  return 49;
}

export const UNISA_ADMISSION_NOTE =
  "Meeting the minimum APS does not guarantee admission. UNISA programmes are space-limited and competitive.";

export const UNIVERSITY_LOGOS: Record<string, string> = {
  uct: "https://www.google.com/s2/favicons?domain=uct.ac.za&sz=128",
  wits: "https://www.google.com/s2/favicons?domain=wits.ac.za&sz=128",
  up: "https://www.google.com/s2/favicons?domain=up.ac.za&sz=128",
  uj: "https://www.google.com/s2/favicons?domain=uj.ac.za&sz=128",
  stellenbosch: "https://www.google.com/s2/favicons?domain=sun.ac.za&sz=128",
  unisa: "https://www.google.com/s2/favicons?domain=unisa.ac.za&sz=128",
};
