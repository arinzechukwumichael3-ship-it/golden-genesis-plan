import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createElement } from "react";

export type Theme = "light" | "dark";

type ThemeCtx = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("ye-theme") as Theme) ?? "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ye-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return createElement(ThemeContext.Provider, { value: { theme, toggle } }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
