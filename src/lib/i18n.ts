export type Locale = "en" | "af";

export const translations = {
  en: {
    checkAps: "Check My APS",
    browsePrograms: "Browse Programs",
    calculate: "Calculate My APS",
    safeBets: "Safe Bets",
    exactMatches: "Exact Matches",
    nearMisses: "Near Misses",
    yourAps: "Your APS Score",
    totalMatches: "Total Matches",
    shareWhatsapp: "Share on WhatsApp",
    copyLink: "Copy link",
    recalculate: "Recalculate",
    about: "About",
    timeline: "Deadlines",
    simulate: "What If",
    counsellor: "Counsellor",
    needHelp: "Need help choosing?",
    chatWhatsapp: "Chat on WhatsApp",
    dataUpdated: "Requirements last verified",
    nsfasEligible: "NSFAS eligible",
    downloadPdf: "Download PDF",
  },
  af: {
    checkAps: "Kyk My APS",
    browsePrograms: "Blaai Programme",
    calculate: "Bereken My APS",
    safeBets: "Veilige Keuses",
    exactMatches: "Presiese Passings",
    nearMisses: "Byna Daar",
    yourAps: "Jou APS-telling",
    totalMatches: "Totale Passings",
    shareWhatsapp: "Deel op WhatsApp",
    copyLink: "Kopieer skakel",
    recalculate: "Herbereken",
    about: "Oor Ons",
    timeline: "Sperdatums",
    simulate: "Wat As",
    counsellor: "Berader",
    needHelp: "Hulp nodig om te kies?",
    chatWhatsapp: "Gesels op WhatsApp",
    dataUpdated: "Vereistes laas geverifieer",
    nsfasEligible: "NSFAS-geskik",
    downloadPdf: "Laai PDF af",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.en[key];
}
