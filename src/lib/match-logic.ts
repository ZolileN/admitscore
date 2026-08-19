import type { SubjectRequirement } from "./types";

export function evaluateSubjectRequirements(
  rules: Array<{ subjectId: number; minLevel: number; groupId: number | null }>,
  markMap: Map<number, { mark: number; level: number }>,
  subjectNames: Map<number, string>
) {
  const subjectReqs: SubjectRequirement[] = [];
  let allMandatoryMet = true;
  const orGroups = new Map<number, boolean>();
  let totalSubjectGap = 0;
  let failedMandatoryCount = 0;
  let closestOrGroupGap = 0;

  for (const rule of rules) {
    const studentData = markMap.get(rule.subjectId);
    const studentLevel = studentData?.level ?? null;
    const met = studentLevel !== null && studentLevel >= rule.minLevel;
    const gap = studentLevel !== null ? Math.max(0, rule.minLevel - studentLevel) : rule.minLevel;

    subjectReqs.push({
      subjectId: rule.subjectId,
      subjectName: subjectNames.get(rule.subjectId) || "Unknown",
      minLevel: rule.minLevel,
      groupId: rule.groupId,
      met,
      studentLevel,
      gap,
    });

    if (rule.groupId !== null) {
      const currentGroupStatus = orGroups.get(rule.groupId) || false;
      orGroups.set(rule.groupId, currentGroupStatus || met);
    } else if (!met) {
      allMandatoryMet = false;
      failedMandatoryCount += 1;
      totalSubjectGap += gap;
    }
  }

  let allOrGroupsMet = true;
  for (const [groupId, groupMet] of orGroups) {
    if (!groupMet) {
      allOrGroupsMet = false;
      const groupRules = subjectReqs.filter((req) => req.groupId === groupId);
      const minGroupGap = Math.min(...groupRules.map((req) => req.gap));
      closestOrGroupGap = Math.max(closestOrGroupGap, minGroupGap);
    }
  }

  const allSubjectsMet = allMandatoryMet && allOrGroupsMet;
  const subjectGapScore = totalSubjectGap + closestOrGroupGap;

  return {
    subjectReqs,
    allSubjectsMet,
    failedMandatoryCount,
    subjectGapScore,
  };
}

export function categorizeMatch(input: {
  allSubjectsMet: boolean;
  apsGap: number;
  subjectGapScore: number;
  studentAps: number;
  requiredAps: number;
}) {
  const { allSubjectsMet, apsGap, subjectGapScore, studentAps, requiredAps } = input;

  if (allSubjectsMet && apsGap === 0 && studentAps >= requiredAps + 3) {
    return "safe" as const;
  }

  if (allSubjectsMet && apsGap === 0) {
    return "exact" as const;
  }

  const isNearAps = apsGap > 0 && apsGap <= 5;
  const isNearSubjects = !allSubjectsMet && subjectGapScore <= 3 && apsGap <= 8;

  if (isNearAps || isNearSubjects) {
    return "near" as const;
  }

  return null;
}

export function getNearMissSummary(requirements: SubjectRequirement[]) {
  const failed = requirements.filter((req) => !req.met);
  if (failed.length === 0) return null;

  return failed
    .slice(0, 3)
    .map((req) => `${req.subjectName} (need L${req.minLevel}, yours ${req.studentLevel ?? "—"})`)
    .join(" · ");
}
