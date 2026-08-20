import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import PageViewTracker from "@/components/PageViewTracker";

const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC ?? "https://cloud.umami.is/script.js";
const UMAMI_WEBSITE_ID =
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? "354486ec-894e-4700-af87-e12ac4ba6101";

export default function Analytics() {
  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <Script
        defer
        src={UMAMI_SRC}
        data-website-id={UMAMI_WEBSITE_ID}
        strategy="afterInteractive"
      />
    </>
  );
}
