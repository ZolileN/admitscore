import type { LifeOrientationRule } from "./aps";
import { getMaxAPS } from "./aps";

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

export function usesUkznBonusScoring(apsSystemType?: string): boolean {
  return apsSystemType === "ukzn_bonus";
}

export function getMaxApsForUniversity(universitySlug: string, apsSystemType?: string) {
  const rule = getLifeOrientationRule(universitySlug, apsSystemType);
  return getMaxAPS(rule, usesUkznBonusScoring(apsSystemType));
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
  nwu: "https://www.google.com/s2/favicons?domain=nwu.ac.za&sz=128",
  ukzn: "https://www.google.com/s2/favicons?domain=ukzn.ac.za&sz=128",
  nmu: "https://www.google.com/s2/favicons?domain=mandela.ac.za&sz=128",
  cput: "https://www.google.com/s2/favicons?domain=cput.ac.za&sz=128",
  tut: "https://www.google.com/s2/favicons?domain=tut.ac.za&sz=128",
  dut: "https://www.google.com/s2/favicons?domain=dut.ac.za&sz=128",
  falsebay: "https://www.google.com/s2/favicons?domain=falsebay.org.za&sz=128",
  ufs: "https://www.google.com/s2/favicons?domain=ufs.ac.za&sz=128",
  univen: "https://www.google.com/s2/favicons?domain=univen.ac.za&sz=128",
  spu: "https://www.google.com/s2/favicons?domain=spu.ac.za&sz=128",
  wsu: "https://www.google.com/s2/favicons?domain=wsu.ac.za&sz=128",
  rhodes: "https://www.google.com/s2/favicons?domain=ru.ac.za&sz=128",
  eeetvet: "https://www.google.com/s2/favicons?domain=eec.edu.za&sz=128",
  coastalkzn: "https://www.google.com/s2/favicons?domain=coastalkzn.co.za&sz=128",
  southcape: "https://www.google.com/s2/favicons?domain=sccollege.co.za&sz=128",
  orbit: "https://www.google.com/s2/favicons?domain=orbit.co.za&sz=128",
  umfolozi: "https://www.google.com/s2/favicons?domain=umfolozicollege.co.za&sz=128",
  westcoast: "https://www.google.com/s2/favicons?domain=westcoastcollege.co.za&sz=128",
};
