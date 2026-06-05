// ─── NSC Subject Data ───────────────────────────────────────
// Complete list of South African National Senior Certificate subjects

export interface SubjectData {
  name: string;
  slug: string;
  category: string;
  isCore: boolean;
}

export const NSC_SUBJECTS: SubjectData[] = [
  // ── Core / Compulsory ──
  { name: "English Home Language", slug: "english-hl", category: "language", isCore: true },
  { name: "English First Additional Language", slug: "english-fal", category: "language", isCore: true },
  { name: "Afrikaans Home Language", slug: "afrikaans-hl", category: "language", isCore: true },
  { name: "Afrikaans First Additional Language", slug: "afrikaans-fal", category: "language", isCore: true },
  { name: "IsiZulu Home Language", slug: "isizulu-hl", category: "language", isCore: true },
  { name: "IsiZulu First Additional Language", slug: "isizulu-fal", category: "language", isCore: true },
  { name: "IsiXhosa Home Language", slug: "isixhosa-hl", category: "language", isCore: true },
  { name: "IsiXhosa First Additional Language", slug: "isixhosa-fal", category: "language", isCore: true },
  { name: "Sesotho Home Language", slug: "sesotho-hl", category: "language", isCore: true },
  { name: "Sesotho First Additional Language", slug: "sesotho-fal", category: "language", isCore: true },
  { name: "Setswana Home Language", slug: "setswana-hl", category: "language", isCore: true },
  { name: "Setswana First Additional Language", slug: "setswana-fal", category: "language", isCore: true },
  { name: "Sepedi Home Language", slug: "sepedi-hl", category: "language", isCore: true },
  { name: "Sepedi First Additional Language", slug: "sepedi-fal", category: "language", isCore: true },
  { name: "Tshivenda Home Language", slug: "tshivenda-hl", category: "language", isCore: true },
  { name: "Tshivenda First Additional Language", slug: "tshivenda-fal", category: "language", isCore: true },
  { name: "Xitsonga Home Language", slug: "xitsonga-hl", category: "language", isCore: true },
  { name: "Xitsonga First Additional Language", slug: "xitsonga-fal", category: "language", isCore: true },
  { name: "IsiNdebele Home Language", slug: "isindebele-hl", category: "language", isCore: true },
  { name: "IsiNdebele First Additional Language", slug: "isindebele-fal", category: "language", isCore: true },
  { name: "Siswati Home Language", slug: "siswati-hl", category: "language", isCore: true },
  { name: "Siswati First Additional Language", slug: "siswati-fal", category: "language", isCore: true },
  { name: "Mathematics", slug: "mathematics", category: "mathematics", isCore: true },
  { name: "Mathematical Literacy", slug: "mathematical-literacy", category: "mathematics", isCore: true },
  { name: "Life Orientation", slug: "life-orientation", category: "core", isCore: true },

  // ── Elective Subjects ──
  { name: "Physical Sciences", slug: "physical-sciences", category: "sciences", isCore: false },
  { name: "Life Sciences", slug: "life-sciences", category: "sciences", isCore: false },
  { name: "Accounting", slug: "accounting", category: "commerce", isCore: false },
  { name: "Business Studies", slug: "business-studies", category: "commerce", isCore: false },
  { name: "Economics", slug: "economics", category: "commerce", isCore: false },
  { name: "Geography", slug: "geography", category: "humanities", isCore: false },
  { name: "History", slug: "history", category: "humanities", isCore: false },
  { name: "Information Technology", slug: "information-technology", category: "technology", isCore: false },
  { name: "Computer Applications Technology", slug: "computer-applications-technology", category: "technology", isCore: false },
  { name: "Engineering Graphics and Design", slug: "engineering-graphics-and-design", category: "technology", isCore: false },
  { name: "Agricultural Sciences", slug: "agricultural-sciences", category: "sciences", isCore: false },
  { name: "Agricultural Management Practices", slug: "agricultural-management-practices", category: "sciences", isCore: false },
  { name: "Agricultural Technology", slug: "agricultural-technology", category: "technology", isCore: false },
  { name: "Consumer Studies", slug: "consumer-studies", category: "humanities", isCore: false },
  { name: "Tourism", slug: "tourism", category: "humanities", isCore: false },
  { name: "Hospitality Studies", slug: "hospitality-studies", category: "humanities", isCore: false },
  { name: "Dramatic Arts", slug: "dramatic-arts", category: "arts", isCore: false },
  { name: "Visual Arts", slug: "visual-arts", category: "arts", isCore: false },
  { name: "Music", slug: "music", category: "arts", isCore: false },
  { name: "Dance Studies", slug: "dance-studies", category: "arts", isCore: false },
  { name: "Civil Technology", slug: "civil-technology", category: "technology", isCore: false },
  { name: "Electrical Technology", slug: "electrical-technology", category: "technology", isCore: false },
  { name: "Mechanical Technology", slug: "mechanical-technology", category: "technology", isCore: false },
  { name: "Religion Studies", slug: "religion-studies", category: "humanities", isCore: false },
];
