"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent("page_view", {
      path: pathname,
      has_query: searchParams.toString() ? "yes" : "no",
    });
  }, [pathname, searchParams]);

  return null;
}
