import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, programApsRules, programSubjectRules, universities, subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateAPS, percentageToLevel } from "@/lib/aps";
import { getLifeOrientationRule, usesUkznBonusScoring } from "@/lib/aps-system";
import { categorizeMatch, evaluateSubjectRequirements } from "@/lib/match-logic";
import { getBursaryNote } from "@/lib/bursaries";
import { matchRequestSchema } from "@/lib/validators";
import { bucketAps, bucketCount } from "@/lib/analytics-shared";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import type { ProgramMatch, MatchResults } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = matchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const studentMarks = parsed.data.subjects;
    const markMap = new Map<number, { mark: number; level: number }>();
    for (const studentMark of studentMarks) {
      markMap.set(studentMark.subjectId, {
        mark: studentMark.mark,
        level: percentageToLevel(studentMark.mark),
      });
    }

    const loRows = await db.select({ id: subjects.id }).from(subjects).where(eq(subjects.slug, "life-orientation"));
    const loId = loRows.length > 0 ? loRows[0].id : undefined;
    const subjectMarks = studentMarks.map((entry) => ({ subjectId: entry.subjectId, mark: entry.mark }));
    const standardAps = calculateAPS(subjectMarks, {
      lifeOrientationRule: "exclude",
      lifeOrientationSubjectId: loId,
    });

    const allProgramRows = await db.select().from(programs);
    const allUniRows = await db.select().from(universities);
    const allApsRules = await db.select().from(programApsRules);
    const allSubjectRules = await db.select().from(programSubjectRules);
    const allSubjects = await db.select().from(subjects);

    const uniMap = new Map(allUniRows.map((uni) => [uni.id, uni]));
    const apsRuleMap = new Map(allApsRules.map((rule) => [rule.programId, rule]));
    const subjectMap = new Map(allSubjects.map((subject) => [subject.id, subject]));
    const subjectRulesMap = new Map<number, typeof allSubjectRules>();

    for (const rule of allSubjectRules) {
      const existing = subjectRulesMap.get(rule.programId) || [];
      existing.push(rule);
      subjectRulesMap.set(rule.programId, existing);
    }

    const safeBets: ProgramMatch[] = [];
    const exactMatches: ProgramMatch[] = [];
    const nearMisses: ProgramMatch[] = [];

    for (const program of allProgramRows) {
      const apsRule = apsRuleMap.get(program.id);
      const uni = uniMap.get(program.universityId);
      if (!apsRule || !uni) continue;

      const loRule = getLifeOrientationRule(uni.slug, uni.apsSystemType);
      const programStudentAps = calculateAPS(subjectMarks, {
        lifeOrientationRule: loRule,
        lifeOrientationSubjectId: loId,
        useUkznBonus: usesUkznBonusScoring(uni.apsSystemType),
      });

      const requiredAps = apsRule.minApsScore;
      const apsGap = Math.max(0, requiredAps - programStudentAps);
      const rules = subjectRulesMap.get(program.id) || [];
      const subjectNames = new Map<number, string>();

      for (const rule of rules) {
        const subject = subjectMap.get(rule.subjectId);
        if (subject) subjectNames.set(rule.subjectId, subject.name);
      }

      const evaluation = evaluateSubjectRequirements(rules, markMap, subjectNames);
      const category = categorizeMatch({
        allSubjectsMet: evaluation.allSubjectsMet,
        apsGap,
        subjectGapScore: evaluation.subjectGapScore,
        studentAps: programStudentAps,
        requiredAps,
      });

      if (!category) continue;

      const match: ProgramMatch = {
        programId: program.id,
        programName: program.name,
        programSlug: program.slug,
        universityId: program.universityId,
        universityName: uni.name,
        universitySlug: uni.slug,
        faculty: program.faculty,
        qualificationType: program.qualificationType,
        durationYears: program.durationYears,
        requiredAps,
        studentAps: programStudentAps,
        apsGap,
        subjectRequirements: evaluation.subjectReqs,
        category,
        nearMissSummary: category === "near" ? evaluation.subjectReqs.filter((req) => !req.met).slice(0, 3).map((req) => `${req.subjectName} (need L${req.minLevel}${req.studentLevel !== null ? `, yours L${req.studentLevel}` : ""})`).join(" · ") || (apsGap > 0 ? `Need ${apsGap} more APS points` : null) : null,
        bursaryNote: program.bursaryNote ?? getBursaryNote(program.faculty, uni.slug),
        nsfasEligible: program.nsfasEligible,
      };

      if (category === "safe") safeBets.push(match);
      else if (category === "exact") exactMatches.push(match);
      else nearMisses.push(match);
    }

    safeBets.sort((a, b) => b.requiredAps - a.requiredAps);
    exactMatches.sort((a, b) => a.apsGap - b.apsGap);
    nearMisses.sort((a, b) => a.apsGap - b.apsGap || a.subjectRequirements.filter((req) => !req.met).length - b.subjectRequirements.filter((req) => !req.met).length);

    const result: MatchResults = {
      studentAps: standardAps,
      totalPrograms: safeBets.length + exactMatches.length + nearMisses.length,
      results: { safeBets, exactMatches, nearMisses },
    };

    void recordAnalyticsEvent("match_completed", {
      path: "/api/match",
      properties: {
        aps_bucket: bucketAps(standardAps),
        safe_bucket: bucketCount(safeBets.length),
        exact_bucket: bucketCount(exactMatches.length),
        near_bucket: bucketCount(nearMisses.length),
        total_matches: bucketCount(result.totalPrograms),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Match API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
