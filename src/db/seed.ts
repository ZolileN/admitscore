import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { NSC_SUBJECTS } from "../lib/subjects";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

// ─── Helper ─────────────────────────────────────────────────
function getSubjectId(slug: string): number {
  const s = subjectMap.get(slug);
  if (!s) throw new Error(`Subject not found: ${slug}`);
  return s;
}
const subjectMap = new Map<string, number>();

async function seed() {
  console.log("🌱 Seeding AdmitScore database...\n");

  // ── Create tables ──
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS universities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      province TEXT NOT NULL,
      logo_url TEXT,
      website_url TEXT,
      aps_system_type TEXT NOT NULL DEFAULT 'standard'
    );
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      is_core INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      university_id INTEGER NOT NULL REFERENCES universities(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      faculty TEXT NOT NULL,
      qualification_type TEXT NOT NULL DEFAULT 'degree',
      duration_years INTEGER NOT NULL DEFAULT 3,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS program_aps_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL UNIQUE REFERENCES programs(id),
      min_aps_score INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_subject_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL REFERENCES programs(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      min_level INTEGER NOT NULL,
      group_id INTEGER
    );
  `);

  // ── Clear existing data ──
  sqlite.exec("DELETE FROM program_subject_rules");
  sqlite.exec("DELETE FROM program_aps_rules");
  sqlite.exec("DELETE FROM programs");
  sqlite.exec("DELETE FROM subjects");
  sqlite.exec("DELETE FROM universities");

  // ── Seed Subjects ──
  console.log("📚 Seeding subjects...");
  for (const s of NSC_SUBJECTS) {
    const result = db.insert(schema.subjects).values({
      name: s.name, slug: s.slug, category: s.category, isCore: s.isCore,
    }).returning().get();
    subjectMap.set(s.slug, result.id);
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
    const result = db.insert(schema.universities).values(u).returning().get();
    uniMap.set(u.slug, result.id);
  }
  console.log(`   ✓ ${unis.length} universities\n`);

  // ── Helper to add a program ──
  function addProgram(
    uniSlug: string, name: string, slug: string, faculty: string,
    minAps: number, subjectReqs: { slug: string; minLevel: number; groupId?: number }[],
    opts?: { qualificationType?: string; durationYears?: number; description?: string }
  ) {
    const universityId = uniMap.get(uniSlug)!;
    const program = db.insert(schema.programs).values({
      universityId, name, slug, faculty,
      qualificationType: opts?.qualificationType || "degree",
      durationYears: opts?.durationYears || 3,
      description: opts?.description || null,
    }).returning().get();

    db.insert(schema.programApsRules).values({ programId: program.id, minApsScore: minAps }).run();

    for (const req of subjectReqs) {
      db.insert(schema.programSubjectRules).values({
        programId: program.id,
        subjectId: getSubjectId(req.slug),
        minLevel: req.minLevel,
        groupId: req.groupId ?? null,
      }).run();
    }
    return program;
  }

  // ─── UCT Programs ────────────────────────────────────────
  console.log("🎓 Seeding UCT programs...");
  addProgram("uct", "BSc Computer Science", "bsc-computer-science", "Science", 36,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }],
    { description: "Study algorithms, data structures, and software engineering." });
  addProgram("uct", "BSc Engineering (Electrical)", "bsc-eng-electrical", "Engineering & Built Environment", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("uct", "BSc Engineering (Mechanical)", "bsc-eng-mechanical", "Engineering & Built Environment", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("uct", "BSc Engineering (Civil)", "bsc-eng-civil", "Engineering & Built Environment", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("uct", "Bachelor of Commerce", "bcom", "Commerce", 36,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("uct", "BCom Accounting", "bcom-accounting", "Commerce", 37,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("uct", "Bachelor of Business Science", "bbussci", "Commerce", 38,
    [{ slug: "mathematics", minLevel: 6 }]);
  addProgram("uct", "BA Humanities", "ba-humanities", "Humanities", 33,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("uct", "BA Law", "ba-law", "Law", 36,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }]);
  addProgram("uct", "LLB", "llb", "Law", 36,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }], { durationYears: 4 });
  addProgram("uct", "MBChB (Medicine)", "mbchb", "Health Sciences", 42,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 6 }, { slug: "life-sciences", minLevel: 6 }], { durationYears: 6 });
  addProgram("uct", "BSc Biological Sciences", "bsc-biological-sciences", "Science", 34,
    [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4, groupId: 1 }, { slug: "physical-sciences", minLevel: 4, groupId: 1 }]);
  addProgram("uct", "BSc Mathematics", "bsc-mathematics", "Science", 36,
    [{ slug: "mathematics", minLevel: 6 }]);
  addProgram("uct", "BSc Actuarial Science", "bsc-actuarial-science", "Commerce", 40,
    [{ slug: "mathematics", minLevel: 7 }]);
  addProgram("uct", "BA Social Work", "ba-social-work", "Humanities", 33,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });

  // ─── Wits Programs ───────────────────────────────────────
  console.log("🎓 Seeding Wits programs...");
  addProgram("wits", "BSc Computer Science", "bsc-computer-science", "Science", 34,
    [{ slug: "mathematics", minLevel: 5 }]);
  addProgram("wits", "BSc Engineering (Electrical)", "bsc-eng-electrical", "Engineering", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("wits", "BSc Engineering (Mechanical)", "bsc-eng-mechanical", "Engineering", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("wits", "BSc Engineering (Civil)", "bsc-eng-civil", "Engineering", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("wits", "BCom General", "bcom-general", "Commerce, Law & Management", 34,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  addProgram("wits", "BCom Accounting", "bcom-accounting", "Commerce, Law & Management", 36,
    [{ slug: "mathematics", minLevel: 5 }]);
  addProgram("wits", "BA General", "ba-general", "Humanities", 28,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }]);
  addProgram("wits", "BA Law", "ba-law", "Commerce, Law & Management", 36,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }]);
  addProgram("wits", "LLB", "llb", "Commerce, Law & Management", 38,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 6, groupId: 1 }], { durationYears: 4 });
  addProgram("wits", "MBBCh (Medicine)", "mbbch", "Health Sciences", 40,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 6 }, { slug: "life-sciences", minLevel: 5 }], { durationYears: 6 });
  addProgram("wits", "BSc Actuarial Science", "bsc-actuarial-science", "Science", 40,
    [{ slug: "mathematics", minLevel: 7 }]);
  addProgram("wits", "BEd (Teaching)", "bed", "Humanities", 28,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  addProgram("wits", "BSc Quantity Surveying", "bsc-quantity-surveying", "Engineering", 34,
    [{ slug: "mathematics", minLevel: 5 }], { durationYears: 4 });

  // ─── UP Programs ─────────────────────────────────────────
  console.log("🎓 Seeding UP programs...");
  addProgram("up", "BSc Computer Science", "bsc-computer-science", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("up", "BEng (Electrical)", "beng-electrical", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("up", "BEng (Mechanical)", "beng-mechanical", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("up", "BEng (Civil)", "beng-civil", "Engineering, Built Environment & IT", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("up", "BCom General", "bcom-general", "Economic & Management Sciences", 30,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  addProgram("up", "BCom Accounting Sciences", "bcom-accounting", "Economic & Management Sciences", 35,
    [{ slug: "mathematics", minLevel: 6 }]);
  addProgram("up", "BA Humanities", "ba-humanities", "Humanities", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("up", "BA Law", "ba-law", "Law", 35,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("up", "LLB", "llb", "Law", 35,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  addProgram("up", "MBChB (Medicine)", "mbchb", "Health Sciences", 35,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }, { slug: "life-sciences", minLevel: 5 }], { durationYears: 6 });
  addProgram("up", "BSc Actuarial and Financial Mathematics", "bsc-actuarial", "Natural & Agricultural Sciences", 38,
    [{ slug: "mathematics", minLevel: 7 }]);
  addProgram("up", "BEd (Teaching)", "bed", "Education", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  addProgram("up", "BSc Information Technology", "bsc-it", "Engineering, Built Environment & IT", 32,
    [{ slug: "mathematics", minLevel: 5 }]);
  addProgram("up", "BCom Economics", "bcom-economics", "Economic & Management Sciences", 32,
    [{ slug: "mathematics", minLevel: 5 }]);
  addProgram("up", "BA Psychology", "ba-psychology", "Humanities", 32,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);

  // ─── UJ Programs ─────────────────────────────────────────
  console.log("🎓 Seeding UJ programs...");
  addProgram("uj", "BSc Computer Science", "bsc-computer-science", "Science", 30,
    [{ slug: "mathematics", minLevel: 5 }]);
  addProgram("uj", "BSc IT (Information Technology)", "bsc-it", "Science", 28,
    [{ slug: "mathematics", minLevel: 4 }]);
  addProgram("uj", "BEng (Electrical)", "beng-electrical", "Engineering", 32,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("uj", "BEng (Mechanical)", "beng-mechanical", "Engineering", 32,
    [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("uj", "BCom General", "bcom-general", "College of Business & Economics", 28,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  addProgram("uj", "BCom Accounting", "bcom-accounting", "College of Business & Economics", 32,
    [{ slug: "mathematics", minLevel: 5 }]);
  addProgram("uj", "BA General", "ba-general", "Humanities", 26,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }]);
  addProgram("uj", "BA Law", "ba-law", "Law", 30,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("uj", "LLB", "llb", "Law", 33,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  addProgram("uj", "BNursing", "bnursing", "Health Sciences", 28,
    [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, { slug: "life-sciences", minLevel: 4 }], { durationYears: 4 });
  addProgram("uj", "BSc Biokinetics", "bsc-biokinetics", "Health Sciences", 32,
    [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4 }], { durationYears: 4 });
  addProgram("uj", "BEd (Teaching)", "bed", "Education", 26,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  addProgram("uj", "Diploma in Hospitality Management", "dip-hospitality", "College of Business & Economics", 22,
    [{ slug: "english-hl", minLevel: 3, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }],
    { qualificationType: "diploma" });

  // ─── Stellenbosch Programs ───────────────────────────────
  console.log("🎓 Seeding Stellenbosch programs...");
  addProgram("stellenbosch", "BSc Computer Science", "bsc-computer-science", "Science", 34,
    [{ slug: "mathematics", minLevel: 6 }]);
  addProgram("stellenbosch", "BEng (Electrical & Electronic)", "beng-electrical", "Engineering", 36,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("stellenbosch", "BEng (Mechanical)", "beng-mechanical", "Engineering", 36,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("stellenbosch", "BEng (Civil)", "beng-civil", "Engineering", 36,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }], { durationYears: 4 });
  addProgram("stellenbosch", "BCom General", "bcom-general", "Economic & Management Sciences", 32,
    [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 6, groupId: 1 }]);
  addProgram("stellenbosch", "BCom Accounting", "bcom-accounting", "Economic & Management Sciences", 35,
    [{ slug: "mathematics", minLevel: 6 }]);
  addProgram("stellenbosch", "BA Humanities", "ba-humanities", "Arts & Social Sciences", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("stellenbosch", "BA Law", "ba-law", "Law", 34,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }]);
  addProgram("stellenbosch", "LLB", "llb", "Law", 35,
    [{ slug: "english-hl", minLevel: 5, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  addProgram("stellenbosch", "MBChB (Medicine)", "mbchb", "Medicine & Health Sciences", 38,
    [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }, { slug: "life-sciences", minLevel: 5 }], { durationYears: 6 });
  addProgram("stellenbosch", "BSc Actuarial Science", "bsc-actuarial-science", "Economic & Management Sciences", 38,
    [{ slug: "mathematics", minLevel: 7 }]);
  addProgram("stellenbosch", "BA Social Work", "ba-social-work", "Arts & Social Sciences", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 5, groupId: 1 }], { durationYears: 4 });
  addProgram("stellenbosch", "BEd (Teaching)", "bed", "Education", 30,
    [{ slug: "english-hl", minLevel: 4, groupId: 1 }, { slug: "english-fal", minLevel: 4, groupId: 1 }], { durationYears: 4 });
  addProgram("stellenbosch", "BSc Mathematical Sciences", "bsc-mathematical-sciences", "Science", 34,
    [{ slug: "mathematics", minLevel: 6 }]);

  console.log("\n✅ Database seeded successfully!");
  console.log(`   Total subjects: ${NSC_SUBJECTS.length}`);
  console.log(`   Total universities: ${unis.length}`);

  const programCount = sqlite.prepare("SELECT COUNT(*) as count FROM programs").get() as { count: number };
  console.log(`   Total programs: ${programCount.count}`);
}

seed().catch(console.error);
