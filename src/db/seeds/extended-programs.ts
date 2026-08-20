import { DATA_UPDATED_AT } from "@/lib/constants";

export type SubjectReq = { slug: string; minLevel: number; groupId?: number };

export type ProgramSeed = {
  uniSlug: string;
  name: string;
  slug: string;
  faculty: string;
  minAps: number;
  subjectReqs: SubjectReq[];
  opts?: {
    qualificationType?: string;
    durationYears?: number;
    description?: string;
    pathwayProgramSlug?: string;
    pathwayLabel?: string;
    bursaryNote?: string;
    nsfasEligible?: boolean;
  };
};

const eng = [
  { slug: "english-hl", minLevel: 4, groupId: 1 },
  { slug: "english-fal", minLevel: 4, groupId: 1 },
] as const;

const engLoose = [
  { slug: "english-hl", minLevel: 2, groupId: 1 },
  { slug: "english-fal", minLevel: 2, groupId: 1 },
] as const;

const hcertBase = {
  qualificationType: "higher_certificate",
  durationYears: 1,
  nsfasEligible: true,
} as const;

/** Additional universities + programmes (APS from official 2025/2026 prospectuses). */
export const EXTRA_UNIVERSITIES = [
  { name: "North-West University", slug: "nwu", province: "North West", websiteUrl: "https://www.nwu.ac.za", apsSystemType: "standard" },
  { name: "University of KwaZulu-Natal", slug: "ukzn", province: "KwaZulu-Natal", websiteUrl: "https://ukzn.ac.za", apsSystemType: "ukzn_bonus" },
  { name: "Nelson Mandela University", slug: "nmu", province: "Eastern Cape", websiteUrl: "https://mandela.ac.za", apsSystemType: "standard" },
  { name: "Cape Peninsula University of Technology", slug: "cput", province: "Western Cape", websiteUrl: "https://www.cput.ac.za", apsSystemType: "standard" },
  { name: "Tshwane University of Technology", slug: "tut", province: "Gauteng", websiteUrl: "https://www.tut.ac.za", apsSystemType: "standard" },
  { name: "Durban University of Technology", slug: "dut", province: "KwaZulu-Natal", websiteUrl: "https://www.dut.ac.za", apsSystemType: "standard" },
  { name: "False Bay TVET College", slug: "falsebay", province: "Western Cape", websiteUrl: "https://www.falsebay.org.za", apsSystemType: "standard" },
];

