import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP";

type Info = { code: CurrencyCode; symbol: string; label: string; rateFromEUR: number };

// Static FX rates relative to EUR. Display only — not used for settlement.
export const CURRENCIES: Record<CurrencyCode, Info> = {
  EUR: { code: "EUR", symbol: "€", label: "Euro", rateFromEUR: 1 },
  USD: { code: "USD", symbol: "$", label: "US Dollar", rateFromEUR: 1.08 },
  GBP: { code: "GBP", symbol: "£", label: "British Pound", rateFromEUR: 0.85 },
};

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  info: Info;
  /** Convert an EUR amount into the active currency (rounded). */
  fromEUR: (eurAmount: number) => number;
  /** Format an amount that is already in the active currency. */
  format: (amount: number, opts?: { maximumFractionDigits?: number }) => string;
  /** Convenience: convert EUR → active and format with symbol. */
  formatFromEUR: (eurAmount: number, opts?: { maximumFractionDigits?: number }) => string;
};

const CurrencyContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "yec.currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("EUR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && CURRENCIES[saved]) setCurrencyState(saved);
    } catch {}
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  };

  const info = CURRENCIES[currency];
  const fromEUR = (eur: number) => Math.round(eur * info.rateFromEUR);
  const format = (amount: number, opts?: { maximumFractionDigits?: number }) =>
    `${info.symbol}${amount.toLocaleString(undefined, {
      maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
    })}`;
  const formatFromEUR = (eur: number, opts?: { maximumFractionDigits?: number }) =>
    format(fromEUR(eur), opts);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, info, fromEUR, format, formatFromEUR }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
