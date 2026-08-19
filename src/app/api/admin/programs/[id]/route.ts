import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, programApsRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { z } from "zod";

const updateSchema = z.object({
  minAps: z.number().int().min(0).max(50).optional(),
  description: z.string().max(500).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(request)) return unauthorizedResponse();

  const { id } = await context.params;
  const programId = parseInt(id, 10);
  if (Number.isNaN(programId)) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.description !== undefined) {
    await db.update(programs).set({ description: parsed.data.description }).where(eq(programs.id, programId));
  }

  if (parsed.data.minAps !== undefined) {
    const existing = await db.select().from(programApsRules).where(eq(programApsRules.programId, programId));
    if (existing.length > 0) {
      await db.update(programApsRules).set({ minApsScore: parsed.data.minAps }).where(eq(programApsRules.programId, programId));
    } else {
      await db.insert(programApsRules).values({ programId, minApsScore: parsed.data.minAps });
    }
  }

  return NextResponse.json({ success: true });
}
