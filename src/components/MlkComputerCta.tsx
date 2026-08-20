"use client";

import Link from "next/link";
import { MLK_COMPUTER_CONTACT_URL } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

interface MlkComputerCtaProps {
  location?: string;
}

export default function MlkComputerCta({ location = "results" }: MlkComputerCtaProps) {
  return (
    <div
      className="glass-card-static p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ borderColor: "rgba(59,130,246,0.2)" }}
    >
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Getting ready for university?
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          MLK Computer Consulting supplies reliable student laptops and IT support across South Africa.
        </p>
      </div>
      <Link
        href={MLK_COMPUTER_CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("mlk_cta_click", { location })}
        className="btn-primary !text-sm !px-6 !py-3 no-underline whitespace-nowrap shrink-0"
      >
        Contact MLK Computer Consulting
      </Link>
    </div>
  );
}
