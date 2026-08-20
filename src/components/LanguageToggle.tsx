"use client";

import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  const toggle = () => setLocale(locale === "en" ? "af" : "en");

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-secondary !py-2 !px-3 !text-xs"
      aria-label="Toggle language"
      title={locale === "en" ? "Switch to Afrikaans" : "Wissel na Engels"}
    >
      {locale === "en" ? "EN" : "AF"}
    </button>
  );
}
