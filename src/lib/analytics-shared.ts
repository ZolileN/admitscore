export type AnalyticsEventName =
  | "page_view"
  | "aps_calculated"
  | "match_completed"
  | "whatsapp_click"
  | "mlk_cta_click"
  | "pdf_export"
  | "program_viewed"
  | "share_whatsapp"
  | "copy_results_link";

export type AnalyticsProperties = Record<string, string | number | boolean>;

export function bucketAps(aps: number): string {
  if (aps <= 15) return "0-15";
  if (aps <= 20) return "16-20";
  if (aps <= 25) return "21-25";
  if (aps <= 30) return "26-30";
  if (aps <= 35) return "31-35";
  return "36+";
}

export function bucketCount(count: number): string {
  if (count === 0) return "0";
  if (count <= 5) return "1-5";
  if (count <= 15) return "6-15";
  if (count <= 30) return "16-30";
  return "31+";
}
