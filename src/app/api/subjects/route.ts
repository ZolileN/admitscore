import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";

export async function GET() {
  try {
    const allSubjects = db.select().from(subjects).all();
    return NextResponse.json(allSubjects);
  } catch (error) {
    console.error("Subjects API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
