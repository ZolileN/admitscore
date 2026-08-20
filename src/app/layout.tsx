import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import Analytics from "@/components/Analytics";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdmitScore — South Africa's Free APS Calculator & University Matcher",
  description:
    "Check your APS score and instantly see which South African university programs you qualify for. Free, fast, and mobile-friendly. Covers UCT, Wits, UP, UJ, Stellenbosch, UNISA, NWU, UKZN, NMU, CPUT, TUT, DUT and more.",
  keywords: [
    "APS calculator",
    "South Africa university",
    "matric results",
    "university admission requirements",
    "NSC score",
    "UNISA higher certificate",
    "NWU requirements",
    "UKZN requirements",
  ],
  openGraph: {
    title: "AdmitScore — Know Where You Stand. Instantly.",
    description:
      "South Africa's free APS calculator and admissions matching engine. Check your eligibility for programs across top SA universities in seconds.",
    type: "website",
    locale: "en_ZA",
    siteName: "AdmitScore",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "AdmitScore" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#06080f" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        <LocaleProvider>
          <div className="mesh-gradient" aria-hidden="true" />
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
          <WhatsAppButton />
          <Analytics />
        </LocaleProvider>
      </body>
    </html>
  );
}
