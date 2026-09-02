"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  return (
    <button
      type="button"
      className="language-switcher"
      onClick={() =>
        setLanguage(
          language === "fr" ? "en" : "fr"
        )
      }
      aria-label="Change language"
    >
      {language === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
    </button>
  );
}