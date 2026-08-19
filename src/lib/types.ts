// ─── TypeScript Types for AdmitScore ────────────────────────

export interface StudentSubject {
  subjectId: number;
  subjectName: string;
  mark: number;
  level: number;
}

export interface SubjectRequirement {
  subjectId: number;
  subjectName: string;
  minLevel: number;
  groupId: number | null;
  met: boolean;
  studentLevel: number | null;
  gap: number; // positive = shortfall, 0 = met
}

export interface ProgramMatch {
  programId: number;
  programName: string;
  programSlug: string;
  universityId: number;
  universityName: string;
  universitySlug: string;
  faculty: string;
  qualificationType: string;
  durationYears: number;
  requiredAps: number;
  studentAps: number;
  apsGap: number; // positive = shortfall
  subjectRequirements: SubjectRequirement[];
  category: "safe" | "exact" | "near";
  nearMissSummary?: string | null;
}

export interface MatchResults {
  studentAps: number;
  totalPrograms: number;
  results: {
    safeBets: ProgramMatch[];
    exactMatches: ProgramMatch[];
    nearMisses: ProgramMatch[];
  };
}

export interface GapDetail {
  subjectName: string;
  currentLevel: number;
  requiredLevel: number;
  currentMark: number;
  requiredMinMark: number;
  gap: number;
}

// ─── Calculator State ───────────────────────────────────────

export interface CalculatorSubject {
  id: string; // unique key for React
  subjectId: number | null;
  subjectName: string;
  mark: string; // string for controlled input
  isCompulsory: boolean;
}

// ─── Subject Data ───────────────────────────────────────────

export interface SubjectOption {
  id: number;
  name: string;
  slug: string;
  category: string;
  isCore: boolean;
}
