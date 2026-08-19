interface UnisaNoticeProps {
  compact?: boolean;
}

export default function UnisaNotice({ compact = false }: UnisaNoticeProps) {
  return (
    <div
      className={`rounded-xl border ${compact ? "p-3" : "p-4"}`}
      style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}
    >
      <div className="text-sm font-medium" style={{ color: "var(--accent-amber)" }}>
        UNISA admission note
      </div>
      <p className={`${compact ? "text-xs mt-1" : "text-sm mt-2"}`} style={{ color: "var(--text-secondary)" }}>
        Meeting the minimum APS does not guarantee admission. UNISA programmes are space-limited and competitive.
      </p>
    </div>
  );
}
