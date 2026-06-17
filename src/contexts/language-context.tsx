import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, LOCALES, type Locale } from "@/i18n";

type LanguageCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string) => string;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageCtx>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("ye-locale") as Locale) ?? "en";
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("ye-locale", l);
  };

  const isRtl = LOCALES.find((lo) => lo.code === locale)?.rtl ?? false;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [locale, isRtl]);

  const t = (path: string): string => {
    const parts = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cur: any = translations[locale];
    for (const p of parts) cur = cur?.[p];
    if (typeof cur === "string") return cur;
    // Fallback to English
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let en: any = translations.en;
    for (const p of parts) en = en?.[p];
    return typeof en === "string" ? en : path;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
