import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdmitScore — South Africa's Free APS Calculator & University Matcher",
  description:
    "Check your APS score and instantly see which South African university programs you qualify for. Free, fast, and mobile-friendly. Covers UCT, Wits, UP, UJ & Stellenbosch.",
  keywords: [
    "APS calculator",
    "South Africa university",
    "matric results",
    "university admission requirements",
    "NSC score",
    "UCT requirements",
    "Wits requirements",
    "UP requirements",
    "UJ requirements",
    "Stellenbosch requirements",
  ],
  openGraph: {
    title: "AdmitScore — Know Where You Stand. Instantly.",
    description:
      "South Africa's free APS calculator and admissions matching engine. Check your eligibility for 70+ programs across top SA universities in seconds.",
    type: "website",
    locale: "en_ZA",
  },
  robots: { index: true, follow: true },
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
      </head>
      <body className="antialiased">
        <div className="mesh-gradient" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
