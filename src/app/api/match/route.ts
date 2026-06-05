import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, programApsRules, programSubjectRules, universities, subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { percentageToLevel } from "@/lib/aps";
import { matchRequestSchema } from "@/lib/validators";
import type { ProgramMatch, SubjectRequirement, MatchResults } from "@/lib/types";

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

    // ── Build O(1) lookup map ────────────────────────────
    const markMap = new Map<number, { mark: number; level: number }>();
    for (const sm of studentMarks) {
      markMap.set(sm.subjectId, {
        mark: sm.mark,
        level: percentageToLevel(sm.mark),
      });
    }

    // ── Calculate student APS (exclude LO, best 6) ──────
    const loRows = db.select({ id: subjects.id }).from(subjects).where(eq(subjects.slug, "life-orientation")).all();
    const loId = loRows.length > 0 ? loRows[0].id : undefined;

    const allLevels: number[] = [];
    for (const [subId, data] of markMap.entries()) {
      if (subId !== loId) {
        allLevels.push(data.level);
      }
    }
    allLevels.sort((a, b) => b - a);
    const studentAps = allLevels.slice(0, 6).reduce((sum, l) => sum + l, 0);

    // ── Fetch all programs ───────────────────────────────
    const allProgramRows = db.select().from(programs).all();
    const allUniRows = db.select().from(universities).all();
    const allApsRules = db.select().from(programApsRules).all();
    const allSubjectRules = db.select().from(programSubjectRules).all();
    const allSubjects = db.select().from(subjects).all();

    // Build lookup maps
    const uniMap = new Map(allUniRows.map(u => [u.id, u]));
    const apsRuleMap = new Map(allApsRules.map(r => [r.programId, r]));
    const subjectMap = new Map(allSubjects.map(s => [s.id, s]));
    const subjectRulesMap = new Map<number, typeof allSubjectRules>();
    for (const rule of allSubjectRules) {
      const existing = subjectRulesMap.get(rule.programId) || [];
      existing.push(rule);
      subjectRulesMap.set(rule.programId, existing);
    }

    // ── Evaluate each program ────────────────────────────
    const safeBets: ProgramMatch[] = [];
    const exactMatches: ProgramMatch[] = [];
    const nearMisses: ProgramMatch[] = [];

    for (const program of allProgramRows) {
      const apsRule = apsRuleMap.get(program.id);
      const uni = uniMap.get(program.universityId);
      if (!apsRule || !uni) continue;

      const requiredAps = apsRule.minApsScore;
      const apsGap = Math.max(0, requiredAps - studentAps);

      // ── Evaluate subject requirements ──────────────────
      const rules = subjectRulesMap.get(program.id) || [];
      const subjectReqs: SubjectRequirement[] = [];
      let allMandatoryMet = true;
      const orGroups = new Map<number, boolean>();

      for (const rule of rules) {
        const subjectData = subjectMap.get(rule.subjectId);
        const studentData = markMap.get(rule.subjectId);
        const studentLevel = studentData?.level ?? null;
        const met = studentLevel !== null && studentLevel >= rule.minLevel;
        const gap = studentLevel !== null ? Math.max(0, rule.minLevel - studentLevel) : rule.minLevel;

        subjectReqs.push({
          subjectId: rule.subjectId,
          subjectName: subjectData?.name || "Unknown",
          minLevel: rule.minLevel,
          groupId: rule.groupId,
          met,
          studentLevel,
          gap,
        });

        if (rule.groupId !== null) {
          const currentGroupStatus = orGroups.get(rule.groupId) || false;
          orGroups.set(rule.groupId, currentGroupStatus || met);
        } else {
          if (!met) allMandatoryMet = false;
        }
      }

      let allOrGroupsMet = true;
      for (const [, groupMet] of orGroups) {
        if (!groupMet) allOrGroupsMet = false;
      }

      const allSubjectsMet = allMandatoryMet && allOrGroupsMet;

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
        studentAps,
        apsGap,
        subjectRequirements: subjectReqs,
        category: "near",
      };

      if (allSubjectsMet && apsGap === 0 && studentAps >= requiredAps + 3) {
        match.category = "safe";
        safeBets.push(match);
      } else if (allSubjectsMet && apsGap === 0) {
        match.category = "exact";
        exactMatches.push(match);
      } else if (apsGap <= 5) {
        match.category = "near";
        nearMisses.push(match);
      }
    }

    safeBets.sort((a, b) => b.requiredAps - a.requiredAps);
    exactMatches.sort((a, b) => a.apsGap - b.apsGap);
    nearMisses.sort((a, b) => a.apsGap - b.apsGap);

    const result: MatchResults = {
      studentAps,
      totalPrograms: safeBets.length + exactMatches.length + nearMisses.length,
      results: { safeBets, exactMatches, nearMisses },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Match API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