export const EXTRA_PROGRAMS: ProgramSeed[] = [
  // NWU — FNAS prospectus: BSc combinations APS 26, Maths L5, Physical Science L4
  { uniSlug: "nwu", name: "BSc Computer Science & Mathematics", slug: "bsc-computer-science", faculty: "Natural & Agricultural Sciences", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng],
    opts: { description: "NWU Potchefstroom/Vanderbijlpark. Maths L5 + Physical Science L4 required." } },
  { uniSlug: "nwu", name: "BSc Information Technology", slug: "bsc-it", faculty: "Natural & Agricultural Sciences", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, ...eng] },
  { uniSlug: "nwu", name: "BEng Electrical & Electronic Engineering", slug: "beng-electrical", faculty: "Engineering", minAps: 34,
    subjectReqs: [{ slug: "mathematics", minLevel: 7 }, { slug: "physical-sciences", minLevel: 7 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "nwu", name: "BCom General", slug: "bcom-general", faculty: "Economic & Management Sciences", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng] },
  { uniSlug: "nwu", name: "BCom Accounting", slug: "bcom-accounting", faculty: "Economic & Management Sciences", minAps: 32,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, ...eng] },
  { uniSlug: "nwu", name: "LLB", slug: "llb", faculty: "Law", minAps: 30,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "nwu", name: "BEd Foundation Phase Teaching", slug: "bed-foundation", faculty: "Education", minAps: 26,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "nwu", name: "BSc Actuarial Science", slug: "bsc-actuarial", faculty: "Natural & Agricultural Sciences", minAps: 32,
    subjectReqs: [{ slug: "mathematics", minLevel: 6 }, ...eng] },
  { uniSlug: "nwu", name: "BA Psychology", slug: "ba-psychology", faculty: "Humanities", minAps: 26,
    subjectReqs: [...eng] },
  { uniSlug: "nwu", name: "BSc Biological Sciences", slug: "bsc-biological-sciences", faculty: "Natural & Agricultural Sciences", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng] },

  // UKZN — bonus APS for 90%+; BSc CS&IT APS 28 mainstream (Maths L4 + science L4)
  { uniSlug: "ukzn", name: "BSc Computer Science & Information Technology", slug: "bsc-computer-science", faculty: "Agriculture, Engineering & Science", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, { slug: "physical-sciences", minLevel: 4, groupId: 2 }, { slug: "life-sciences", minLevel: 4, groupId: 2 }, { slug: "agricultural-sciences", minLevel: 4, groupId: 2 }, ...eng],
    opts: { description: "UKZN uses bonus APS (8 points for 90%+). Mainstream requires Maths L4 and a science at L4." } },
  { uniSlug: "ukzn", name: "BSc Mathematics (Augmented)", slug: "bsc-maths-augmented", faculty: "Agriculture, Engineering & Science", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 3 }, { slug: "physical-sciences", minLevel: 3, groupId: 2 }, { slug: "life-sciences", minLevel: 3, groupId: 2 }, ...eng],
    opts: { qualificationType: "extended_degree", durationYears: 4 } },
  { uniSlug: "ukzn", name: "BCom General", slug: "bcom-general", faculty: "Law & Management Studies", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng] },
  { uniSlug: "ukzn", name: "BCom Accounting", slug: "bcom-accounting", faculty: "Law & Management Studies", minAps: 32,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, ...eng] },
  { uniSlug: "ukzn", name: "LLB", slug: "llb", faculty: "Law & Management Studies", minAps: 32,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "ukzn", name: "MBChB (Medicine)", slug: "mbchb", faculty: "Health Sciences", minAps: 36,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 5 }, { slug: "life-sciences", minLevel: 5 }, ...eng],
    opts: { durationYears: 6, bursaryNote: "Health sciences selection is highly competitive beyond minimum APS." } },
  { uniSlug: "ukzn", name: "BEng Civil Engineering", slug: "beng-civil", faculty: "Agriculture, Engineering & Science", minAps: 32,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 5 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "ukzn", name: "BEd Foundation Phase", slug: "bed-foundation", faculty: "Humanities & Social Sciences", minAps: 26,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "ukzn", name: "BA Social Science", slug: "ba-social-science", faculty: "Humanities & Social Sciences", minAps: 26,
    subjectReqs: [...eng] },
  { uniSlug: "ukzn", name: "BSc Nursing", slug: "bnursing", faculty: "Health Sciences", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, { slug: "life-sciences", minLevel: 4 }, ...eng],
    opts: { durationYears: 4 } },

  // NMU — competitive BSc programmes typically APS 36+
  { uniSlug: "nmu", name: "BSc Computer Science", slug: "bsc-computer-science", faculty: "Science", minAps: 36,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng] },
  { uniSlug: "nmu", name: "BCom General", slug: "bcom-general", faculty: "Business & Economic Sciences", minAps: 30,
    subjectReqs: [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng] },
  { uniSlug: "nmu", name: "BCom Accounting", slug: "bcom-accounting", faculty: "Business & Economic Sciences", minAps: 35,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, ...eng] },
  { uniSlug: "nmu", name: "BEng Mechanical Engineering", slug: "beng-mechanical", faculty: "Engineering", minAps: 38,
    subjectReqs: [{ slug: "mathematics", minLevel: 6 }, { slug: "physical-sciences", minLevel: 5 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "nmu", name: "LLB", slug: "llb", faculty: "Law", minAps: 35,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "nmu", name: "BEd Foundation Phase", slug: "bed-foundation", faculty: "Education", minAps: 30,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "nmu", name: "BA Psychology", slug: "ba-psychology", faculty: "Humanities", minAps: 32,
    subjectReqs: [...eng] },
  { uniSlug: "nmu", name: "Diploma in Hospitality Management", slug: "dip-hospitality", faculty: "Business & Economic Sciences", minAps: 24,
    subjectReqs: [...eng], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "nmu", name: "BSc Environmental Sciences", slug: "bsc-environmental", faculty: "Science", minAps: 34,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4, groupId: 2 }, { slug: "physical-sciences", minLevel: 4, groupId: 2 }, ...eng] },
  { uniSlug: "nmu", name: "BSc Biochemistry", slug: "bsc-biochemistry", faculty: "Science", minAps: 36,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 5 }, { slug: "life-sciences", minLevel: 5 }, ...eng] },

  // CPUT — university of technology
  { uniSlug: "cput", name: "BSc Information Technology", slug: "bsc-it", faculty: "Informatics & Design", minAps: 30,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, ...eng] },
  { uniSlug: "cput", name: "BEng Civil Engineering", slug: "beng-civil", faculty: "Engineering & Built Environment", minAps: 32,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "cput", name: "BEng Mechanical Engineering", slug: "beng-mechanical", faculty: "Engineering & Built Environment", minAps: 32,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "cput", name: "National Diploma in Accounting", slug: "ndip-accounting", faculty: "Business & Management Sciences", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng],
    opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "cput", name: "National Diploma in Hospitality Management", slug: "ndip-hospitality", faculty: "Business & Management Sciences", minAps: 24,
    subjectReqs: [...eng], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "cput", name: "BEd Foundation Phase Teaching", slug: "bed-foundation", faculty: "Education", minAps: 28,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "cput", name: "BCom Marketing", slug: "bcom-marketing", faculty: "Business & Management Sciences", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng] },
  { uniSlug: "cput", name: "BSc Biotechnology", slug: "bsc-biotechnology", faculty: "Applied Sciences", minAps: 30,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4 }, ...eng] },
  { uniSlug: "cput", name: "National Diploma in Tourism", slug: "ndip-tourism", faculty: "Business & Management Sciences", minAps: 24,
    subjectReqs: [...eng], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "cput", name: "BSc Quantity Surveying", slug: "bsc-quantity-surveying", faculty: "Engineering & Built Environment", minAps: 30,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, ...eng], opts: { durationYears: 4 } },

  // TUT
  { uniSlug: "tut", name: "BEng Electrical Engineering", slug: "beng-electrical", faculty: "Engineering & Built Environment", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "tut", name: "BEng Mechanical Engineering", slug: "beng-mechanical", faculty: "Engineering & Built Environment", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "tut", name: "BSc IT (Information Technology)", slug: "bsc-it", faculty: "Science", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, ...eng] },
  { uniSlug: "tut", name: "National Diploma in Accounting", slug: "ndip-accounting", faculty: "Economics & Finance", minAps: 24,
    subjectReqs: [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng],
    opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "tut", name: "BCom Marketing", slug: "bcom-marketing", faculty: "Economics & Finance", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng] },
  { uniSlug: "tut", name: "BEd Foundation Phase", slug: "bed-foundation", faculty: "Humanities", minAps: 26,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "tut", name: "National Diploma in Hospitality", slug: "ndip-hospitality", faculty: "Management Sciences", minAps: 22,
    subjectReqs: [...eng], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "tut", name: "BSc Biotechnology", slug: "bsc-biotechnology", faculty: "Science", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4 }, ...eng] },
  { uniSlug: "tut", name: "LLB", slug: "llb", faculty: "Law", minAps: 30,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "tut", name: "National Diploma in Tourism", slug: "ndip-tourism", faculty: "Management Sciences", minAps: 22,
    subjectReqs: [...eng], opts: { qualificationType: "diploma", durationYears: 3 } },

  // DUT
  { uniSlug: "dut", name: "BEng Civil Engineering", slug: "beng-civil", faculty: "Engineering & Built Environment", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "dut", name: "BEng Mechanical Engineering", slug: "beng-mechanical", faculty: "Engineering & Built Environment", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 5 }, { slug: "physical-sciences", minLevel: 4 }, ...eng], opts: { durationYears: 4 } },
  { uniSlug: "dut", name: "National Diploma in Accounting", slug: "ndip-accounting", faculty: "Accounting & Informatics", minAps: 24,
    subjectReqs: [{ slug: "mathematics", minLevel: 4, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng],
    opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "dut", name: "BCom Marketing", slug: "bcom-marketing", faculty: "Management Sciences", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 5, groupId: 1 }, ...eng] },
  { uniSlug: "dut", name: "National Diploma in Hospitality", slug: "ndip-hospitality", faculty: "Management Sciences", minAps: 22,
    subjectReqs: [...eng], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "dut", name: "BSc IT (Information Technology)", slug: "bsc-it", faculty: "Applied Sciences", minAps: 26,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, ...eng] },
  { uniSlug: "dut", name: "BEd Foundation Phase", slug: "bed-foundation", faculty: "Arts & Design", minAps: 26,
    subjectReqs: [...eng], opts: { durationYears: 4 } },
  { uniSlug: "dut", name: "National Diploma in Tourism", slug: "ndip-tourism", faculty: "Management Sciences", minAps: 22,
    subjectReqs: [...eng], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "dut", name: "BSc Biotechnology", slug: "bsc-biotechnology", faculty: "Applied Sciences", minAps: 28,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, { slug: "life-sciences", minLevel: 4 }, ...eng] },
  { uniSlug: "dut", name: "LLB", slug: "llb", faculty: "Law", minAps: 30,
    subjectReqs: [...eng], opts: { durationYears: 4 } },

  // False Bay TVET — NCV/NATED-style entry mapped to NSC APS equivalents
  { uniSlug: "falsebay", name: "National Certificate (Vocational) IT & Computer Science", slug: "ncv-it", faculty: "Engineering & ICT", minAps: 18,
    subjectReqs: [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 4, groupId: 1 }, ...engLoose],
    opts: { qualificationType: "diploma", durationYears: 3, description: "TVET entry uses NCV Level 4 or NSC with vocational subjects. APS shown as NSC equivalent." } },
  { uniSlug: "falsebay", name: "National Certificate (Vocational) Engineering Studies", slug: "ncv-engineering", faculty: "Engineering & ICT", minAps: 18,
    subjectReqs: [{ slug: "mathematics", minLevel: 3 }, { slug: "physical-sciences", minLevel: 3 }, ...engLoose],
    opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "falsebay", name: "National Certificate (Vocational) Hospitality", slug: "ncv-hospitality", faculty: "Business & Hospitality", minAps: 16,
    subjectReqs: [...engLoose], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "falsebay", name: "National Certificate (Vocational) Tourism", slug: "ncv-tourism", faculty: "Business & Hospitality", minAps: 16,
    subjectReqs: [...engLoose], opts: { qualificationType: "diploma", durationYears: 3 } },
  { uniSlug: "falsebay", name: "National Certificate (Vocational) Office Administration", slug: "ncv-office-admin", faculty: "Business & Hospitality", minAps: 16,
    subjectReqs: [...engLoose], opts: { qualificationType: "diploma", durationYears: 3 } },
];

