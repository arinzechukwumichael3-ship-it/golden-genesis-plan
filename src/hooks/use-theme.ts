import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createElement } from "react";

export type Theme = "light" | "dark";

type ThemeCtx = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with "light" to match SSR output — read localStorage after mount
  // to avoid React hydration mismatches that wipe animations and break layouts.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("ye-theme") : null) as Theme | null;
    if (saved && saved !== theme) setTheme(saved);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ye-theme", theme);
  }, [theme, mounted]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return createElement(ThemeContext.Provider, { value: { theme, toggle } }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
