import { NSC_SUBJECTS } from "./subjects";

const slugToIndex = new Map(NSC_SUBJECTS.map((subject, index) => [subject.slug, index]));

export interface ResultsSubjectEntry {
  subjectSlug: string;
  mark: number;
}

export function encodeResultsParam(entries: ResultsSubjectEntry[]) {
  return entries.map((entry) => `${entry.subjectSlug}:${entry.mark}`).join(",");
}

export function parseResultsParam(param: string | null): ResultsSubjectEntry[] {
  if (!param) return [];

  return param
    .split(",")
    .map((entry) => {
      const [subjectKey, markStr] = entry.split(":");
      const mark = parseInt(markStr, 10);
      if (!subjectKey || Number.isNaN(mark)) return null;

      if (slugToIndex.has(subjectKey)) {
        return { subjectSlug: subjectKey, mark };
      }

      const legacyIndex = parseInt(subjectKey, 10);
      const legacySubject = NSC_SUBJECTS[legacyIndex];
      if (legacySubject) {
        return { subjectSlug: legacySubject.slug, mark };
      }

      return null;
    })
    .filter((entry): entry is ResultsSubjectEntry => entry !== null);
}

export const SAVED_MARKS_KEY = "admitscore-saved-marks";

export interface SavedMarksPayload {
  subjects: Array<{ subjectSlug: string; mark: string }>;
  savedAt: string;
}

export function saveMarksToStorage(subjects: SavedMarksPayload["subjects"]) {
  if (typeof window === "undefined") return;

  const payload: SavedMarksPayload = {
    subjects,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(SAVED_MARKS_KEY, JSON.stringify(payload));
}

export function loadMarksFromStorage(): SavedMarksPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SAVED_MARKS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedMarksPayload;
  } catch {
    return null;
  }
}

export function buildWhatsAppShareUrl(studentAps: number, totalMatches: number, resultsUrl: string) {
  const text = encodeURIComponent(
    `I checked my APS on AdmitScore: ${studentAps}/42 with ${totalMatches} matching programmes. See my results: ${resultsUrl}`
  );

  return `https://wa.me/?text=${text}`;
}
