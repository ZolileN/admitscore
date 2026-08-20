"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent, trackUmamiPageView } from "@/lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    trackUmamiPageView(url);
    trackEvent("page_view", {
      path: pathname,
      has_query: searchParams.toString() ? "yes" : "no",
    });
  }, [pathname, searchParams]);

  return null;
}
