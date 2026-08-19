import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { universities, programs, programApsRules } from "@/db/schema";
import { count } from "drizzle-orm";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) return unauthorizedResponse();

  const [uniCount] = await db.select({ count: count() }).from(universities);
  const [progCount] = await db.select({ count: count() }).from(programs);
  const allPrograms = await db.select().from(programs);
  const allUnis = await db.select().from(universities);
  const allApsRules = await db.select().from(programApsRules);
  const apsMap = new Map(allApsRules.map((rule) => [rule.programId, rule.minApsScore]));
  const uniMap = new Map(allUnis.map((uni) => [uni.id, uni.name]));

  return NextResponse.json({
    stats: {
      universities: uniCount.count,
      programs: progCount.count,
    },
    programs: allPrograms.map((program) => ({
      id: program.id,
      name: program.name,
      slug: program.slug,
      universityName: uniMap.get(program.universityId),
      faculty: program.faculty,
      minAps: apsMap.get(program.id) ?? null,
      description: program.description,
    })),
  });
}
