"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

interface SiteHeaderProps {
  container?: "app" | "wide";
  ctaHref?: string;
  ctaLabel?: string;
}

export default function SiteHeader({
  container = "wide",
  ctaHref = "/calculate",
  ctaLabel = "Check My APS",
}: SiteHeaderProps) {
  const pathname = usePathname();
  const containerClass = container === "app" ? "container-app" : "container-wide";

  const links = [
    { href: "/requirements", label: "Programs" },
    { href: "/simulate", label: "What If" },
    { href: "/timeline", label: "Deadlines" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 px-4 py-3"
      style={{
        background: "rgba(6,8,15,0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className={`${containerClass} flex items-center justify-between gap-3`}>
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            A
          </div>
          <span
            className="text-base font-bold hidden sm:inline"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}
          >
            AdmitScore
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm no-underline transition-opacity hover:opacity-80"
              style={{
                color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: pathname === link.href ? 600 : 400,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link href={ctaHref} className="btn-primary !py-2 !px-4 !text-xs no-underline whitespace-nowrap">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}
