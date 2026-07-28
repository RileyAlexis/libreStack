// src/components/themeProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import type { PaletteMode } from "@mui/material";

type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "librestack-theme";

function getSystemPreference(): PaletteMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveMode(theme: ThemePreference): PaletteMode {
  return theme === "system" ? getSystemPreference() : theme;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ThemePreference) ?? "system";
  });

  const [mode, setMode] = useState<PaletteMode>(() => resolveMode(theme));

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  useEffect(() => {
    setMode(resolveMode(theme));

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setMode(getSystemPreference());

    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (
        listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void,
      ) => void;
      removeListener?: (
        listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void,
      ) => void;
    };

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    legacyMediaQuery.addListener?.(handleChange);

    return () => {
      legacyMediaQuery.removeListener?.(handleChange);
    };
  }, [theme]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#de9e27",
          },
          secondary: {
            main: "#92805e",
          },
          background: {
            default: "#f7e6ca",
            paper: "#faf1e2",
          },
          warning: {
            main: "#e24303",
          },
          info: {
            main: "#004e77",
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
