"use client";

import { createContext, useContext, useEffect, useState } from "react";
import fr from "@/lib/translations/fr";
import en from "@/lib/translations/en";

export type Language = "fr" | "en";
const translations = { fr, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isFrench: boolean;
  isEnglish: boolean;
  t: (key: string) => string;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getTranslation(source: Record<string, any>, key: string): string {
  const value = key.split(".").reduce<any>((current, part) => current?.[part], source);
  return typeof value === "string" ? value : key;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("promos-world-language");
    const next: Language = saved === "en" ? "en" : "fr";
    setLanguageState(next);
    document.documentElement.lang = next;
    setReady(true);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    localStorage.setItem("promos-world-language", next);
    document.documentElement.lang = next;
  };

  return (
    <LanguageContext.Provider value={{
      language, setLanguage,
      toggleLanguage: () => setLanguage(language === "fr" ? "en" : "fr"),
      isFrench: language === "fr",
      isEnglish: language === "en",
      t: (key) => getTranslation(translations[language] as Record<string, any>, key),
      ready,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage doit être utilisé à l’intérieur de LanguageProvider");
  return context;
}
