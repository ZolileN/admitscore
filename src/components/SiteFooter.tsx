import Link from "next/link";
import { MLK_COMPUTER_URL } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="py-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-xs"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            A
          </div>
          <span className="text-sm font-semibold">AdmitScore</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} AdmitScore. Free for every South African student. Not affiliated with any university.
          </p>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <p>
            A product of{" "}
            <Link
              href={MLK_COMPUTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              MLK Computer Consulting
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
