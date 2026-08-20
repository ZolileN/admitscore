// ─── APS Calculation Utilities ──────────────────────────────
// South African National Senior Certificate scoring

/**
 * Convert a percentage mark (0-100) to a 7-point achievement level.
 * This is the standard NSC conversion used by most SA universities.
 */
export function percentageToLevel(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
}

/** UKZN awards 8 APS points for 90%+ (other unis cap at 7). */
export function percentageToApsPoints(mark: number, useUkznBonus = false): number {
  if (useUkznBonus && mark >= 90) return 8;
  return percentageToLevel(mark);
}

/**
 * Convert a 7-point level back to its minimum percentage threshold.
 */
export function levelToMinPercentage(level: number): number {
  const thresholds: Record<number, number> = {
    7: 80,
    6: 70,
    5: 60,
    4: 50,
    3: 40,
    2: 30,
    1: 0,
  };
  return thresholds[level] ?? 0;
}

export type LifeOrientationRule = "exclude" | "halve" | "cap4" | "include";

export interface APSOptions {
  lifeOrientationRule?: LifeOrientationRule;
  lifeOrientationSubjectId?: number;
  useUkznBonus?: boolean;
}

export interface SubjectMark {
  subjectId: number;
  mark: number;
}

/**
 * Calculate the APS score from student marks.
 *
 * Standard rules:
 * - Convert each subject % to a 1-7 level
 * - Most universities: exclude Life Orientation, sum best 6
 * - Wits: include LO but cap at 4 points, sum best 7
 * - Some: halve LO points
 */
export function calculateAPS(
  marks: SubjectMark[],
  options: APSOptions = {}
): number {
  const { lifeOrientationRule = "exclude", lifeOrientationSubjectId, useUkznBonus = false } = options;

  let levels = marks.map((m) => ({
    subjectId: m.subjectId,
    level: percentageToApsPoints(m.mark, useUkznBonus),
    isLO: m.subjectId === lifeOrientationSubjectId,
  }));

  // Apply LO rule
  if (lifeOrientationRule === "exclude") {
    levels = levels.filter((l) => !l.isLO);
  } else if (lifeOrientationRule === "halve") {
    levels = levels.map((l) =>
      l.isLO ? { ...l, level: Math.round(l.level / 2) } : l
    );
  } else if (lifeOrientationRule === "cap4") {
    levels = levels.map((l) =>
      l.isLO ? { ...l, level: Math.min(l.level, 4) } : l
    );
  }

  // Sort descending and take best 6 (or 7 if LO included)
  levels.sort((a, b) => b.level - a.level);
  const count = lifeOrientationRule === "exclude" ? 6 : 7;
  const best = levels.slice(0, Math.min(count, levels.length));

  return best.reduce((sum, l) => sum + l.level, 0);
}

/**
 * Get the maximum possible APS (all 7s).
 */
export function getMaxAPS(rule: LifeOrientationRule = "exclude", useUkznBonus = false): number {
  const top = useUkznBonus ? 8 : 7;
  if (rule === "exclude") return 6 * top;
  if (rule === "cap4") return 6 * top + 4;
  return 7 * top;
}
