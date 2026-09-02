"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import fr from "@/lib/translations/fr";
import en from "@/lib/translations/en";

export type Language = "fr" | "en";

const translations = {
  fr,
  en,
};

type TranslationObject = typeof fr;

type TranslationKey =
  | "common.home"
  | "common.promotions"
  | "common.dashboard"
  | "common.profile"
  | "common.messages"
  | "common.wallet"
  | "common.login"
  | "common.logout"
  | "common.register"
  | "common.loading"
  | "common.error"
  | "common.success"
  | "common.cancel"
  | "common.save"
  | "common.delete"
  | "common.back"
  | "common.search"
  | "nav.home"
  | "nav.promotions"
  | "nav.reservations"
  | "nav.transactions"
  | "nav.messages"
  | "nav.wallet"
  | "nav.profile"
  | "nav.admin"
  | "home.title"
  | "home.subtitle"
  | "auth.login"
  | "auth.signup"
  | "auth.email"
  | "auth.password"
  | "auth.forgotPassword"
  | "promotions.title"
  | "promotions.subtitle"
  | "promotions.search"
  | "promotions.all"
  | "promotions.noResults"
  | "promotions.loading"
  | "promotions.seller"
  | "promotions.available"
  | "promotions.availablePlural"
  | "promotions.soldOut";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isFrench: boolean;
  isEnglish: boolean;
  t: (key: TranslationKey) => string;
  ready: boolean;
}

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

function getTranslation(
  translationsObject: TranslationObject,
  key: TranslationKey
): string {
  const parts = key.split(".");

  let value: unknown = translationsObject;

  for (const part of parts) {
    if (
      typeof value !== "object" ||
      value === null
    ) {
      return key;
    }

    value = (
      value as Record<string, unknown>
    )[part];
  }

  return typeof value === "string"
    ? value
    : key;
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("fr");

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "promos-world-language"
      );

    if (
      savedLanguage === "fr" ||
      savedLanguage === "en"
    ) {
      setLanguageState(savedLanguage);
      document.documentElement.lang =
        savedLanguage;
    } else {
      document.documentElement.lang = "fr";
    }

    setReady(true);
  }, []);

  const setLanguage = (
    newLanguage: Language
  ) => {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "promos-world-language",
      newLanguage
    );

    document.documentElement.lang =
      newLanguage;
  };

  const toggleLanguage = () => {
    setLanguage(
      language === "fr" ? "en" : "fr"
    );
  };

  const t = (key: TranslationKey) => {
    return getTranslation(
      translations[language],
      key
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isFrench: language === "fr",
        isEnglish: language === "en",
        t,
        ready,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage doit être utilisé à l’intérieur de LanguageProvider"
    );
  }

  return context;
}