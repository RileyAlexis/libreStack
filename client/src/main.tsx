import React, { useState, useEffect, createContext, useContext } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import "@radix-ui/themes/styles.css";

type ThemeType = "light" | "dark" | "auto";

interface ThemeContextValue {
  theme: ThemeType;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function ThemedContainer({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "auto"
      ? savedTheme
      : "auto";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateResolvedTheme = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light"); // fix 1
    };

    updateResolvedTheme();
    mediaQuery.addEventListener("change", updateResolvedTheme);
    return () => mediaQuery.removeEventListener("change", updateResolvedTheme); // fix 2
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      <Theme
        accentColor="pink"
        grayColor="sand"
        appearance={resolvedTheme}
        panelBackground="translucent"
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

const rootElement = document.getElementById("root")!;

if (!rootElement.hasAttribute("data-rooted")) {
  rootElement.setAttribute("data-rooted", "true");
  createRoot(rootElement).render(
    <StrictMode>
      <ThemedContainer>
        <App />
      </ThemedContainer>
    </StrictMode>,
  );
}
