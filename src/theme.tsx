import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
const THEME_STORAGE_KEY = "yogendra-portfolio-theme";

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeCtx = createContext<ThemeContextType>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "dark" || stored === "light") return stored;
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch {
      // fallback
    }
    return "light";
  });

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");

    // Remove any conflicting inline --bg from old sessions or theme switches so CSS variables apply cleanly
    const inlineBg = root.style.getPropertyValue("--bg");
    if (
      inlineBg === "#f5f4f8" ||
      inlineBg === "#08080a" ||
      inlineBg === "#0b0b0e" ||
      (theme === "dark" && inlineBg && (inlineBg.startsWith("#f") || inlineBg.startsWith("#e") || inlineBg.startsWith("rgb(24") || inlineBg.startsWith("rgb(25"))) ||
      (theme === "light" && inlineBg && (inlineBg.startsWith("#0") || inlineBg.startsWith("#1") || inlineBg.startsWith("rgb(0") || inlineBg.startsWith("rgb(1")))
    ) {
      root.style.removeProperty("--bg");
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

