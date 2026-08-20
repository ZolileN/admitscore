import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import PageViewTracker from "@/components/PageViewTracker";

export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {domain ? (
        <Script
          defer
          data-domain={domain}
          src="https://plausible.io/js/script.tagged-events.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
