import { db } from "@/db";
import { universities, programs } from "@/db/schema";
import { count } from "drizzle-orm";

export async function getSiteStats() {
  const [uniCount] = await db.select({ count: count() }).from(universities);
  const [progCount] = await db.select({ count: count() }).from(programs);

  return {
    universityCount: uniCount.count,
    programCount: progCount.count,
  };
}

export async function getUniversitiesWithProgramCounts() {
  const allUnis = await db.select().from(universities);
  const allProgs = await db.select().from(programs);
  const uniPrograms = new Map<number, number>();

  for (const program of allProgs) {
    uniPrograms.set(program.universityId, (uniPrograms.get(program.universityId) || 0) + 1);
  }

  return allUnis
    .map((uni) => ({
      name: uni.name,
      slug: uni.slug,
      province: uni.province,
      programCount: uniPrograms.get(uni.id) || 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
