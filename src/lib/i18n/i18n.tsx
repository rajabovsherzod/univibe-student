"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";

import uz from "./translations/uz.json";
import en from "./translations/en.json";
import ru from "./translations/ru.json";

export type Locale = "uz" | "en" | "ru";

const translations: Record<Locale, Record<string, any>> = { uz, en, ru };

export const locales: Locale[] = ["uz", "en", "ru"];

export const LOCALE_LABELS: Record<Locale, { label: string }> = {
  uz: { label: "O'zbekcha" },
  en: { label: "English" },
  ru: { label: "Русский" },
};

const STORAGE_KEY = "locale";
export const DEFAULT_LOCALE: Locale = "uz";

// ── Helpers ────────────────────────────────────────────────────────────
function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? path;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

// ── Context ────────────────────────────────────────────────────────────
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => { },
  t: (key) => key,
});

// ── Provider ───────────────────────────────────────────────────────────
// initialLocale comes from the SERVER (read from cookie in layout.tsx)
// → SSR renders correct language → no flash at all
export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale && initialLocale in translations ? initialLocale : DEFAULT_LOCALE
  );

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    // Write to BOTH localStorage and cookie
    // localStorage → fast sync read for client components
    // cookie → server reads it in layout.tsx for correct SSR
    localStorage.setItem(STORAGE_KEY, newLocale);
    setCookie(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => getNestedValue(translations[locale], key),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────
export function useTranslation() {
  return useContext(I18nContext);
}