/** All UNISA Higher Certificates from official qualification list (APS 15, NQF 5). */
export const UNISA_HIGHER_CERTIFICATES: ProgramSeed[] = [
  { uniSlug: "unisa", name: "Higher Certificate in Accounting Sciences", slug: "hcert-accounting", faculty: "Economic & Management Sciences", minAps: 15,
    subjectReqs: [{ slug: "mathematics", minLevel: 3, groupId: 1 }, { slug: "mathematical-literacy", minLevel: 4, groupId: 1 }, ...engLoose],
    opts: { ...hcertBase, pathwayProgramSlug: "bcom-accounting", pathwayLabel: "Progress to BCom Accounting Sciences", description: "Qualification code 98201." } },
  { uniSlug: "unisa", name: "Higher Certificate in Animal Welfare", slug: "hcert-animal-welfare", faculty: "Agriculture & Environmental Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 90098." } },
  { uniSlug: "unisa", name: "Higher Certificate in Archives and Records Management", slug: "hcert-archives", faculty: "Human Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 98577." } },
  { uniSlug: "unisa", name: "Higher Certificate in Banking", slug: "hcert-banking", faculty: "Economic & Management Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 98225." } },
  { uniSlug: "unisa", name: "Higher Certificate in Criminal Justice", slug: "hcert-criminal-justice", faculty: "Human Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 90006." } },
  { uniSlug: "unisa", name: "Higher Certificate in Economic and Management Sciences", slug: "hcert-ems", faculty: "Economic & Management Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, pathwayProgramSlug: "bcom-general", pathwayLabel: "Progress to BCom General", description: "Qualification code 98237." } },
  { uniSlug: "unisa", name: "Higher Certificate in Education (Foundation & Intermediate Phase)", slug: "hcert-ed-foundation", faculty: "Education", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, pathwayProgramSlug: "bed-foundation", pathwayLabel: "Progress to BEd Foundation Phase", description: "Qualification code 90093-FIP." } },
  { uniSlug: "unisa", name: "Higher Certificate in Education (Senior Phase Maths & Science)", slug: "hcert-ed-sms", faculty: "Education", minAps: 15,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, { slug: "physical-sciences", minLevel: 3, groupId: 2 }, { slug: "life-sciences", minLevel: 3, groupId: 2 }, ...engLoose],
    opts: { ...hcertBase, description: "Qualification code 90093-SMS." } },
  { uniSlug: "unisa", name: "Higher Certificate in Education (Senior Phase & FET)", slug: "hcert-ed-spf", faculty: "Education", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, pathwayProgramSlug: "bed-senior-fet", pathwayLabel: "Progress to BEd Senior Phase & FET", description: "Qualification code 90093-SPF." } },
  { uniSlug: "unisa", name: "Higher Certificate in Law", slug: "hcert-law", faculty: "Law", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, pathwayProgramSlug: "llb", pathwayLabel: "Progress to LLB", description: "Qualification code 98751." } },
  { uniSlug: "unisa", name: "Higher Certificate in Life and Environmental Sciences", slug: "hcert-life-env", faculty: "Science, Engineering & Technology", minAps: 15,
    subjectReqs: [{ slug: "life-sciences", minLevel: 3, groupId: 2 }, { slug: "physical-sciences", minLevel: 3, groupId: 2 }, ...engLoose],
    opts: { ...hcertBase, pathwayProgramSlug: "bsc-life-sciences", pathwayLabel: "Progress to BSc Life Sciences", description: "Qualification code 98366." } },
  { uniSlug: "unisa", name: "Higher Certificate in Marketing", slug: "hcert-marketing", faculty: "Economic & Management Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 98229." } },
  { uniSlug: "unisa", name: "Higher Certificate in Mathematics and Statistics", slug: "hcert-maths-stats", faculty: "Science, Engineering & Technology", minAps: 15,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, ...engLoose],
    opts: { ...hcertBase, description: "Qualification code 90129. Requires 40% in Mathematics." } },
  { uniSlug: "unisa", name: "Higher Certificate in Music", slug: "hcert-music", faculty: "Human Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 90194. Audition may be required." } },
  { uniSlug: "unisa", name: "Higher Certificate in Physical Sciences", slug: "hcert-physical-sciences", faculty: "Science, Engineering & Technology", minAps: 15,
    subjectReqs: [{ slug: "mathematics", minLevel: 4 }, { slug: "physical-sciences", minLevel: 4 }, ...engLoose],
    opts: { ...hcertBase, description: "Qualification code 90101." } },
  { uniSlug: "unisa", name: "Higher Certificate in Retailing", slug: "hcert-retailing", faculty: "Economic & Management Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 90014." } },
  { uniSlug: "unisa", name: "Higher Certificate in Social Auxiliary Work", slug: "hcert-social-work", faculty: "Human Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 90011." } },
  { uniSlug: "unisa", name: "Higher Certificate in Supervisory Management", slug: "hcert-supervisory-mgmt", faculty: "Economic & Management Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 90015." } },
  { uniSlug: "unisa", name: "Higher Certificate in Tourism Management", slug: "hcert-tourism", faculty: "Economic & Management Sciences", minAps: 15,
    subjectReqs: [...engLoose], opts: { ...hcertBase, description: "Qualification code 98226." } },
];
