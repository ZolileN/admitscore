// ─── App Constants ──────────────────────────────────────────

export const APP_NAME = "AdmitScore";
export const APP_TAGLINE = "Know Where You Stand. Instantly.";
export const APP_DESCRIPTION =
  "South Africa's free APS calculator and university admissions matching engine. Check your eligibility for 80+ programs across top SA universities in seconds.";

export const SITE_URL = "https://admitscore.co.za";

export const APS_LEVEL_LABELS: Record<number, string> = {
  7: "Outstanding",
  6: "Meritorious",
  5: "Substantial",
  4: "Adequate",
  3: "Moderate",
  2: "Elementary",
  1: "Not Achieved",
};

export const APS_LEVEL_COLORS: Record<number, string> = {
  7: "#10b981", // emerald
  6: "#22c55e", // green
  5: "#3b82f6", // blue
  4: "#f59e0b", // amber
  3: "#f97316", // orange
  2: "#ef4444", // red
  1: "#991b1b", // dark red
};

export const CATEGORY_LABELS = {
  safe: "Safe Bets",
  exact: "Exact Matches",
  near: "Near Misses",
} as const;

export const CATEGORY_DESCRIPTIONS = {
  safe: "You comfortably meet all requirements. These are strong options.",
  exact: "You meet the minimum requirements. Competitive but possible.",
  near: "You're close but missing something. Here's what to improve.",
} as const;

// Life Orientation subject slug
export const LIFE_ORIENTATION_SLUG = "life-orientation";

// Minimum subjects needed for calculation
export const MIN_SUBJECTS = 7;
export const MAX_SUBJECTS = 9;
