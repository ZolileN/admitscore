import { DATA_UPDATED_AT } from "@/lib/constants";

export default function DataFreshnessBadge({ date = DATA_UPDATED_AT }: { date?: string }) {
  const formatted = new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
      style={{
        background: "rgba(16,185,129,0.1)",
        border: "1px solid rgba(16,185,129,0.25)",
        color: "var(--accent-emerald)",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-emerald)" }} />
      Requirements verified {formatted}
    </span>
  );
}
