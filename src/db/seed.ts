import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { NSC_SUBJECTS } from "../lib/subjects";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

// ─── Helper ─────────────────────────────────────────────────
function getSubjectId(slug: string): number {
  const s = subjectMap.get(slug);
  if (!s) throw new Error(`Subject not found: ${slug}`);
  return s;
}
const subjectMap = new Map<string, number>();

async function seed() {
  console.log("🌱 Seeding AdmitScore database...\n");

  // ── Clear existing data ──
  await db.delete(schema.programSubjectRules);
  await db.delete(schema.programApsRules);
  await db.delete(schema.programs);
  await db.delete(schema.subjects);
  await db.delete(schema.universities);

  // ── Seed Subjects ──
  console.log("📚 Seeding subjects...");
  for (const s of NSC_SUBJECTS) {
    const result = await db.insert(schema.subjects).values({
      name: s.name, slug: s.slug, category: s.category, isCore: s.isCore,
    }).returning();
    subjectMap.set(s.slug, result[0].id);
  }
  console.log(`   ✓ ${NSC_SUBJECTS.length} subjects\n`);

  // ── Seed Universities ──
  console.log("🏛️  Seeding universities...");
  const unis = [
    { name: "University of Cape Town", slug: "uct", province: "Western Cape", websiteUrl: "https://uct.ac.za", apsSystemType: "standard" },
    { name: "University of the Witwatersrand", slug: "wits", province: "Gauteng", websiteUrl: "https://wits.ac.za", apsSystemType: "standard" },
    { name: "University of Pretoria", slug: "up", province: "Gauteng", websiteUrl: "https://up.ac.za", apsSystemType: "standard" },
    { name: "University of Johannesburg", slug: "uj", province: "Gauteng", websiteUrl: "https://uj.ac.za", apsSystemType: "standard" },
    { name: "Stellenbosch University", slug: "stellenbosch", province: "Western Cape", websiteUrl: "https://sun.ac.za", apsSystemType: "standard" },
  ];
  const uniMap = new Map<string, number>();
  for (const u of unis) {
    const result = await db.insert(schema.universities).values(u).returning();
    uniMap.set(u.slug, result[0].id);
  }
  console.log(`   ✓ ${unis.length} universities\n`);

  // ── Helper to add a program ──
  async function addProgram(
    uniSlug: string, name: string, slug: string, faculty: string,
    minAps: number, subjectReqs: { slug: string; minLevel: number; groupId?: number }[],
    opts?: { qualificationType?: string; durationYears?: number; description?: string }
  ) {
    const universityId = uniMap.get(uniSlug)!;
    const programResult = await db.insert(schema.programs).values({
      universityId, name, slug, faculty,
      qualificationType: opts?.qualificationType || "degree",
      durationYears: opts?.durationYears || 3,
      description: opts?.description || null,
    }).returning();
    const program = programResult[0];

    await db.insert(schema.programApsRules).values({ programId: program.id, minApsScore: minAps });

    for (const req of subjectReqs) {
      await db.insert(schema.programSubjectRules).values({
        programId: program.id,
        subjectId: getSubjectId(req.slug),
        minLevel: req.minLevel,
        groupId: req.groupId ?? null,
      });
    }
    return program;
  }

  // ─── UCT Programs ────────────────────────────────────────
  console.log("🎓 Seeding UCT programs...");
  await addProgram("uct", "BSc Computer Science", "bsc-computer-science", "Science", 36,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }],
    { description: "Study algorithms, data structures, and software engineering." });
  await addProgram("uct", "BSc Engineering (Electrical)", "bsc-eng-electrical", "Engineering & Built Environment", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("uct", "BSc Engineering (Mechanical)", "bsc-eng-mechanical", "Engineering & Built Environment", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("uct", "BSc Engineering (Civil)", "bsc-eng-civil", "Engineering & Built Environment", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("uct", "Bachelor of Commerce", "bcom", "Commerce", 36,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("uct", "BCom Accounting", "bcom-accounting", "Commerce", 37,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("uct", "Bachelor of Business Science", "bbussci", "Commerce", 38,
    [{ slug: "mathematics", minLevel: 6 }]);
  await addProgram("uct", "BA Humanities", "ba-humanities", "Humanities", 33,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("uct", "BA Law", "ba-law", "Law", 36,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }]);
  await addProgram("uct", "LLB", "llb", "Law", 36,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }], { durationYears: 4 });
  await addProgram("uct", "MBChB (Medicine)", "mbchb", "Health Sciences", 42,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 6 }, { slug: "life-sciences", minLevel: 6 }], { durationYears: 6 });
  await addProgram("uct", "BSc Biological Sciences", "bsc-biological-sciences", "Science", 34,
    [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4, groupId: 1 }, { slug: "physical-sciences", minLevel: 4, groupId: 1 }]);
  await addProgram("uct", "BSc Mathematics", "bsc-mathematics", "Science", 36,
    [{ slug: "mathematics", minLevel: 6 }]);
  await addProgram("uct", "BSc Actuarial Science", "bsc-actuarial-science", "Commerce", 40,
    [{ slug: "mathematics", minLevel: 7 }]);
  await addProgram("uct", "BA Social Work", "ba-social-work", "Humanities", 33,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });

  // ─── Wits Programs ───────────────────────────────────────
  console.log("🎓 Seeding Wits programs...");
  await addProgram("wits", "BSc Computer Science", "bsc-computer-science", "Science", 34,
    [{ slug: "mathematics", minLevel: 5 }]);
  await addProgram("wits", "BSc Engineering (Electrical)", "bsc-eng-electrical", "Engineering", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("wits", "BSc Engineering (Mechanical)", "bsc-eng-mechanical", "Engineering", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("wits", "BSc Engineering (Civil)", "bsc-eng-civil", "Engineering", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("wits", "BCom General", "bcom-general", "Commerce, Law & Management", 34,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  await addProgram("wits", "BCom Accounting", "bcom-accounting", "Commerce, Law & Management", 36,
    [{ slug: "mathematics", minLevel: 5 }]);
  await addProgram("wits", "BA General", "ba-general", "Humanities", 28,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }]);
  await addProgram("wits", "BA Law", "ba-law", "Commerce, Law & Management", 36,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }]);
  await addProgram("wits", "LLB", "llb", "Commerce, Law & Management", 38,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }], { durationYears: 4 });
  await addProgram("wits", "MBBCh (Medicine)", "mbbch", "Health Sciences", 40,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 6 }, { slug: "life-sciences", minLevel: 5 }], { durationYears: 6 });
  await addProgram("wits", "BSc Actuarial Science", "bsc-actuarial-science", "Science", 40,
    [{ slug: "mathematics", minLevel: 7 }]);
  await addProgram("wits", "BEd (Teaching)", "bed", "Humanities", 28,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  await addProgram("wits", "BSc Quantity Surveying", "bsc-quantity-surveying", "Engineering", 34,
    [{ slug: "mathematics", minLevel: 5 }], { durationYears: 4 });

  // ─── UP Programs ─────────────────────────────────────────
  console.log("🎓 Seeding UP programs...");
  await addProgram("up", "BSc Computer Science", "bsc-computer-science", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("up", "BEng (Electrical)", "beng-electrical", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("up", "BEng (Mechanical)", "beng-mechanical", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("up", "BEng (Civil)", "beng-civil", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("up", "BCom General", "bcom-general", "Economic & Management Sciences", 30,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  await addProgram("up", "BCom Accounting Sciences", "bcom-accounting", "Economic & Management Sciences", 35,
    [{ slug: "mathematics", minLevel: 6 }]);
  await addProgram("up", "BA Humanities", "ba-humanities", "Humanities", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("up", "BA Law", "ba-law", "Law", 35,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("up", "LLB", "llb", "Law", 35,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  await addProgram("up", "MBChB (Medicine)", "mbchb", "Health Sciences", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }, { slug: "life-sciences", minLevel: 5 }], { durationYears: 6 });
  await addProgram("up", "BSc Actuarial and Financial Mathematics", "bsc-actuarial", "Natural & Agricultural Sciences", 38,
    [{ slug: "mathematics", minLevel: 7 }]);
  await addProgram("up", "BEd (Teaching)", "bed", "Education", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  await addProgram("up", "BSc Information Technology", "bsc-it", "Engineering, Built Environment & IT", 32,
    [{ slug: "mathematics", minLevel: 5 }]);
  await addProgram("up", "BCom Economics", "bcom-economics", "Economic & Management Sciences", 32,
    [{ slug: "mathematics", minLevel: 5 }]);
  await addProgram("up", "BA Psychology", "ba-psychology", "Humanities", 32,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);

  // ─── UJ Programs ─────────────────────────────────────────
  console.log("🎓 Seeding UJ programs...");
  await addProgram("uj", "BSc Computer Science", "bsc-computer-science", "Science", 30,
    [{ slug: "mathematics", minLevel: 5 }]);
  await addProgram("uj", "BSc IT (Information Technology)", "bsc-it", "Science", 28,
    [{ slug: "mathematics", minLevel: 4 }]);
  await addProgram("uj", "BEng (Electrical)", "beng-electrical", "Engineering", 32,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("uj", "BEng (Mechanical)", "beng-mechanical", "Engineering", 32,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("uj", "BCom General", "bcom-general", "College of Business & Economics", 28,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  await addProgram("uj", "BCom Accounting", "bcom-accounting", "College of Business & Economics", 32,
    [{ slug: "mathematics", minLevel: 5 }]);
  await addProgram("uj", "BA General", "ba-general", "Humanities", 26,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }]);
  await addProgram("uj", "BA Law", "ba-law", "Law", 30,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("uj", "LLB", "llb", "Law", 33,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  await addProgram("uj", "BNursing", "bnursing", "Health Sciences", 28,
    [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, { slug: "life-sciences", minLevel: 4 }], { durationYears: 4 });
  await addProgram("uj", "BSc Biokinetics", "bsc-biokinetics", "Health Sciences", 32,
    [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4 }], { durationYears: 4 });
  await addProgram("uj", "BEd (Teaching)", "bed", "Education", 26,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  await addProgram("uj", "Diploma in Hospitality Management", "dip-hospitality", "College of Business & Economics", 22,
    [{ slug: "english-hl", minLevel: 3, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }],
    { qualificationType: "diploma" });

  // ─── Stellenbosch Programs ───────────────────────────────
  console.log("🎓 Seeding Stellenbosch programs...");
  await addProgram("stellenbosch", "BSc Computer Science", "bsc-computer-science", "Science", 34,
    [{ slug: "mathematics", minLevel: 6 }]);
  await addProgram("stellenbosch", "BEng (Electrical & Electronic)", "beng-electrical", "Engineering", 36,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("stellenbosch", "BEng (Mechanical)", "beng-mechanical", "Engineering", 36,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("stellenbosch", "BEng (Civil)", "beng-civil", "Engineering", 36,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  await addProgram("stellenbosch", "BCom General", "bcom-general", "Economic & Management Sciences", 32,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  await addProgram("stellenbosch", "BCom Accounting", "bcom-accounting", "Economic & Management Sciences", 35,
    [{ slug: "mathematics", minLevel: 6 }]);
  await addProgram("stellenbosch", "BA Humanities", "ba-humanities", "Arts & Social Sciences", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("stellenbosch", "BA Law", "ba-law", "Law", 34,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  await addProgram("stellenbosch", "LLB", "llb", "Law", 35,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  await addProgram("stellenbosch", "MBChB (Medicine)", "mbchb", "Medicine & Health Sciences", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }, { slug: "life-sciences", minLevel: 5 }], { durationYears: 6 });
  await addProgram("stellenbosch", "BSc Actuarial Science", "bsc-actuarial-science", "Economic & Management Sciences", 38,
    [{ slug: "mathematics", minLevel: 7 }]);
  await addProgram("stellenbosch", "BA Social Work", "ba-social-work", "Arts & Social Sciences", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  await addProgram("stellenbosch", "BEd (Teaching)", "bed", "Education", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  await addProgram("stellenbosch", "BSc Mathematical Sciences", "bsc-mathematical-sciences", "Science", 34,
    [{ slug: "mathematics", minLevel: 6 }]);

  console.log("\n✅ Database seeded successfully!");
}

seed().catch(console.error);
